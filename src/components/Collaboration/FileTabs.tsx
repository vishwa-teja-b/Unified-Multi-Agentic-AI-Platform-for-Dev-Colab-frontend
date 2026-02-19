"use client";

import React from "react";
import { useFileSystem } from "@/context/FileContext";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const GOLD = "#D4AF37";

// File extension icon + color mapping
function getFileIconInfo(filename: string): { icon: string; color: string } {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, { icon: string; color: string }> = {
        'py': { icon: '🐍', color: '#3572A5' },
        'js': { icon: '⚡', color: '#f1e05a' },
        'jsx': { icon: '⚛️', color: '#61dafb' },
        'ts': { icon: '📘', color: '#3178c6' },
        'tsx': { icon: '⚛️', color: '#3178c6' },
        'html': { icon: '🌐', color: '#e34c26' },
        'css': { icon: '🎨', color: '#563d7c' },
        'json': { icon: '📋', color: '#292929' },
        'md': { icon: '📝', color: '#083fa1' },
        'java': { icon: '☕', color: '#b07219' },
        'cpp': { icon: '⚙️', color: '#f34b7d' },
        'c': { icon: '⚙️', color: '#555555' },
        'go': { icon: '🐹', color: '#00ADD8' },
        'rs': { icon: '🦀', color: '#dea584' },
        'rb': { icon: '💎', color: '#701516' },
        'php': { icon: '🐘', color: '#4F5D95' },
        'sql': { icon: '🗄️', color: '#e38c00' },
        'sh': { icon: '🖥️', color: '#89e051' },
        'yml': { icon: '⚙️', color: '#cb171e' },
        'yaml': { icon: '⚙️', color: '#cb171e' },
        'txt': { icon: '📄', color: '#888' },
    };
    return map[ext] || { icon: '📄', color: '#888' };
}

/**
 * FileTabs — horizontal tab bar showing all open files.
 * Click to switch, X to close.
 */
export default function FileTabs() {
    const { openFiles, activeFile, setActiveFile, closeFile, updateFileContent } = useFileSystem();

    if (openFiles.length === 0) return null;

    const handleTabClick = (fileId: string) => {
        if (activeFile?.id === fileId) return;

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
                background: "linear-gradient(180deg, #161616 0%, #121212 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                overflowX: "auto",
                overflowY: "hidden",
                "&::-webkit-scrollbar": { height: 2 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#444", borderRadius: 1 },
            }}
        >
            {openFiles.map((file) => {
                const isActive = file.id === activeFile?.id;
                const { icon, color } = getFileIconInfo(file.name);
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
                            bgcolor: isActive ? "#0f0f0f" : "transparent",
                            borderRight: "1px solid rgba(255,255,255,0.03)",
                            borderTop: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
                            minWidth: "fit-content",
                            whiteSpace: "nowrap",
                            transition: "all 0.15s",
                            position: 'relative',
                            "&:hover": {
                                bgcolor: isActive ? "#0f0f0f" : "rgba(255,255,255,0.03)",
                            },
                            "&::after": isActive ? {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '1px',
                                bgcolor: '#0f0f0f',
                            } : {},
                        }}
                    >
                        <Typography sx={{ fontSize: 12, lineHeight: 1 }}>{icon}</Typography>
                        <Tooltip title={file.name} placement="bottom" arrow>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: isActive ? "#fff" : "#777",
                                    fontSize: 12,
                                    fontWeight: isActive ? 600 : 400,
                                    maxWidth: 130,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontFamily: 'Space Grotesk, sans-serif',
                                    transition: 'color 0.15s',
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
                                color: "#555",
                                opacity: isActive ? 1 : 0,
                                transition: 'all 0.15s',
                                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                                '.MuiBox-root:hover > &': { opacity: 1 },
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
