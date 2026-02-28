'use client';

import React from 'react';
import { Box, IconButton, Tooltip, Badge } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useThemeColors } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatWidget = () => {
    const router = useRouter();
    const pathname = usePathname();
    const c = useThemeColors();
    const GOLD = c.gold;

    // As requested, only render the chat widget on the dashboard
    if (pathname !== '/dashboard') {
        return null;
    }

    const handleClick = () => {
        // As requested by user: clear TopBar anim state so it fades nicely on return
        sessionStorage.removeItem('topbar_anim_done');
        router.push('/chats');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ scale: 0, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 50 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 200,
                }}
            >
                <Tooltip title="Open Chats" placement="left">
                    <IconButton
                        onClick={handleClick}
                        sx={{
                            width: 60,
                            height: 60,
                            backgroundColor: '#1a1a1a',
                            border: `1px solid rgba(212, 175, 55, 0.4)`,
                            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(212, 175, 55, 0.1)`,
                            backdropFilter: 'blur(10px)',
                            color: c.textPrimary,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: GOLD,
                                color: 'black',
                                boxShadow: `0 0 20px ${GOLD}, inset 0 0 20px rgba(0, 0, 0, 0.2)`,
                            }
                        }}
                    >
                        {/* Example of unread badge, can be derived from socket state later */}
                        <Badge badgeContent={0} color="error" overlap="circular">
                            <ChatIcon sx={{ fontSize: 28 }} />
                        </Badge>
                    </IconButton>
                </Tooltip>
            </motion.div>
        </AnimatePresence>
    );
};
