"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import socketService from "@/services/socketService";
import { FileContextProvider } from "@/context/FileContext";
import { Box, Tabs, Tab, Avatar, Typography, Tooltip, AvatarGroup, IconButton } from "@mui/material";
import CodeEditor from "@/components/Collaboration/CodeEditor";
import Whiteboard from "@/components/Collaboration/Whiteboard";
import Chat from "@/components/Collaboration/Chat";
import FileExplorer from "@/components/Collaboration/FileExplorer";
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import ChatIcon from "@mui/icons-material/Chat";

export default function RoomPage() {
    const params = useParams();
    const roomId = params?.roomId as string;

    const [activeTab, setActiveTab] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<{ username: string; userId: string } | null>(null);

    useEffect(() => {
        // Auth Check
        const userId = localStorage.getItem("user_id");
        const username = localStorage.getItem("username") || `User ${userId}`;

        if (!userId) {
            console.error("No user ID found, please login");
            return;
        }

        setCurrentUser({ username, userId });

        if (!roomId) return;

        // Connect to WebSocket
        socketService.connect(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000");

        // Join Room
        socketService.joinRoom(roomId, username, userId);

        // Listeners
        socketService.on("join_accepted", (data: any) => {
            console.log("Joined room!", data);
            if (data.users) setConnectedUsers(data.users);
        });

        socketService.on("user_joined", (data: any) => {
            setConnectedUsers((prev) => {
                if (prev.some((u) => u.socketId === data.user.socketId)) return prev;
                return [...prev, data.user];
            });
        });

        socketService.on("user_disconnected", (data: any) => {
            setConnectedUsers((prev) => prev.filter((u) => u.socketId !== data.user.socketId));
        });

        return () => {
            socketService.disconnect();
        };
    }, [roomId]);

    if (!currentUser) return <Box sx={{ p: 4, color: "white" }}>Loading Session...</Box>;

    return (
        <FileContextProvider roomId={roomId}>
            <Box sx={{ display: "flex", height: "100vh", bgcolor: "#1e1e1e", color: "#ccc" }}>
                {/* LEFT: Main Content (Editor/Whiteboard) */}
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                    {/* Header / Toolbar */}
                    <Box
                        sx={{
                            height: 48,
                            borderBottom: "1px solid #333",
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            justifyContent: "space-between",
                            bgcolor: "#2d2d2d",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Room: {roomId}
                            </Typography>
                            <Tabs
                                value={activeTab}
                                onChange={(e, v) => setActiveTab(v)}
                                textColor="inherit"
                                indicatorColor="primary"
                                sx={{ minHeight: 48 }}
                            >
                                <Tab
                                    icon={<CodeIcon fontSize="small" />}
                                    label="Code"
                                    iconPosition="start"
                                    sx={{ minHeight: 48, textTransform: "none" }}
                                />
                                <Tab
                                    icon={<BrushIcon fontSize="small" />}
                                    label="Whiteboard"
                                    iconPosition="start"
                                    sx={{ minHeight: 48, textTransform: "none" }}
                                />
                            </Tabs>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <AvatarGroup max={4}>
                                {connectedUsers.map((u, i) => (
                                    <Tooltip key={i} title={u.username}>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 12 }}>
                                            {u.username[0]}
                                        </Avatar>
                                    </Tooltip>
                                ))}
                            </AvatarGroup>
                            <IconButton
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                color={isChatOpen ? "primary" : "default"}
                                size="small"
                            >
                                <ChatIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Workspace */}
                    <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
                        {/* Code Editor Layout */}
                        {activeTab === 0 && (
                            <React.Fragment>
                                {/* File Explorer Sidebar */}
                                <FileExplorer />

                                {/* Editor Area */}
                                <Box sx={{ flexGrow: 1, height: "100%" }}>
                                    <CodeEditor roomId={roomId} />
                                </Box>
                            </React.Fragment>
                        )}

                        {/* Whiteboard Layout */}
                        {activeTab === 1 && (
                            <Box sx={{ flexGrow: 1, height: "100%", position: "relative" }}>
                                <Whiteboard roomId={roomId} />
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* RIGHT: Chat Sidebar */}
                {isChatOpen && (
                    <Box sx={{ width: 300, height: "100%", borderLeft: "1px solid #333", bgcolor: "#1e1e1e" }}>
                        <Chat roomId={roomId} username={currentUser.username} />
                    </Box>
                )}
            </Box>
        </FileContextProvider>
    );
}
