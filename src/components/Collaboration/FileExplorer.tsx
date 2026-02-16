"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFileSystem } from "@/context/FileContext";
import { FileSystemItem, Id } from "@/types/fileTypes";
import { sortFileSystemItem } from "@/utils/fileUtils";
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    TextField,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface FileExplorerProps {
    onLanguageChange?: (language: string) => void;
}

export default function FileExplorer({ onLanguageChange }: FileExplorerProps) {
    const {
        fileStructure,
        createFile,
        createDirectory,
        collapseDirectories,
    } = useFileSystem();

    const [selectedDirId, setSelectedDirId] = useState<Id | null>(null);

    const handleCreateFile = () => {
        const fileName = prompt("Enter file name (e.g. index.js):");
        if (fileName && fileName.trim()) {
            const parentDirId = selectedDirId || fileStructure.id;
            createFile(parentDirId, fileName.trim());
        }
    };

    const handleCreateDirectory = () => {
        const dirName = prompt("Enter directory name:");
        if (dirName && dirName.trim()) {
            const parentDirId = selectedDirId || fileStructure.id;
            createDirectory(parentDirId, dirName.trim());
        }
    };

    const sortedStructure = sortFileSystemItem(fileStructure);

    return (
        <Box
            sx={{
                width: 220,
                minWidth: 220,
                height: "100%",
                bgcolor: "#252526",
                borderRight: "1px solid #333",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 1.5,
                    py: 0.5,
                    height: 36,
                    minHeight: 36,
                    borderBottom: "1px solid #333",
                }}
            >
                <Typography
                    variant="caption"
                    sx={{ color: "#999", fontWeight: "bold", letterSpacing: 1, fontSize: 11 }}
                >
                    EXPLORER
                </Typography>
                <Box sx={{ display: "flex", gap: 0.25 }}>
                    <Tooltip title="New File" arrow>
                        <IconButton size="small" onClick={handleCreateFile} sx={{ color: "#999", p: 0.5, "&:hover": { color: "#fff" } }}>
                            <NoteAddOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="New Folder" arrow>
                        <IconButton size="small" onClick={handleCreateDirectory} sx={{ color: "#999", p: 0.5, "&:hover": { color: "#fff" } }}>
                            <CreateNewFolderOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Collapse All" arrow>
                        <IconButton size="small" onClick={collapseDirectories} sx={{ color: "#999", p: 0.5, "&:hover": { color: "#fff" } }}>
                            <UnfoldLessIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Tree */}
            <Box sx={{ flexGrow: 1, overflow: "auto", py: 0.5, "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#555", borderRadius: 3 } }}>
                {sortedStructure.children?.map((item) => (
                    <TreeNode
                        key={item.id}
                        item={item}
                        depth={0}
                        selectedDirId={selectedDirId}
                        setSelectedDirId={setSelectedDirId}
                    />
                ))}
            </Box>
        </Box>
    );
}

// === Recursive tree node (file or directory) ===

interface TreeNodeProps {
    item: FileSystemItem;
    depth: number;
    selectedDirId: Id | null;
    setSelectedDirId: (id: Id) => void;
}

function TreeNode({ item, depth, selectedDirId, setSelectedDirId }: TreeNodeProps) {
    if (item.type === "file") {
        return <FileNode item={item} depth={depth} setSelectedDirId={setSelectedDirId} />;
    }
    return <DirectoryNode item={item} depth={depth} selectedDirId={selectedDirId} setSelectedDirId={setSelectedDirId} />;
}

// === Directory Node ===

function DirectoryNode({ item, depth, selectedDirId, setSelectedDirId }: TreeNodeProps) {
    const { toggleDirectory, deleteDirectory, renameDirectory } = useFileSystem();
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(item.name);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleClick = () => {
        setSelectedDirId(item.id);
        toggleDirectory(item.id);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleRename = () => {
        setContextMenu(null);
        setIsRenaming(true);
        setNewName(item.name);
    };

    const handleRenameSubmit = () => {
        if (newName.trim() && newName.trim() !== item.name) {
            renameDirectory(item.id, newName.trim());
        }
        setIsRenaming(false);
    };

    const handleDelete = () => {
        setContextMenu(null);
        if (confirm(`Delete directory "${item.name}" and all contents?`)) {
            deleteDirectory(item.id);
        }
    };

    const sortedItem = sortFileSystemItem(item);

    return (
        <Box>
            <Box
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    pl: 1 + depth * 1.5,
                    pr: 1,
                    py: 0.3,
                    cursor: "pointer",
                    bgcolor: selectedDirId === item.id ? "rgba(255,255,255,0.06)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                    minHeight: 24,
                }}
            >
                {item.isOpen ? (
                    <FolderOpenIcon sx={{ fontSize: 16, color: "#e8a87c", mr: 0.75, flexShrink: 0 }} />
                ) : (
                    <FolderIcon sx={{ fontSize: 16, color: "#e8a87c", mr: 0.75, flexShrink: 0 }} />
                )}
                {isRenaming ? (
                    <TextField
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSubmit();
                            if (e.key === "Escape") setIsRenaming(false);
                        }}
                        autoFocus
                        size="small"
                        variant="standard"
                        sx={{
                            flex: 1,
                            "& input": { color: "#fff", fontSize: 13, py: 0, px: 0.5 },
                            "& .MuiInput-underline:before": { borderColor: "#555" },
                        }}
                    />
                ) : (
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#ccc",
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                        title={item.name}
                    >
                        {item.name}
                    </Typography>
                )}
            </Box>

            {/* Children (visible when open) */}
            {item.isOpen && sortedItem.children?.map((child) => (
                <TreeNode
                    key={child.id}
                    item={child}
                    depth={depth + 1}
                    selectedDirId={selectedDirId}
                    setSelectedDirId={setSelectedDirId}
                />
            ))}

            {/* Context Menu */}
            <Menu
                open={!!contextMenu}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
                slotProps={{
                    paper: {
                        sx: { bgcolor: "#2d2d2d", color: "#ccc", minWidth: 150, "& .MuiMenuItem-root:hover": { bgcolor: "#3d3d3d" } },
                    },
                }}
            >
                <MenuItem onClick={handleRename} sx={{ py: 0.5 }}>
                    <ListItemIcon><EditIcon sx={{ fontSize: 16, color: "#999" }} /></ListItemIcon>
                    <ListItemText><Typography variant="body2" sx={{ fontSize: 13 }}>Rename</Typography></ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ py: 0.5 }}>
                    <ListItemIcon><DeleteOutlineIcon sx={{ fontSize: 16, color: "#f44" }} /></ListItemIcon>
                    <ListItemText><Typography variant="body2" sx={{ fontSize: 13, color: "#f44" }}>Delete</Typography></ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}

// === File Node ===

interface FileNodeProps {
    item: FileSystemItem;
    depth: number;
    setSelectedDirId: (id: Id) => void;
}

function FileNode({ item, depth, setSelectedDirId }: FileNodeProps) {
    const { openFile, deleteFile, renameFile, activeFile } = useFileSystem();
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(item.name);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleClick = () => {
        setSelectedDirId(item.id);
        openFile(item.id);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleRename = () => {
        setContextMenu(null);
        setIsRenaming(true);
        setNewName(item.name);
    };

    const handleRenameSubmit = () => {
        if (newName.trim() && newName.trim() !== item.name) {
            renameFile(item.id, newName.trim());
        }
        setIsRenaming(false);
    };

    const handleDelete = () => {
        setContextMenu(null);
        if (confirm(`Delete file "${item.name}"?`)) {
            deleteFile(item.id);
        }
    };

    const isActive = item.id === activeFile?.id;

    return (
        <Box>
            <Box
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    pl: 1 + depth * 1.5,
                    pr: 1,
                    py: 0.3,
                    cursor: "pointer",
                    bgcolor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                    minHeight: 24,
                }}
            >
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: "#888", mr: 0.75, flexShrink: 0 }} />
                {isRenaming ? (
                    <TextField
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSubmit();
                            if (e.key === "Escape") setIsRenaming(false);
                        }}
                        autoFocus
                        size="small"
                        variant="standard"
                        sx={{
                            flex: 1,
                            "& input": { color: "#fff", fontSize: 13, py: 0, px: 0.5 },
                            "& .MuiInput-underline:before": { borderColor: "#555" },
                        }}
                    />
                ) : (
                    <Typography
                        variant="body2"
                        sx={{
                            color: isActive ? "#fff" : "#ccc",
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                        title={item.name}
                    >
                        {item.name}
                    </Typography>
                )}
            </Box>

            {/* Context Menu */}
            <Menu
                open={!!contextMenu}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
                slotProps={{
                    paper: {
                        sx: { bgcolor: "#2d2d2d", color: "#ccc", minWidth: 150, "& .MuiMenuItem-root:hover": { bgcolor: "#3d3d3d" } },
                    },
                }}
            >
                <MenuItem onClick={handleRename} sx={{ py: 0.5 }}>
                    <ListItemIcon><EditIcon sx={{ fontSize: 16, color: "#999" }} /></ListItemIcon>
                    <ListItemText><Typography variant="body2" sx={{ fontSize: 13 }}>Rename</Typography></ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ py: 0.5 }}>
                    <ListItemIcon><DeleteOutlineIcon sx={{ fontSize: 16, color: "#f44" }} /></ListItemIcon>
                    <ListItemText><Typography variant="body2" sx={{ fontSize: 13, color: "#f44" }}>Delete</Typography></ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}
