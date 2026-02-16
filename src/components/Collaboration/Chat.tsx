"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, Typography, List, ListItem, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import socketService from "@/services/socketService";

interface Message {
    user: string;
    text: string;
    timestamp: string;
}

interface ChatProps {
    roomId: string;
    username: string;
}

const Chat: React.FC<ChatProps> = ({ roomId, username }) => {
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
            timestamp: new Date().toLocaleTimeString(),
        };

        // Optimistic update
        setMessages((prev) => [...prev, messageData]);

        // Send to server
        socketService.emit("send_message", messageData);

        setInput("");
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #333' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
                <Typography variant="h6">Team Chat</Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map((msg, index) => (
                    <Paper
                        key={index}
                        sx={{
                            p: 1.5,
                            maxWidth: '80%',
                            alignSelf: msg.user === username ? 'flex-end' : 'flex-start',
                            bgcolor: msg.user === username ? 'primary.main' : 'background.paper',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {msg.user} • {msg.timestamp}
                        </Typography>
                        <Typography variant="body2">{msg.text}</Typography>
                    </Paper>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid #333', display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <IconButton color="primary" onClick={handleSend}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default Chat;
