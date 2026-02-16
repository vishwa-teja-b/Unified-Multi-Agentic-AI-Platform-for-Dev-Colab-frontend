'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
    onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.5, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#000000',
                zIndex: 9999, // Must sit on top of everything
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none', // Allow clicking through after it fades (though we ideally unmount it)
            }}
        >
            {/* 1. Logo with Border */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <Box
                    sx={{
                        border: '1px solid rgba(255, 255, 255, 1)',
                        padding: '12px 24px',
                        mb: 4,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontWeight: 700,
                            color: 'white',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}
                    >
                        DEV COLAB
                    </Typography>
                </Box>
            </motion.div>

            {/* 2. Progress Line */}
            <Box
                sx={{
                    width: 100,
                    height: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{
                        delay: 0,
                        duration: 1.5, // Fills in 1.5s
                        ease: "linear",
                    }}
                    style={{
                        height: '100%',
                        backgroundColor: 'white',
                    }}
                />
            </Box>
        </motion.div>
    );
};
