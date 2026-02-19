"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Avatar,
    InputAdornment,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import socketService from "@/services/socketService";

const GOLD = "#D4AF37";

interface Message {
    user: string;
    text: string;
    timestamp: string;
}

interface ChatProps {
    roomId: string;
    username: string;
    connectedUsers?: any[];
}

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

const Chat: React.FC<ChatProps> = ({ roomId, username, connectedUsers = [] }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socketService.on("receive_message", (data: any) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socketService.off("receive_message");
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const messageData = {
            user: username,
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, messageData]);
        socketService.emit("send_message", messageData);
        setInput("");
    };

    // Group consecutive messages from same user
    const isFirstInGroup = (index: number) => {
        if (index === 0) return true;
        return messages[index].user !== messages[index - 1].user;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: `1px solid rgba(212, 175, 55, 0.1)`,
                    background: 'linear-gradient(180deg, #151515 0%, #111111 100%)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: GOLD,
                            fontWeight: 700,
                            fontFamily: 'Space Grotesk, sans-serif',
                            letterSpacing: 0.5,
                            fontSize: '0.85rem',
                        }}
                    >
                        Team Chat
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#10b981',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                        }}
                    >
                        {connectedUsers.length} online
                    </Typography>
                </Box>
            </Box>

            {/* Messages Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 2 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                }}
            >
                {messages.length === 0 && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.15)', fontSize: 40 }}>💬</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', fontSize: '0.8rem' }}>
                            No messages yet.<br />Start the conversation!
                        </Typography>
                    </Box>
                )}
                {messages.map((msg, index) => {
                    const isOwn = msg.user === username;
                    const showAvatar = isFirstInGroup(index);

                    return (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                flexDirection: isOwn ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 0.75,
                                mt: showAvatar ? 1.5 : 0.25,
                                animation: 'msgSlideIn 0.2s ease-out',
                                '@keyframes msgSlideIn': {
                                    from: { opacity: 0, transform: 'translateY(8px)' },
                                    to: { opacity: 1, transform: 'translateY(0)' },
                                },
                            }}
                        >
                            {/* Avatar */}
                            {!isOwn && (
                                <Box sx={{ width: 28, flexShrink: 0 }}>
                                    {showAvatar && (
                                        <Avatar
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                bgcolor: getUserColor(msg.user),
                                            }}
                                        >
                                            {msg.user[0]?.toUpperCase()}
                                        </Avatar>
                                    )}
                                </Box>
                            )}

                            {/* Message Bubble */}
                            <Box sx={{ maxWidth: '78%' }}>
                                {/* Username + time (only first in group) */}
                                {showAvatar && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            mb: 0.25,
                                            flexDirection: isOwn ? 'row-reverse' : 'row',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: isOwn ? GOLD : getUserColor(msg.user),
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                            }}
                                        >
                                            {isOwn ? 'You' : msg.user}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>
                                            {msg.timestamp}
                                        </Typography>
                                    </Box>
                                )}
                                <Box
                                    sx={{
                                        py: 0.75,
                                        px: 1.25,
                                        borderRadius: isOwn
                                            ? showAvatar ? '12px 12px 4px 12px' : '12px 4px 4px 12px'
                                            : showAvatar ? '12px 12px 12px 4px' : '4px 12px 12px 4px',
                                        bgcolor: isOwn
                                            ? `${GOLD}18`
                                            : 'rgba(255,255,255,0.04)',
                                        border: isOwn
                                            ? `1px solid ${GOLD}20`
                                            : '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#e0e0e0',
                                            fontSize: '0.82rem',
                                            lineHeight: 1.5,
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {msg.text}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
                sx={{
                    p: 1.5,
                    borderTop: `1px solid rgba(212, 175, 55, 0.1)`,
                    bgcolor: '#0f0f0f',
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    multiline
                    maxRows={3}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        size="small"
                                        sx={{
                                            color: input.trim() ? GOLD : 'rgba(255,255,255,0.15)',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: `${GOLD}15`,
                                            },
                                        }}
                                    >
                                        <SendIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderRadius: 2.5,
                            fontSize: '0.82rem',
                            color: '#e0e0e0',
                            '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.08)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.15)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: `${GOLD}50`,
                                borderWidth: 1,
                            },
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255,255,255,0.25)',
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default Chat;
