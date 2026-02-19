"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import socketService from "@/services/socketService";
import { profileApi } from "@/utils/profileApi";
import { FileContextProvider, useFileSystem } from "@/context/FileContext";
import {
    Box,
    Tabs,
    Tab,
    Avatar,
    Typography,
    Tooltip,
    AvatarGroup,
    IconButton,
    Badge,
    Chip,
    Divider,
    Snackbar,
    Alert,
} from "@mui/material";
import CodeEditor from "@/components/Collaboration/CodeEditor";
import Whiteboard, { WhiteboardRef } from "@/components/Collaboration/Whiteboard";
import Chat from "@/components/Collaboration/Chat";
import FileExplorer from "@/components/Collaboration/FileExplorer";
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";

const GOLD = "#D4AF37";

// Generate consistent color from username
function getUserColor(username: string): string {
    const colors = [
        "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
        "#ef4444", "#06b6d4", "#ec4899", "#f97316",
        "#14b8a6", "#6366f1", "#84cc16", "#a855f7",
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Inner component that can access FileContext
function SaveWorkspaceButton({ roomId, whiteboardRef, onResult }: {
    roomId: string;
    whiteboardRef: React.RefObject<WhiteboardRef | null>;
    onResult: (success: boolean) => void;
}) {
    const { fileStructure } = useFileSystem();
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { projectApi } = await import("@/utils/projectApi");
            const drawingData = whiteboardRef.current?.getSnapshot() || null;
            await projectApi.saveWorkspace(roomId, { fileStructure, drawingData });
            onResult(true);
        } catch (err) {
            console.error('Save failed', err);
            onResult(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Tooltip title="Save Workspace" arrow>
            <IconButton
                onClick={handleSave}
                disabled={saving}
                size="small"
                sx={{
                    color: saving ? GOLD : 'rgba(255,255,255,0.4)',
                    borderRadius: 1.5,
                    width: 34,
                    height: 34,
                    transition: 'all 0.2s',
                    animation: saving ? 'pulse 1s infinite' : 'none',
                    '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
                    '&:hover': {
                        color: GOLD,
                        bgcolor: `${GOLD}15`,
                    },
                }}
            >
                <SaveIcon sx={{ fontSize: 18 }} />
            </IconButton>
        </Tooltip>
    );
}

export default function RoomPage() {
    const params = useParams();
    const roomId = params?.roomId as string;
    const router = useRouter();

    const [activeTab, setActiveTab] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [savedDrawingData, setSavedDrawingData] = useState<any>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
    const whiteboardRef = useRef<WhiteboardRef>(null);

    useEffect(() => {
        const initSession = async () => {
            // 1. Get User ID (Prioritize Profile API for security/consistency)
            // 1. Get User ID & Identity (Prioritize Profile API)
            let userId = localStorage.getItem("user_id");
            let username = `User ${userId || ""}`;

            try {
                // Determine identity directly from token
                const identity = await profileApi.getIdentity();

                if (identity?.user_id) {
                    userId = identity.user_id.toString();
                    username = identity.username || `User ${userId}`;

                    // Set minimal profile immediately to allow access/username
                    setCurrentUser({
                        userId: userId,
                        id: userId,
                        username: username,
                        name: username,
                        email: identity.email || "",
                        primary_skills: [],
                        secondary_skills: [],
                        interests: [],
                        languages: []
                    });
                }
            } catch (error) {
                console.warn("Failed to verify identity via profile, falling back to localStorage", error);
            }

            if (!userId) {
                console.error("No user ID found, redirecting to login");
                router.push("/login");
                return;
            }

            // 2. Fetch Full User Profile (if exists, it overwrites the minimal one)
            try {
                const profileData = await profileApi.getProfile();
                if (profileData) {
                    setCurrentUser({
                        ...profileData,
                        userId: profileData.auth_user_id?.toString() || userId
                    });
                    if (profileData.username) username = profileData.username;
                }
            } catch (error) {
                console.warn("Full profile fetch failed, continuing with identity data", error);
            }

            // Using local variable 'username' for any immediate needs if necessary, 
            // but state 'currentUser' drives the UI.

            if (!roomId) return;

            // Load saved whiteboard data from database
            try {
                const { projectApi } = await import("@/utils/projectApi");
                const workspace = await projectApi.getWorkspace(roomId);
                if (workspace?.drawingData) {
                    setSavedDrawingData(workspace.drawingData);
                }
            } catch (err) {
                // No saved workspace — that's fine
            }

            socketService.connect(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000");
            setIsSocketConnected(true);
            socketService.joinRoom(roomId, username || currentUser?.username, userId);

            socketService.on("join_accepted", (data: any) => {
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
        };

        initSession();

        return () => {
            socketService.disconnect();
        };
    }, [roomId]);

    if (!currentUser || !isSocketConnected) return (
        <Box
            sx={{
                height: '100vh',
                bgcolor: '#0a0a0a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `rgba(212, 175, 55, 0.1)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'sessionPulse 2s ease-in-out infinite',
                    '@keyframes sessionPulse': {
                        '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(212,175,55,0.3)' },
                        '50%': { transform: 'scale(1.1)', boxShadow: '0 0 20px 10px rgba(212,175,55,0.1)' },
                    },
                }}
            >
                <CodeIcon sx={{ fontSize: 32, color: GOLD }} />
            </Box>
            <Typography variant="h6" sx={{ color: GOLD, fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: 1 }}>
                Entering Session...
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                Connecting to collaboration server
            </Typography>
        </Box>
    );

    return (
        <FileContextProvider roomId={roomId}>
            <Box sx={{ display: "flex", height: "100vh", bgcolor: "#0f0f0f", color: "#e0e0e0", overflow: "hidden" }}>
                {/* ─── LEFT: Main Content ─── */}
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
                    {/* ═══ Premium Header Bar ═══ */}
                    <Box
                        sx={{
                            height: 52,
                            minHeight: 52,
                            borderBottom: `1px solid rgba(212, 175, 55, 0.15)`,
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            justifyContent: "space-between",
                            background: "linear-gradient(180deg, #1a1a1a 0%, #141414 100%)",
                            position: "relative",
                            "&::after": {
                                content: '""',
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "1px",
                                background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)`,
                            },
                        }}
                    >
                        {/* Left: Room Info + Tabs */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            {/* Logo/Session Icon */}
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    background: `linear-gradient(135deg, ${GOLD}20, ${GOLD}05)`,
                                    border: `1px solid ${GOLD}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CodeIcon sx={{ fontSize: 18, color: GOLD }} />
                            </Box>

                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />

                            {/* Workspace Tabs */}
                            <Tabs
                                value={activeTab}
                                onChange={(e, v) => setActiveTab(v)}
                                sx={{
                                    minHeight: 52,
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: GOLD,
                                        height: 2,
                                    },
                                    '& .MuiTab-root': {
                                        color: 'rgba(255,255,255,0.45)',
                                        minHeight: 52,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        fontFamily: 'Space Grotesk, sans-serif',
                                        letterSpacing: 0.3,
                                        transition: 'color 0.2s',
                                        '&.Mui-selected': { color: GOLD },
                                        '&:hover': { color: 'rgba(255,255,255,0.8)' },
                                    },
                                }}
                            >
                                <Tab
                                    icon={<CodeIcon sx={{ fontSize: 16 }} />}
                                    label="Code"
                                    iconPosition="start"
                                />
                                <Tab
                                    icon={<BrushIcon sx={{ fontSize: 16 }} />}
                                    label="Whiteboard"
                                    iconPosition="start"
                                />
                            </Tabs>
                        </Box>

                        {/* Right: Users & Controls */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            {/* Connected Users Count Chip */}
                            <Chip
                                icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: '#10b981 !important' }} />}
                                label={`${connectedUsers.length} online`}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 28,
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    fontFamily: 'Space Grotesk, sans-serif',
                                }}
                            />

                            {/* User Avatars */}
                            <Box
                                onClick={() => setShowMembers(!showMembers)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    px: 1,
                                    py: 0.5,
                                    transition: 'background 0.2s',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                    position: 'relative',
                                }}
                            >
                                <AvatarGroup
                                    max={5}
                                    sx={{
                                        '& .MuiAvatar-root': {
                                            width: 28,
                                            height: 28,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            border: '2px solid #141414',
                                            fontFamily: 'Space Grotesk, sans-serif',
                                        },
                                    }}
                                >
                                    {connectedUsers.map((u, i) => (
                                        <Tooltip key={i} title={u.username} arrow>
                                            <Avatar
                                                sx={{
                                                    bgcolor: getUserColor(u.username),
                                                }}
                                            >
                                                {u.username[0]?.toUpperCase()}
                                            </Avatar>
                                        </Tooltip>
                                    ))}
                                </AvatarGroup>

                                {/* Members Dropdown */}
                                {showMembers && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            mt: 1,
                                            bgcolor: '#1a1a1a',
                                            border: `1px solid ${GOLD}20`,
                                            borderRadius: 2,
                                            p: 1.5,
                                            minWidth: 220,
                                            zIndex: 100,
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: GOLD,
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mb: 1,
                                            }}
                                        >
                                            <PeopleAltIcon sx={{ fontSize: 14 }} />
                                            Session Members
                                        </Typography>
                                        {connectedUsers.map((u, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    py: 0.75,
                                                    px: 0.5,
                                                    borderRadius: 1,
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                                                }}
                                            >
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    badgeContent={
                                                        <FiberManualRecordIcon
                                                            sx={{ fontSize: 10, color: '#10b981' }}
                                                        />
                                                    }
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            bgcolor: getUserColor(u.username),
                                                        }}
                                                    >
                                                        {u.username[0]?.toUpperCase()}
                                                    </Avatar>
                                                </Badge>
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#e0e0e0',
                                                            fontWeight: 600,
                                                            fontSize: '0.8rem',
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {u.username}
                                                        {u.username === currentUser.username && (
                                                            <Typography component="span" sx={{ color: GOLD, fontSize: '0.65rem', ml: 0.5 }}>
                                                                (you)
                                                            </Typography>
                                                        )}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>
                                                        Active now
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />

                            {/* Save Button */}
                            <SaveWorkspaceButton
                                roomId={roomId}
                                whiteboardRef={whiteboardRef}
                                onResult={(success) => {
                                    setSnackbar({
                                        open: true,
                                        message: success ? 'Workspace saved successfully!' : 'Failed to save workspace',
                                        severity: success ? 'success' : 'error',
                                    });
                                }}
                            />

                            {/* Chat Toggle */}
                            <Tooltip title={isChatOpen ? "Hide Chat" : "Show Chat"} arrow>
                                <IconButton
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    size="small"
                                    sx={{
                                        color: isChatOpen ? GOLD : 'rgba(255,255,255,0.4)',
                                        bgcolor: isChatOpen ? `${GOLD}15` : 'transparent',
                                        borderRadius: 1.5,
                                        width: 34,
                                        height: 34,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: isChatOpen ? `${GOLD}25` : 'rgba(255,255,255,0.05)',
                                        },
                                    }}
                                >
                                    <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>

                            {/* Leave Session */}
                            <Tooltip title="Leave Session" arrow>
                                <IconButton
                                    onClick={() => router.back()}
                                    size="small"
                                    sx={{
                                        color: 'rgba(255,255,255,0.4)',
                                        borderRadius: 1.5,
                                        width: 34,
                                        height: 34,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            color: '#ef4444',
                                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                                        },
                                    }}
                                >
                                    <LogoutIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* ═══ Workspace Area ═══ */}
                    <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
                        {activeTab === 0 && (
                            <React.Fragment>
                                <FileExplorer />
                                <Box sx={{ flexGrow: 1, height: "100%" }}>
                                    <CodeEditor roomId={roomId} />
                                </Box>
                            </React.Fragment>
                        )}

                        {activeTab === 1 && (
                            <Box sx={{ flexGrow: 1, height: "100%", position: "relative" }}>
                                <Whiteboard ref={whiteboardRef} roomId={roomId} savedSnapshot={savedDrawingData} />
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* ─── RIGHT: Chat Sidebar ─── */}
                <Box
                    sx={{
                        width: isChatOpen ? 320 : 0,
                        minWidth: isChatOpen ? 320 : 0,
                        height: "100%",
                        borderLeft: isChatOpen ? `1px solid rgba(212, 175, 55, 0.1)` : 'none',
                        bgcolor: "#111111",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        overflow: "hidden",
                    }}
                >
                    {isChatOpen && (
                        <Chat roomId={roomId} username={currentUser.username} connectedUsers={connectedUsers} />
                    )}
                </Box>
            </Box>

            {/* Snackbar for save feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </FileContextProvider>
    );
}
