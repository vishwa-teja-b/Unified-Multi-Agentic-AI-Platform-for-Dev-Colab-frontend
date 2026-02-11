'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

// 3D Robot Character constructed with CSS/Framer Motion
export const InteractiveAvatar = ({ focusedField }: { focusedField: string | null }) => {
    // Eye movement logic based on focused field
    const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        switch (focusedField) {
            case 'title':
                setEyePos({ x: 0, y: -5 });
                break;
            case 'description':
                setEyePos({ x: 0, y: 5 });
                break;
            case 'category':
                setEyePos({ x: -5, y: 8 });
                break;
            case 'skills':
                setEyePos({ x: 5, y: -2 });
                break;
            case 'team_size':
                setEyePos({ x: 0, y: 0 });
                break;
            case 'details':
                setEyePos({ x: 5, y: 5 });
                break;
            default:
                setEyePos({ x: 0, y: 0 });
        }
    }, [focusedField]);

    return (
        <Box sx={{
            position: 'relative',
            width: 400,
            height: 400,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            perspective: '1000px'
        }}>
            {/* Floating Animation Wrapper */}
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'relative', width: 220, height: 220, transformStyle: 'preserve-3d' }}
            >
                {/* HEAD SHAPE */}
                <Box sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '45%',
                    background: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #d6d6d6 100%)',
                    boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.1), inset 10px 10px 20px rgba(255,255,255,1), 0 20px 40px rgba(0,0,0,0.2)',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.8)',
                    transform: 'rotateX(5deg)',
                }}>
                    {/* Face Screen */}
                    <Box sx={{
                        position: 'absolute',
                        top: '15%',
                        left: '10%',
                        width: '80%',
                        height: '65%',
                        borderRadius: '35%',
                        background: '#111',
                        border: '4px solid #333',
                        boxShadow: 'inset 0 0 20px #000',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 3
                    }}>
                        {/* LEFT EYE */}
                        <motion.div
                            animate={{ x: eyePos.x, y: eyePos.y }}
                            transition={{ type: "spring", stiffness: 150, damping: 15 }}
                            style={{
                                width: 50,
                                height: 70,
                                borderRadius: '30px',
                                background: 'linear-gradient(180deg, #00C6FF 0%, #0072FF 100%)',
                                boxShadow: '0 0 15px #00C6FF',
                                position: 'relative'
                            }}
                        >
                            {/* Eye Reflection */}
                            <Box sx={{ position: 'absolute', top: 10, left: 10, width: 12, height: 12, borderRadius: '50%', bgcolor: 'white', opacity: 0.8 }} />
                        </motion.div>

                        {/* RIGHT EYE */}
                        <motion.div
                            animate={{ x: eyePos.x, y: eyePos.y }}
                            transition={{ type: "spring", stiffness: 150, damping: 15 }}
                            style={{
                                width: 50,
                                height: 70,
                                borderRadius: '30px',
                                background: 'linear-gradient(180deg, #00C6FF 0%, #0072FF 100%)',
                                boxShadow: '0 0 15px #00C6FF',
                                position: 'relative'
                            }}
                        >
                            {/* Eye Reflection */}
                            <Box sx={{ position: 'absolute', top: 10, left: 10, width: 12, height: 12, borderRadius: '50%', bgcolor: 'white', opacity: 0.8 }} />
                        </motion.div>

                        {/* Blink Animation Overlay */}
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: [0, 1, 0, 0, 0] }}
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.9, 1] }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: '#111',
                                transformOrigin: 'top',
                                zIndex: 10
                            }}
                        />
                    </Box>

                    {/* Antenna */}
                    <Box sx={{
                        position: 'absolute',
                        top: -30,
                        left: '50%',
                        width: 6,
                        height: 30,
                        bgcolor: '#ccc',
                        transform: 'translateX(-50%)',
                        zIndex: -1
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: -12,
                            left: '50%',
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: '#ff4d4d',
                            transform: 'translateX(-50%)',
                            boxShadow: '0 0 10px #ff4d4d'
                        }} />
                    </Box>

                    {/* Cheeks */}
                    <Box sx={{ position: 'absolute', bottom: 40, left: 30, width: 20, height: 10, borderRadius: '50%', bgcolor: 'rgba(255,100,100,0.1)', filter: 'blur(2px)' }} />
                    <Box sx={{ position: 'absolute', bottom: 40, right: 30, width: 20, height: 10, borderRadius: '50%', bgcolor: 'rgba(255,100,100,0.1)', filter: 'blur(2px)' }} />
                </Box>
            </motion.div>

            {/* Shadow */}
            <Box sx={{
                position: 'absolute',
                bottom: 80,
                width: 150,
                height: 20,
                borderRadius: '50%',
                bgcolor: 'rgba(0,0,0,0.1)',
                filter: 'blur(8px)',
                zIndex: -2,
                animation: 'shadowPulse 4s ease-in-out infinite'
            }} />
        </Box>
    );
};
