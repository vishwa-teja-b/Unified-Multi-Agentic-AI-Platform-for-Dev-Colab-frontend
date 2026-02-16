"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import socketService from "@/services/socketService";
import { useFileSystem } from "@/context/FileContext";
import { getLanguageFromFileName, getPistonLanguage } from "@/utils/fileUtils";
import { Box, Button, IconButton, Typography, CircularProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TerminalIcon from "@mui/icons-material/Terminal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FileTabs from "./FileTabs";

interface CodeEditorProps {
    roomId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ roomId }) => {
    const { activeFile, updateFileContent, openFiles } = useFileSystem();

    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isOutputVisible, setIsOutputVisible] = useState(false);

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
        setOutput(""); // Clear output on file switch
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

            // Update in context (tree + tabs)
            if (fileId) {
                updateFileContent(fileId, newContent);
            }

            // Emit change to room
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

            // Clear previous pause timeout
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

        const pistonLanguage = getPistonLanguage(language);

        try {
            const result = await socketService.executeCode(pistonLanguage, code);
            if (result.compile && result.compile.code !== 0) {
                setOutput(`Compilation Error:\n${result.compile.stderr || result.compile.stdout}`);
            } else if (result.run) {
                const outputText = result.run.stdout || result.run.stderr || result.run.output || "No output";
                setOutput(outputText);
            } else {
                setOutput("Error: " + (result.message || JSON.stringify(result)));
            }
        } catch (error: any) {
            setOutput("Execution failed: " + (error?.message || "Unknown error"));
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
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", bgcolor: "#1e1e1e" }}>
                <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ color: "#666", fontSize: 16 }}>
                        No file is currently open. Create or select a file to start coding.
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", bgcolor: "#1e1e1e" }}>
            {/* File Tabs */}
            <FileTabs />

            {/* Toolbar */}
            <Box
                sx={{
                    height: 36,
                    minHeight: 36,
                    borderBottom: "1px solid #333",
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    justifyContent: "space-between",
                    bgcolor: "#252526",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "#ccc", fontSize: 13 }}>
                        {activeFile?.name || "—"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                        {language}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={isRunning ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
                    onClick={handleRunCode}
                    disabled={isRunning || !activeFile}
                    sx={{ textTransform: "none", height: 26, fontSize: 12 }}
                >
                    Run
                </Button>
            </Box>

            {/* Editor Area */}
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
                    }}
                />
            </Box>

            {/* Output Panel */}
            <Box
                sx={{
                    borderTop: "1px solid #333",
                    bgcolor: "#1e1e1e",
                    display: "flex",
                    flexDirection: "column",
                    flex: isOutputVisible ? "0 0 200px" : "0 0 30px",
                    minHeight: isOutputVisible ? 150 : 30,
                    maxHeight: isOutputVisible ? 300 : 30,
                    transition: "all 0.2s ease",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        height: 30,
                        cursor: "pointer",
                        bgcolor: "#252526",
                        flexShrink: 0,
                    }}
                    onClick={() => setIsOutputVisible(!isOutputVisible)}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TerminalIcon sx={{ fontSize: 16, color: "#ccc" }} />
                        <Typography variant="caption" sx={{ color: "#ccc", fontWeight: "bold" }}>
                            CONSOLE
                        </Typography>
                    </Box>
                    <IconButton size="small" sx={{ p: 0.5, color: "#ccc" }}>
                        {isOutputVisible ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
                    </IconButton>
                </Box>

                {isOutputVisible && (
                    <Box sx={{ flexGrow: 1, p: 1, overflow: "auto", bgcolor: "#1e1e1e", fontFamily: "monospace", fontSize: 13, color: "#d4d4d4" }}>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{output}</pre>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default CodeEditor;
