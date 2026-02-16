"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import socketService from "@/services/socketService";
import {
    FileSystemItem,
    FileContextType,
    Id,
    FileName,
    FileContent,
} from "@/types/fileTypes";
import {
    initialFileStructure,
    getFileById,
    findParentDirectory,
    isNameExist,
    updateItemInStructure,
    removeItemFromStructure,
} from "@/utils/fileUtils";

const FileContext = createContext<FileContextType | null>(null);

export function useFileSystem(): FileContextType {
    const context = useContext(FileContext);
    if (!context) {
        throw new Error("useFileSystem must be used within a FileContextProvider");
    }
    return context;
}

interface FileContextProviderProps {
    roomId: string;
    children: React.ReactNode;
}

export function FileContextProvider({ roomId, children }: FileContextProviderProps) {
    const [fileStructure, setFileStructure] = useState<FileSystemItem>(
        initialFileStructure()
    );
    const [openFiles, setOpenFiles] = useState<FileSystemItem[]>([]);
    const [activeFile, setActiveFile] = useState<FileSystemItem | null>(null);

    // === FILE OPERATIONS ===

    const createFile = useCallback(
        (parentDirId: Id, name: FileName): Id => {
            const newFile: FileSystemItem = {
                id: uuidv4(),
                name,
                type: "file",
                content: "",
            };

            setFileStructure((prev) =>
                updateItemInStructure(prev, parentDirId, (dir) => ({
                    ...dir,
                    children: [...(dir.children || []), newFile],
                    isOpen: true,
                }))
            );

            // Open the new file
            setOpenFiles((prev) => [...prev, newFile]);
            setActiveFile(newFile);

            // Broadcast to room
            socketService.emit("file_created", {
                parentDirId,
                newFile,
            });

            return newFile.id;
        },
        []
    );

    const updateFileContent = useCallback(
        (fileId: Id, content: FileContent) => {
            if (!fileId) return;

            setFileStructure((prev) =>
                updateItemInStructure(prev, fileId, (file) => ({
                    ...file,
                    content,
                }))
            );

            // Update in openFiles and activeFile
            setOpenFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, content } : f))
            );
            setActiveFile((prev) =>
                prev && prev.id === fileId ? { ...prev, content } : prev
            );
        },
        []
    );

    const openFile = useCallback(
        (fileId: Id) => {
            const file = getFileById(fileStructure, fileId);
            if (!file || file.type !== "file") return;

            setOpenFiles((prev) => {
                if (prev.some((f) => f.id === fileId)) return prev;
                return [...prev, file];
            });
            setActiveFile(file);
        },
        [fileStructure]
    );

    const closeFile = useCallback(
        (fileId: Id) => {
            setOpenFiles((prev) => {
                const filtered = prev.filter((f) => f.id !== fileId);
                // If closing active file, switch to the last open or null
                if (activeFile?.id === fileId) {
                    const newActive = filtered.length > 0 ? filtered[filtered.length - 1] : null;
                    setActiveFile(newActive);
                }
                return filtered;
            });
        },
        [activeFile]
    );

    const renameFile = useCallback(
        (fileId: Id, newName: FileName): boolean => {
            const parentDir = findParentDirectory(fileStructure, fileId);
            if (parentDir && isNameExist(parentDir, newName, fileId)) {
                return false; // Name conflict
            }

            setFileStructure((prev) =>
                updateItemInStructure(prev, fileId, (file) => ({
                    ...file,
                    name: newName,
                }))
            );

            setOpenFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
            );
            setActiveFile((prev) =>
                prev && prev.id === fileId ? { ...prev, name: newName } : prev
            );

            socketService.emit("file_renamed", { fileId, newName });
            return true;
        },
        [fileStructure]
    );

    const deleteFile = useCallback(
        (fileId: Id) => {
            setFileStructure((prev) => removeItemFromStructure(prev, fileId));

            // Close if open
            setOpenFiles((prev) => {
                const filtered = prev.filter((f) => f.id !== fileId);
                if (activeFile?.id === fileId) {
                    setActiveFile(filtered.length > 0 ? filtered[filtered.length - 1] : null);
                }
                return filtered;
            });

            socketService.emit("file_deleted", { fileId });
        },
        [activeFile]
    );

    // === DIRECTORY OPERATIONS ===

    const createDirectory = useCallback(
        (parentDirId: Id, name: FileName): Id => {
            const newDir: FileSystemItem = {
                id: uuidv4(),
                name,
                type: "directory",
                children: [],
                isOpen: false,
            };

            setFileStructure((prev) =>
                updateItemInStructure(prev, parentDirId, (dir) => ({
                    ...dir,
                    children: [...(dir.children || []), newDir],
                    isOpen: true,
                }))
            );

            socketService.emit("directory_created", {
                parentDirId,
                newDirectory: newDir,
            });

            return newDir.id;
        },
        []
    );

    const toggleDirectory = useCallback((dirId: Id) => {
        setFileStructure((prev) =>
            updateItemInStructure(prev, dirId, (dir) => ({
                ...dir,
                isOpen: !dir.isOpen,
            }))
        );
    }, []);

    const collapseDirectories = useCallback(() => {
        const collapseAll = (item: FileSystemItem): FileSystemItem => ({
            ...item,
            isOpen: item.id === fileStructure.id ? true : false, // Keep root open
            children: item.children?.map(collapseAll),
        });
        setFileStructure((prev) => collapseAll(prev));
    }, [fileStructure.id]);

    const renameDirectory = useCallback(
        (dirId: Id, newName: FileName) => {
            const parentDir = findParentDirectory(fileStructure, dirId);
            if (parentDir && isNameExist(parentDir, newName, dirId)) return;

            setFileStructure((prev) =>
                updateItemInStructure(prev, dirId, (dir) => ({
                    ...dir,
                    name: newName,
                }))
            );

            socketService.emit("directory_renamed", { dirId, newName });
        },
        [fileStructure]
    );

    const deleteDirectory = useCallback(
        (dirId: Id) => {
            // Close any open files that are inside the deleted directory
            const collectFileIds = (item: FileSystemItem): Id[] => {
                if (item.type === "file") return [item.id];
                return item.children?.flatMap(collectFileIds) || [];
            };

            const dir = getFileById(fileStructure, dirId);
            if (dir) {
                const fileIds = collectFileIds(dir);
                setOpenFiles((prev) => {
                    const filtered = prev.filter((f) => !fileIds.includes(f.id));
                    if (activeFile && fileIds.includes(activeFile.id)) {
                        setActiveFile(filtered.length > 0 ? filtered[filtered.length - 1] : null);
                    }
                    return filtered;
                });
            }

            setFileStructure((prev) => removeItemFromStructure(prev, dirId));
            socketService.emit("directory_deleted", { dirId });
        },
        [fileStructure, activeFile]
    );

    // === SOCKET LISTENERS FOR REMOTE CHANGES ===

    useEffect(() => {
        // When another user joins, send them the current file structure
        const handleUserJoined = (data: any) => {
            if (data.user?.socketId) {
                socketService.emit("sync_file_structure", {
                    socketId: data.user.socketId,
                    fileStructure,
                    openFiles,
                    activeFile,
                });
            }
        };

        // Receive file structure from the first user when joining
        const handleSyncFileStructure = (data: any) => {
            if (data.fileStructure) {
                setFileStructure(data.fileStructure);
            }
            if (data.openFiles) {
                setOpenFiles(data.openFiles);
            }
            if (data.activeFile) {
                setActiveFile(data.activeFile);
            }
        };

        // Remote file created
        const handleFileCreated = (data: any) => {
            if (data.parentDirId && data.newFile) {
                setFileStructure((prev) =>
                    updateItemInStructure(prev, data.parentDirId, (dir) => ({
                        ...dir,
                        children: [...(dir.children || []), data.newFile],
                        isOpen: true,
                    }))
                );
            }
        };

        // Remote file content updated
        const handleFileUpdated = (data: any) => {
            if (data.fileId && data.newContent !== undefined) {
                setFileStructure((prev) =>
                    updateItemInStructure(prev, data.fileId, (file) => ({
                        ...file,
                        content: data.newContent,
                    }))
                );
                setOpenFiles((prev) =>
                    prev.map((f) =>
                        f.id === data.fileId ? { ...f, content: data.newContent } : f
                    )
                );
                setActiveFile((prev) =>
                    prev && prev.id === data.fileId
                        ? { ...prev, content: data.newContent }
                        : prev
                );
            }
        };

        // Remote file renamed
        const handleFileRenamed = (data: any) => {
            if (data.fileId && data.newName) {
                setFileStructure((prev) =>
                    updateItemInStructure(prev, data.fileId, (file) => ({
                        ...file,
                        name: data.newName,
                    }))
                );
                setOpenFiles((prev) =>
                    prev.map((f) =>
                        f.id === data.fileId ? { ...f, name: data.newName } : f
                    )
                );
                setActiveFile((prev) =>
                    prev && prev.id === data.fileId
                        ? { ...prev, name: data.newName }
                        : prev
                );
            }
        };

        // Remote file deleted
        const handleFileDeleted = (data: any) => {
            if (data.fileId) {
                setFileStructure((prev) => removeItemFromStructure(prev, data.fileId));
                setOpenFiles((prev) => prev.filter((f) => f.id !== data.fileId));
                setActiveFile((prev) =>
                    prev && prev.id === data.fileId ? null : prev
                );
            }
        };

        // Remote directory created
        const handleDirectoryCreated = (data: any) => {
            if (data.parentDirId && data.newDirectory) {
                setFileStructure((prev) =>
                    updateItemInStructure(prev, data.parentDirId, (dir) => ({
                        ...dir,
                        children: [...(dir.children || []), data.newDirectory],
                        isOpen: true,
                    }))
                );
            }
        };

        // Remote directory renamed  
        const handleDirectoryRenamed = (data: any) => {
            if (data.dirId && data.newName) {
                setFileStructure((prev) =>
                    updateItemInStructure(prev, data.dirId, (dir) => ({
                        ...dir,
                        name: data.newName,
                    }))
                );
            }
        };

        // Remote directory deleted
        const handleDirectoryDeleted = (data: any) => {
            if (data.dirId) {
                setFileStructure((prev) =>
                    removeItemFromStructure(prev, data.dirId)
                );
            }
        };

        socketService.on("user_joined", handleUserJoined);
        socketService.on("sync_file_structure", handleSyncFileStructure);
        socketService.on("file_created", handleFileCreated);
        socketService.on("file_updated", handleFileUpdated);
        socketService.on("file_renamed", handleFileRenamed);
        socketService.on("file_deleted", handleFileDeleted);
        socketService.on("directory_created", handleDirectoryCreated);
        socketService.on("directory_renamed", handleDirectoryRenamed);
        socketService.on("directory_deleted", handleDirectoryDeleted);

        return () => {
            socketService.off("user_joined", handleUserJoined);
            socketService.off("sync_file_structure", handleSyncFileStructure);
            socketService.off("file_created", handleFileCreated);
            socketService.off("file_updated", handleFileUpdated);
            socketService.off("file_renamed", handleFileRenamed);
            socketService.off("file_deleted", handleFileDeleted);
            socketService.off("directory_created", handleDirectoryCreated);
            socketService.off("directory_renamed", handleDirectoryRenamed);
            socketService.off("directory_deleted", handleDirectoryDeleted);
        };
    }, [fileStructure, openFiles, activeFile]);

    const contextValue: FileContextType = useMemo(
        () => ({
            fileStructure,
            setFileStructure,
            openFiles,
            activeFile,
            setActiveFile,
            closeFile,
            toggleDirectory,
            collapseDirectories,
            createDirectory,
            renameDirectory,
            deleteDirectory,
            createFile,
            updateFileContent,
            openFile,
            renameFile,
            deleteFile,
        }),
        [
            fileStructure,
            openFiles,
            activeFile,
            closeFile,
            toggleDirectory,
            collapseDirectories,
            createDirectory,
            renameDirectory,
            deleteDirectory,
            createFile,
            updateFileContent,
            openFile,
            renameFile,
            deleteFile,
        ]
    );

    return (
        <FileContext.Provider value={contextValue}>
            {children}
        </FileContext.Provider>
    );
}

export default FileContext;
