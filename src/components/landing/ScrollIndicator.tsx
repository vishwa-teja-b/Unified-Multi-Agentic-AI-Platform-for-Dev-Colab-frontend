'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { KeyboardArrowDown } from '@mui/icons-material';

import Link from 'next/link';

export const ScrollIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.7, duration: 0.5 }}
            style={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
            }}
        >
            <Box
                component={Link}
                href="/dashboard"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                        opacity: 0.8,
                    },
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        letterSpacing: '0.2em',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                    }}
                >
                    EXPLORE
                </Typography>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <KeyboardArrowDown sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 32 }} />
                </motion.div>
            </Box>
        </motion.div>
    );
};
