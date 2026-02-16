"use client";

import React from "react";
import { useFileSystem } from "@/context/FileContext";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

/**
 * FileTabs — horizontal tab bar showing all open files.
 * Click to switch, X to close.
 */
export default function FileTabs() {
    const { openFiles, activeFile, setActiveFile, closeFile, updateFileContent } = useFileSystem();

    if (openFiles.length === 0) return null;

    const handleTabClick = (fileId: string) => {
        if (activeFile?.id === fileId) return;

        // Persist current file content before switching
        if (activeFile) {
            updateFileContent(activeFile.id, activeFile.content || "");
        }

        const file = openFiles.find((f) => f.id === fileId);
        if (file) setActiveFile(file);
    };

    const handleClose = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        closeFile(fileId);
    };

    return (
        <Box
            sx={{
                display: "flex",
                height: 36,
                minHeight: 36,
                bgcolor: "#252526",
                borderBottom: "1px solid #1e1e1e",
                overflowX: "auto",
                overflowY: "hidden",
                "&::-webkit-scrollbar": { height: 3 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#555" },
            }}
        >
            {openFiles.map((file) => {
                const isActive = file.id === activeFile?.id;
                return (
                    <Box
                        key={file.id}
                        onClick={() => handleTabClick(file.id)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1.5,
                            cursor: "pointer",
                            bgcolor: isActive ? "#1e1e1e" : "transparent",
                            borderRight: "1px solid #1e1e1e",
                            borderTop: isActive ? "2px solid #007acc" : "2px solid transparent",
                            minWidth: "fit-content",
                            whiteSpace: "nowrap",
                            transition: "background-color 0.15s",
                            "&:hover": {
                                bgcolor: isActive ? "#1e1e1e" : "#2d2d2d",
                            },
                        }}
                    >
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: "#888" }} />
                        <Tooltip title={file.name} placement="bottom" arrow>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: isActive ? "#fff" : "#999",
                                    fontSize: 12,
                                    maxWidth: 120,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {file.name}
                            </Typography>
                        </Tooltip>
                        <IconButton
                            size="small"
                            onClick={(e) => handleClose(e, file.id)}
                            sx={{
                                p: 0.25,
                                ml: 0.5,
                                color: "#666",
                                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                );
            })}
        </Box>
    );
}
