"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import socketService from "@/services/socketService";
import { useFileSystem } from "@/context/FileContext";
import { getLanguageFromFileName, getPistonLanguage } from "@/utils/fileUtils";
import { Box, Button, IconButton, Typography, Chip, CircularProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TerminalIcon from "@mui/icons-material/Terminal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CodeIcon from "@mui/icons-material/Code";
import FileTabs from "./FileTabs";

const GOLD = "#D4AF37";

interface CodeEditorProps {
    roomId: string;
}

// Language badge colors
function getLangColor(lang: string): string {
    const map: Record<string, string> = {
        python: '#3572A5',
        javascript: '#f1e05a',
        typescript: '#3178c6',
        java: '#b07219',
        cpp: '#f34b7d',
        c: '#555555',
        go: '#00ADD8',
        rust: '#dea584',
        html: '#e34c26',
        css: '#563d7c',
        json: '#292929',
        markdown: '#083fa1',
    };
    return map[lang] || '#888';
}

const CodeEditor: React.FC<CodeEditorProps> = ({ roomId }) => {
    const { activeFile, updateFileContent, openFiles } = useFileSystem();

    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isOutputVisible, setIsOutputVisible] = useState(false);
    const [runSuccess, setRunSuccess] = useState<boolean | null>(null);

    const editorRef = useRef<any>(null);
    const isRemoteUpdate = useRef(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Derived state
    const language = activeFile ? getLanguageFromFileName(activeFile.name) : "python";
    const code = activeFile?.content || "";
    const fileId = activeFile?.id || "";

    // Sync editor value when switching files
    useEffect(() => {
        if (editorRef.current && activeFile) {
            const currentValue = editorRef.current.getValue();
            if (currentValue !== activeFile.content) {
                isRemoteUpdate.current = true;
                editorRef.current.setValue(activeFile.content || "");
            }
        }
        setOutput("");
        setRunSuccess(null);
    }, [activeFile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Listen for remote file updates
    useEffect(() => {
        const handleFileUpdate = (data: any) => {
            if (data.fileId === fileId && data.newContent !== undefined) {
                if (editorRef.current && editorRef.current.getValue() !== data.newContent) {
                    isRemoteUpdate.current = true;
                    editorRef.current.setValue(data.newContent);
                }
            }
        };

        socketService.on("file_updated", handleFileUpdate);
        return () => {
            socketService.off("file_updated", handleFileUpdate);
        };
    }, [fileId]);

    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            if (isRemoteUpdate.current) {
                isRemoteUpdate.current = false;
                return;
            }

            const newContent = value || "";

            if (fileId) {
                updateFileContent(fileId, newContent);
            }

            socketService.emit("file_updated", {
                roomId,
                fileId,
                newContent,
            });

            // Typing indicator
            const cursorPosition = editorRef.current?.getPosition();
            socketService.emit("typing_start", {
                cursorPosition: cursorPosition?.lineNumber || 0,
            });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                socketService.emit("typing_pause", {});
            }, 1000);
        },
        [fileId, roomId, updateFileContent]
    );

    const handleRunCode = async () => {
        setIsRunning(true);
        setIsOutputVisible(true);
        setOutput("Running...");
        setRunSuccess(null);

        const pistonLanguage = getPistonLanguage(language);

        try {
            const result = await socketService.executeCode(pistonLanguage, code);
            if (result.compile && result.compile.code !== 0) {
                setOutput(`Compilation Error:\n${result.compile.stderr || result.compile.stdout}`);
                setRunSuccess(false);
            } else if (result.run) {
                const outputText = result.run.stdout || result.run.stderr || result.run.output || "No output";
                setOutput(outputText);
                setRunSuccess(!result.run.stderr);
            } else {
                setOutput("Error: " + (result.message || JSON.stringify(result)));
                setRunSuccess(false);
            }
        } catch (error: any) {
            setOutput("Execution failed: " + (error?.message || "Unknown error"));
            setRunSuccess(false);
        } finally {
            setIsRunning(false);
        }
    };

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    // No file open state
    if (!activeFile && openFiles.length === 0) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", bgcolor: "#0f0f0f" }}>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: `rgba(212, 175, 55, 0.05)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CodeIcon sx={{ fontSize: 28, color: 'rgba(255,255,255,0.15)' }} />
                    </Box>
                    <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
                        No file is currently open.<br />Create or select a file from the explorer to start coding.
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", bgcolor: "#0f0f0f" }}>
            {/* File Tabs */}
            <FileTabs />

            {/* ═══ Toolbar ═══ */}
            <Box
                sx={{
                    height: 38,
                    minHeight: 38,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    justifyContent: "space-between",
                    background: "linear-gradient(180deg, #161616 0%, #121212 100%)",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#ccc',
                            fontSize: 13,
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontWeight: 500,
                        }}
                    >
                        {activeFile?.name || "—"}
                    </Typography>
                    <Chip
                        label={language}
                        size="small"
                        sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFamily: 'Space Grotesk, sans-serif',
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                            bgcolor: `${getLangColor(language)}25`,
                            color: getLangColor(language),
                            border: `1px solid ${getLangColor(language)}40`,
                            borderRadius: 1,
                        }}
                    />
                </Box>

                <Button
                    variant="contained"
                    size="small"
                    startIcon={
                        isRunning ? (
                            <CircularProgress size={14} sx={{ color: 'inherit' }} />
                        ) : (
                            <PlayArrowIcon sx={{ fontSize: '16px !important' }} />
                        )
                    }
                    onClick={handleRunCode}
                    disabled={isRunning || !activeFile}
                    sx={{
                        textTransform: "none",
                        height: 28,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: 'Space Grotesk, sans-serif',
                        borderRadius: 1.5,
                        bgcolor: isRunning
                            ? '#333'
                            : 'rgba(16, 185, 129, 0.15)',
                        color: isRunning ? '#888' : '#10b981',
                        border: '1px solid',
                        borderColor: isRunning
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(16, 185, 129, 0.3)',
                        boxShadow: 'none',
                        px: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'rgba(16, 185, 129, 0.25)',
                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
                        },
                        '&.Mui-disabled': {
                            color: '#555',
                            borderColor: 'rgba(255,255,255,0.05)',
                        },
                    }}
                >
                    {isRunning ? 'Running...' : 'Run'}
                </Button>
            </Box>

            {/* ═══ Editor Area ═══ */}
            <Box sx={{ flex: isOutputVisible ? "1 1 60%" : "1 1 100%", position: "relative", minHeight: 0, overflow: "hidden" }}>
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        automaticLayout: true,
                        readOnly: false,
                        fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
                        fontLigatures: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        padding: { top: 8, bottom: 8 },
                        renderLineHighlight: 'gutter',
                        scrollBeyondLastLine: false,
                    }}
                />
            </Box>

            {/* ═══ Output / Console Panel ═══ */}
            <Box
                sx={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    bgcolor: "#0f0f0f",
                    display: "flex",
                    flexDirection: "column",
                    flex: isOutputVisible ? "0 0 200px" : "0 0 32px",
                    minHeight: isOutputVisible ? 150 : 32,
                    maxHeight: isOutputVisible ? 300 : 32,
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Console Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        height: 32,
                        cursor: "pointer",
                        background: "linear-gradient(180deg, #161616 0%, #121212 100%)",
                        flexShrink: 0,
                        borderBottom: isOutputVisible ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                    }}
                    onClick={() => setIsOutputVisible(!isOutputVisible)}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TerminalIcon sx={{ fontSize: 14, color: GOLD }} />
                        <Typography
                            variant="caption"
                            sx={{
                                color: GOLD,
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                letterSpacing: 1,
                                textTransform: 'uppercase',
                                fontFamily: 'Space Grotesk, sans-serif',
                            }}
                        >
                            Console
                        </Typography>
                        {runSuccess !== null && (
                            runSuccess ? (
                                <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#10b981' }} />
                            ) : (
                                <ErrorOutlineIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                            )
                        )}
                    </Box>
                    <IconButton size="small" sx={{ p: 0.25, color: '#888' }}>
                        {isOutputVisible ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ExpandLessIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                </Box>

                {isOutputVisible && (
                    <Box
                        sx={{
                            flexGrow: 1,
                            p: 1.5,
                            overflow: "auto",
                            bgcolor: "#0a0a0a",
                            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                            fontSize: 13,
                            color: runSuccess === false ? '#ef4444' : '#d4d4d4',
                            '&::-webkit-scrollbar': { width: 4 },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 2 },
                        }}
                    >
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{output}</pre>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default CodeEditor;
