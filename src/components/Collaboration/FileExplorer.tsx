"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFileSystem } from "@/context/FileContext";
import { FileSystemItem, Id } from "@/types/fileTypes";
import { sortFileSystemItem, getFileById, findParentDirectory } from "@/utils/fileUtils";
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

const GOLD = "#D4AF37";

// File extension to color mapping for file icons
function getFileColor(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
        'py': '#3572A5', 'js': '#f1e05a', 'jsx': '#61dafb',
        'ts': '#3178c6', 'tsx': '#3178c6', 'html': '#e34c26',
        'css': '#563d7c', 'json': '#f59e0b', 'md': '#083fa1',
        'java': '#b07219', 'cpp': '#f34b7d', 'c': '#555555',
        'go': '#00ADD8', 'rs': '#dea584', 'rb': '#701516',
    };
    return map[ext] || '#888';
}

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
            let parentDirId = selectedDirId || fileStructure.id;

            // If selected is a file, use its parent
            if (selectedDirId) {
                const selectedItem = getFileById(fileStructure, selectedDirId);
                if (selectedItem?.type === 'file') {
                    const parent = findParentDirectory(fileStructure, selectedDirId);
                    if (parent) parentDirId = parent.id;
                }
            }

            createFile(parentDirId, fileName.trim());
        }
    };

    const handleCreateDirectory = () => {
        const dirName = prompt("Enter directory name:");
        if (dirName && dirName.trim()) {
            let parentDirId = selectedDirId || fileStructure.id;

            // If selected is a file, use its parent
            if (selectedDirId) {
                const selectedItem = getFileById(fileStructure, selectedDirId);
                if (selectedItem?.type === 'file') {
                    const parent = findParentDirectory(fileStructure, selectedDirId);
                    if (parent) parentDirId = parent.id;
                }
            }

            createDirectory(parentDirId, dirName.trim());
        }
    };

    const sortedStructure = sortFileSystemItem(fileStructure);

    return (
        <Box
            sx={{
                width: 230,
                minWidth: 230,
                height: "100%",
                bgcolor: "#111111",
                borderRight: `1px solid rgba(212, 175, 55, 0.08)`,
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
                    height: 38,
                    minHeight: 38,
                    borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    background: 'linear-gradient(180deg, #161616 0%, #111111 100%)',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: GOLD,
                        fontWeight: 700,
                        letterSpacing: 1,
                        fontSize: '0.7rem',
                        fontFamily: 'Space Grotesk, sans-serif',
                    }}
                >
                    EXPLORER
                </Typography>
                <Box sx={{ display: "flex", gap: 0.25 }}>
                    <Tooltip title="New File" arrow>
                        <IconButton size="small" onClick={handleCreateFile} sx={{ color: '#666', p: 0.5, '&:hover': { color: GOLD, bgcolor: `${GOLD}10` } }}>
                            <NoteAddOutlinedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="New Folder" arrow>
                        <IconButton size="small" onClick={handleCreateDirectory} sx={{ color: '#666', p: 0.5, '&:hover': { color: GOLD, bgcolor: `${GOLD}10` } }}>
                            <CreateNewFolderOutlinedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Collapse All" arrow>
                        <IconButton size="small" onClick={collapseDirectories} sx={{ color: '#666', p: 0.5, '&:hover': { color: GOLD, bgcolor: `${GOLD}10` } }}>
                            <UnfoldLessIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Tree */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', py: 0.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 2 }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' } }}>
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
                    py: 0.35,
                    cursor: "pointer",
                    bgcolor: selectedDirId === item.id ? `${GOLD}08` : 'transparent',
                    borderLeft: selectedDirId === item.id ? `2px solid ${GOLD}60` : '2px solid transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                    minHeight: 26,
                    transition: 'all 0.15s',
                }}
            >
                {item.isOpen ? (
                    <FolderOpenIcon sx={{ fontSize: 16, color: GOLD, mr: 0.75, flexShrink: 0 }} />
                ) : (
                    <FolderIcon sx={{ fontSize: 16, color: `${GOLD}80`, mr: 0.75, flexShrink: 0 }} />
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
                        sx: {
                            bgcolor: '#1a1a1a',
                            color: '#ccc',
                            minWidth: 150,
                            border: `1px solid ${GOLD}15`,
                            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                            '& .MuiMenuItem-root:hover': { bgcolor: `${GOLD}08` },
                        },
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
                    py: 0.35,
                    cursor: "pointer",
                    bgcolor: isActive ? `${GOLD}10` : 'transparent',
                    borderLeft: isActive ? `2px solid ${GOLD}` : '2px solid transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                    minHeight: 26,
                    transition: 'all 0.15s',
                }}
            >
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: getFileColor(item.name), mr: 0.75, flexShrink: 0 }} />
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
                        sx: { bgcolor: '#1a1a1a', color: '#ccc', minWidth: 150, border: `1px solid ${GOLD}15`, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', '& .MuiMenuItem-root:hover': { bgcolor: `${GOLD}08` } },
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
