export type Id = string;
export type FileName = string;
export type FileContent = string;

export interface FileSystemItem {
    id: Id;
    name: FileName;
    type: "file" | "directory";
    children?: FileSystemItem[];
    content?: FileContent;
    isOpen?: boolean; // For directory expand/collapse
}

export interface FileContextType {
    fileStructure: FileSystemItem;
    setFileStructure: (structure: FileSystemItem) => void;
    openFiles: FileSystemItem[];
    activeFile: FileSystemItem | null;
    setActiveFile: (file: FileSystemItem | null) => void;
    closeFile: (fileId: Id) => void;
    toggleDirectory: (dirId: Id) => void;
    collapseDirectories: () => void;
    createDirectory: (parentDirId: Id, name: FileName) => Id;
    renameDirectory: (dirId: Id, newName: FileName) => void;
    deleteDirectory: (dirId: Id) => void;
    createFile: (parentDirId: Id, name: FileName) => Id;
    updateFileContent: (fileId: Id, content: FileContent) => void;
    openFile: (fileId: Id) => void;
    renameFile: (fileId: Id, newName: FileName) => boolean;
    deleteFile: (fileId: Id) => void;
}
