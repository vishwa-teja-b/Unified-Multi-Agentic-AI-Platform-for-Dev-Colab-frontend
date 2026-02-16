'use client';

import React from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowForward } from '@mui/icons-material';

export const HeroContent = () => {
    return (
        <Container maxWidth="xl" sx={{ height: '100%', position: 'relative', zIndex: 20 }}>
            {/* Centered Content */}
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    pt: 10,
                }}
            >
                {/* 1. Primary Headline: BUILD THE FUTURE */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 2.0, // Sync with shorter loading
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '3rem', md: '5rem', lg: '8rem' },
                            fontWeight: 900,
                            fontFamily: 'Space Grotesk, sans-serif',
                            letterSpacing: '-0.02em',
                            lineHeight: 0.9,
                            color: 'white',
                            textTransform: 'uppercase',
                            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            mb: 2,
                        }}
                    >
                        BUILD THE<br />FUTURE
                    </Typography>
                </motion.div>

                {/* 2. Secondary Headline: UNITE. CREATE. DEPLOY. */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    transition={{
                        delay: 2.2,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontSize: { xs: '1rem', md: '1.5rem' },
                            fontWeight: 600,
                            fontFamily: 'Space Grotesk, sans-serif',
                            letterSpacing: '0.4em', // Wide spacing
                            color: 'white',
                            textTransform: 'uppercase',
                            mb: 6,
                        }}
                    >
                        UNITE. CREATE. DEPLOY.
                    </Typography>
                </motion.div>

                {/* 3. Call to Action: START YOUR JOURNEY */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        delay: 2.5,
                        duration: 0.5,
                    }}
                >
                    <Box
                        component="a"
                        href="/dashboard"
                        sx={{
                            cursor: 'pointer',
                            textDecoration: 'none',
                            group: 'hover',
                        }}
                    >
                        <Stack direction="column" alignItems="center" spacing={1}>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'white',
                                    letterSpacing: '0.2em',
                                    fontWeight: 500,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        color: '#00FFD1', // Neon Cyan
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                START YOUR JOURNEY
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 1,
                                    bgcolor: 'white',
                                    opacity: 0.5,
                                    transition: 'all 0.3s ease',
                                    '.MuiTypography-root:hover + &': {
                                        bgcolor: '#00FFD1',
                                        opacity: 1,
                                        height: 2,
                                    },
                                }}
                            />
                        </Stack>
                    </Box>
                </motion.div>
            </Box>
        </Container>
    );
};
