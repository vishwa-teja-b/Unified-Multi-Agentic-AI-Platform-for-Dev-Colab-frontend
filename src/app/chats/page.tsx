'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Stack, TextField, InputAdornment,
    IconButton, List, ListItem, ListItemAvatar,
    ListItemText, Avatar, Divider, CircularProgress, Button,
    Paper
} from '@mui/material';
import { Search, Send, ArrowBack, Group, Person, Chat as ChatIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useThemeColors } from '@/context/ThemeContext';
import socketService from '@/services/socketService';
import {
    getChatRooms, getTeamChat, createOrGetDirectChat,
    searchDevelopersForChat, getRoomMessages, sendMessage
} from '@/utils/chatApi';
import { ChatTopBar } from '@/components/chat/ChatTopBar';
import api from '@/utils/api';

const GOLD = '#D4AF37';
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatRoom {
    _id: string;
    room_type: 'direct' | 'team';
    participants: number[];
    team_id?: string;
    other_user_name?: string;
    other_user_pic?: string;
    last_message?: any;
    // Client-side injected fields for display
    displayName?: string;
    displayPic?: string;
}

interface Message {
    _id: string;
    sender_id: number;
    text: string;
    timestamp: string;
    room_id: string;
    sender_name?: string;
}

export default function ChatsPage() {
    const router = useRouter();
    const c = useThemeColors();
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<'history' | 'teams'>('history');
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [userTeams, setUserTeams] = useState<any[]>([]);

    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Debounce timer
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Initial setup & animation trigger
    useEffect(() => {
        const uid = localStorage.getItem('user_id');
        if (uid) setCurrentUserId(parseInt(uid));

        socketService.connect(SOCKET_URL);

        // Fetch initial data
        fetchChatRooms();
        fetchMyTeams();

        return () => {
            if (activeRoom) {
                socketService.emit('leave_chat', { chatRoomId: activeRoom._id });
            }
            // we do NOT disconnect the socket globally because they might go to another page
        };
    }, []);

    // Socket Event Listeners for Messages
    useEffect(() => {
        const handleReceiveMessage = (msg: Message) => {
            if (activeRoom && msg.room_id === activeRoom._id) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        };

        socketService.on('receive_message', handleReceiveMessage);
        return () => {
            socketService.off('receive_message', handleReceiveMessage);
        };
    }, [activeRoom]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const fetchChatRooms = async () => {
        try {
            const data = await getChatRooms();
            const formatted = data.rooms.map((r: any) => ({
                ...r,
                displayName: r.room_type === 'direct' ? r.other_user_name : r.project_title || `Team: ${r.team_id}`,
                displayPic: r.room_type === 'direct' ? r.other_user_pic : null,
            }));
            setChatRooms(formatted);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyTeams = async () => {
        try {
            const response = await api.get('/api/teams/my-teams');
            // The backend returns a list of TeamResponse directly as the request body
            setUserTeams(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const data = await searchDevelopersForChat(query);
                setSearchResults(data.users);
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    const handleStartDirectChat = async (other_user_id: number, name: string) => {
        try {
            const data = await createOrGetDirectChat(other_user_id);
            const room = { ...data.room, displayName: name };
            openRoom(room);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStartTeamChat = async (team_id: string, project_title: string) => {
        try {
            const data = await getTeamChat(team_id);
            const room = { ...data.room, displayName: project_title };
            openRoom(room);
        } catch (error) {
            console.error(error);
        }
    };

    const openRoom = async (room: ChatRoom) => {
        if (activeRoom) {
            socketService.emit('leave_chat', { chatRoomId: activeRoom._id });
        }

        // Mark as read locally
        setChatRooms(prev => prev.map(r =>
            r._id === room._id && r.last_message
                ? { ...r, last_message: { ...r.last_message, is_read: true } }
                : r
        ));

        // Let the backend know to mark as read
        try {
            await api.post(`/api/chat/${room._id}/mark-read`);
        } catch (e) {
            console.error("Failed to mark as read", e);
        }

        setActiveRoom(room);
        setIsLoadingMessages(true);
        socketService.emit('join_chat', { chatRoomId: room._id });

        try {
            const data = await getRoomMessages(room._id);
            setMessages(data.messages);
            scrollToBottom();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeRoom) return;

        const tempMsg = newMessage;
        setNewMessage('');

        try {
            const data = await sendMessage(activeRoom._id, tempMsg);
            socketService.emit('send_message', {
                chatRoomId: activeRoom._id,
                message: data.message
            });
            // Immediately append to own screen to avoid waiting for socket loopback
            // (Wait, actually we should let the socket loopback handle it, or handle it here).
            // Let's add it locally for instant feedback.
            setMessages((prev) => [...prev, data.message]);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    // Shared Styles
    const panelBg = 'linear-gradient(135deg, rgba(20, 15, 10, 0.4) 0%, rgba(212, 175, 55, 0.05) 100%)';
    const panelBorder = '1px solid rgba(212, 175, 55, 0.2)';

    return (
        <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: c.bg, position: 'relative' }}>
            <ChatTopBar />

            {/* Main Interface Layout */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.8 }}
                style={{
                    width: '100%', height: 'calc(100vh - 90px)', marginTop: '90px',
                    display: 'flex', justifyContent: 'center', padding: '0 24px 24px 24px'
                }}
            >
                <Box sx={{
                    width: { xs: '95%', sm: '85%', md: '80%', lg: '65%' },
                    maxWidth: '1200px',
                    display: 'flex', gap: '24px', height: '100%'
                }}>
                    {/* Left Sidebar (Search, History, Teams) */}
                    <Paper sx={{
                        width: '350px', height: '100%', background: panelBg,
                        backdropFilter: 'blur(10px)', border: panelBorder, borderRadius: '24px',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        {/* Search */}
                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <TextField
                                fullWidth
                                placeholder="Search for a developer to chat..."
                                variant="outlined"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Search sx={{ color: GOLD }} /></InputAdornment>,
                                    sx: {
                                        bgcolor: 'rgba(255,255,255,0.05)', color: c.textPrimary,
                                        borderRadius: '12px', '& fieldset': { border: 'none' },
                                    }
                                }}
                            />
                        </Box>

                        {/* Tabs / Content */}
                        <Box sx={{ flex: 1, overflowY: 'auto' }}>
                            {searchQuery.length >= 2 ? (
                                <List>
                                    {isSearching ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} sx={{ color: GOLD }} /></Box>
                                    ) : searchResults.map(user => (
                                        <ListItem key={user.auth_user_id} sx={{
                                            cursor: 'pointer', transition: '0.3s',
                                            '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' }
                                        }} onClick={() => handleStartDirectChat(user.auth_user_id, user.name)}>
                                            <ListItemAvatar><Avatar src={user.profile_picture || ""} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}><Person /></Avatar></ListItemAvatar>
                                            <ListItemText primary={user.name} secondary={`@${user.username}`} secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
                                        </ListItem>
                                    ))}
                                    {!isSearching && searchResults.length === 0 && (
                                        <Typography sx={{ p: 3, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No developers found.</Typography>
                                    )}
                                </List>
                            ) : (
                                <>
                                    <Stack direction="row" sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Button fullWidth onClick={() => setActiveTab('history')} sx={{
                                            color: activeTab === 'history' ? GOLD : 'rgba(255,255,255,0.5)',
                                            borderBottom: activeTab === 'history' ? `2px solid ${GOLD}` : 'none',
                                            borderRadius: 0, fontFamily: 'Space Grotesk'
                                        }}>History</Button>
                                        <Button fullWidth onClick={() => setActiveTab('teams')} sx={{
                                            color: activeTab === 'teams' ? GOLD : 'rgba(255,255,255,0.5)',
                                            borderBottom: activeTab === 'teams' ? `2px solid ${GOLD}` : 'none',
                                            borderRadius: 0, fontFamily: 'Space Grotesk'
                                        }}>My Teams</Button>
                                    </Stack>

                                    <List>
                                        {activeTab === 'history' && chatRooms.map(room => {
                                            const isUnread = room.last_message && room.last_message.sender_id !== currentUserId && !room.last_message.is_read;
                                            const isSelected = activeRoom?._id === room._id;

                                            return (
                                                <ListItem key={room._id} sx={{
                                                    cursor: 'pointer', transition: '0.3s',
                                                    bgcolor: isSelected ? 'rgba(212,175,55,0.15)' : (isUnread ? 'rgba(212,175,55,0.08)' : 'transparent'),
                                                    borderLeft: isUnread && !isSelected ? `4px solid ${GOLD}` : '4px solid transparent',
                                                    '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' }
                                                }} onClick={() => openRoom(room)}>
                                                    <ListItemAvatar>
                                                        <Avatar src={room.displayPic || ""} sx={{ bgcolor: room.room_type === 'team' ? GOLD : 'rgba(255,255,255,0.1)' }}>
                                                            {room.room_type === 'team' ? <Group /> : <Person />}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={room.displayName || "Unknown Room"}
                                                        secondary={room.last_message?.text ? `${room.last_message.text.substring(0, 30)}...` : 'No messages yet'}
                                                        primaryTypographyProps={{ sx: { color: isUnread ? GOLD : c.textPrimary, fontWeight: isUnread ? 700 : 600 } }}
                                                        secondaryTypographyProps={{ sx: { color: isUnread ? 'rgba(212,175,55,0.8)' : 'rgba(255,255,255,0.5)', fontWeight: isUnread ? 500 : 400 } }}
                                                    />
                                                    {isUnread && (
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GOLD, boxShadow: `0 0 10px ${GOLD}` }} />
                                                    )}
                                                </ListItem>
                                            )
                                        })}

                                        {activeTab === 'teams' && userTeams.map(team => (
                                            <ListItem key={team.project_id} sx={{
                                                cursor: 'pointer', transition: '0.3s',
                                                bgcolor: activeRoom?.team_id === team.project_id ? 'rgba(212,175,55,0.15)' : 'transparent',
                                                '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' }
                                            }} onClick={() => handleStartTeamChat(team.project_id, team.project_title)}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: GOLD }}><Group sx={{ color: '#000' }} /></Avatar>
                                                </ListItemAvatar>
                                                <ListItemText primary={team.project_title || "Unknown Project"} secondary={`${team.team_members?.length || 0} members`}
                                                    primaryTypographyProps={{ sx: { color: c.textPrimary, fontWeight: 600 } }}
                                                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </>
                            )}
                        </Box>
                    </Paper>

                    {/* Right Area (Chat View) */}
                    <Paper sx={{
                        flex: 1, height: '100%', background: panelBg,
                        backdropFilter: 'blur(10px)', border: panelBorder, borderRadius: '24px',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        {activeRoom ? (
                            <>
                                {/* Chat Header */}
                                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar src={activeRoom.displayPic || ""} sx={{ bgcolor: activeRoom.room_type === 'team' ? GOLD : 'rgba(255,255,255,0.1)' }}>
                                        {activeRoom.room_type === 'team' ? <Group /> : <Person />}
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: c.textPrimary, fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                                        {activeRoom.displayName}
                                    </Typography>
                                </Box>

                                {/* Chat Messages */}
                                <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {isLoadingMessages ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <CircularProgress sx={{ color: GOLD }} />
                                        </Box>
                                    ) : (
                                        <>
                                            {messages.map((msg, index) => {
                                                const isMine = msg.sender_id === currentUserId;
                                                return (
                                                    <Box key={msg._id || index} sx={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', mb: 1 }}>
                                                        {!isMine && activeRoom.room_type === 'team' && (
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', mb: 0.5, ml: 1, fontFamily: 'Space Grotesk' }}>
                                                                {msg.sender_name || 'Team Member'}
                                                            </Typography>
                                                        )}
                                                        <Box sx={{
                                                            maxWidth: '60%', p: 1.5, borderRadius: '16px',
                                                            bgcolor: isMine ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                                                            border: isMine ? `1px solid rgba(212,175,55,0.4)` : '1px solid rgba(255,255,255,0.1)',
                                                            borderBottomRightRadius: isMine ? 4 : 16,
                                                            borderBottomLeftRadius: isMine ? 16 : 4,
                                                        }}>
                                                            <Typography sx={{ color: c.textPrimary, fontSize: '0.85rem' }}>{msg.text}</Typography>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textAlign: 'right', mt: 0.5 }}>
                                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </Box>

                                {/* Chat Input */}
                                <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Type your message..."
                                        variant="outlined"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handleSendMessage} disabled={!newMessage.trim()} sx={{ color: GOLD }}>
                                                        <Send />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                bgcolor: 'rgba(255,255,255,0.05)', color: c.textPrimary,
                                                borderRadius: '16px', '& fieldset': { border: 'none' },
                                            }
                                        }}
                                    />
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                                <ChatIcon sx={{ fontSize: 60, color: GOLD, mb: 2 }} />
                                <Typography sx={{ color: c.textPrimary, fontFamily: 'Space Grotesk' }}>Select a chat to start messaging.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </motion.div>

            {/* Close Button back to dashboard */}
            <IconButton
                onClick={() => router.push('/dashboard')}
                sx={{ position: 'absolute', top: 24, left: 24, color: c.textPrimary, zIndex: 200, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: GOLD, color: '#000' } }}
            >
                <ArrowBack />
            </IconButton>
        </Box>
    );
}

