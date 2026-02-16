'use client';

import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';
const DARK_BG = '#050505';

export const DistortedBackground = () => {
    return (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', bgcolor: DARK_BG }}>
            {/* 4K Background Image - Team Collaboration */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.2,
                backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=3840&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.4) contrast(1.1)', // Removed grayscale, darkened for text readability
            }} />

            {/* Noise Overlay */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
                backgroundRepeat: 'repeat',
                pointerEvents: 'none',
            }} />

            {/* Distorted Glow - Right */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 45, 0],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '60vw',
                    height: '60vw',
                    background: `radial-gradient(circle, ${GOLD}10 0%, transparent 70%)`,
                    filter: 'blur(100px)',
                    borderRadius: '40%',
                }}
            />

            {/* Distorted Glow - Left */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 50, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '-10%',
                    width: '50vw',
                    height: '50vw',
                    background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)`,
                    filter: 'blur(80px)',
                    borderRadius: '50%',
                }}
            />
        </Box>
    );
};
