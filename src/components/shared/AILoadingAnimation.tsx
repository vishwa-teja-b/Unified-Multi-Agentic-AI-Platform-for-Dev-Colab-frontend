'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

const GOLD = '#D4AF37';

// ── Message pools ──────────────────────────────────────────────────
const TEAMMATES_MESSAGES = [
    "Scanning developer profiles across the platform...",
    "Matching skills to your project requirements...",
    "Evaluating timezone compatibility for smooth collaboration...",
    "Ranking candidates by collaboration potential...",
    "Analyzing experience levels and past projects...",
    "Cross-referencing preferred tech stacks...",
    "Calculating team synergy scores...",
    "Fun fact: Diverse teams solve problems 60% faster!",
    "Checking availability and commitment preferences...",
    "Almost there — finalizing top recommendations...",
    "Great teams aren't found — they're built by AI 🤖",
    "Reviewing code contribution patterns...",
];

const ROADMAP_MESSAGES = [
    "Analyzing project requirements and complexity...",
    "Breaking down features into actionable sprints...",
    "Estimating task durations and dependencies...",
    "Assigning difficulty levels to each milestone...",
    "Crafting your personalized project roadmap...",
    "Optimizing sprint distribution for your timeline...",
    "Fun fact: Agile teams deliver value 37% faster!",
    "Mapping critical path dependencies...",
    "Balancing workload across sprint cycles...",
    "Almost there — polishing your project plan...",
    "Adding buffer time for the unexpected 🎯",
    "Sequencing tasks for maximum parallel execution...",
];

const SESSION_MESSAGES = [
    "Spinning up your collaborative workspace...",
    "Initializing the code editor and file system...",
    "Connecting to the real-time collaboration server...",
    "Setting up live cursors and presence tracking...",
    "Loading your project roadmap into the workspace...",
    "Preparing the integrated terminal...",
    "Fun fact: Pair programming catches 60% more bugs!",
    "Syncing whiteboard for collaborative brainstorming...",
    "Almost there — your session is almost ready...",
    "Configuring language support and IntelliSense...",
    "Let's build something amazing together 🚀",
    "Getting the chat system ready for your team...",
];

// ── Animated SVG Brain/Circuit ─────────────────────────────────────
function AnimatedBrainSVG() {
    return (
        <Box sx={{ position: 'relative', width: 180, height: 180, mx: 'auto' }}>
            {/* Pulsing rings */}
            {[0, 1, 2].map((i) => (
                <MotionBox
                    key={`ring-${i}`}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 120 + i * 40,
                        height: 120 + i * 40,
                        borderRadius: '50%',
                        border: `1.5px solid ${GOLD}`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                        opacity: [0.15, 0.4, 0.15],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: 2.5,
                        delay: i * 0.5,
                        repeat: Infinity,
                        ease: 'easeInOut' as const,
                    }}
                />
            ))}

            {/* Orbiting particles */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <MotionBox
                    key={`particle-${i}`}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 6 + (i % 3) * 2,
                        height: 6 + (i % 3) * 2,
                        borderRadius: '50%',
                        bgcolor: i % 2 === 0 ? GOLD : '#F0C040',
                        boxShadow: `0 0 8px ${GOLD}80`,
                    }}
                    animate={{
                        x: [
                            Math.cos((i * Math.PI) / 3) * 70,
                            Math.cos((i * Math.PI) / 3 + Math.PI) * 70,
                            Math.cos((i * Math.PI) / 3) * 70,
                        ],
                        y: [
                            Math.sin((i * Math.PI) / 3) * 70,
                            Math.sin((i * Math.PI) / 3 + Math.PI) * 70,
                            Math.sin((i * Math.PI) / 3) * 70,
                        ],
                        opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        ease: 'easeInOut' as const,
                    }}
                />
            ))}

            {/* Central brain/circuit SVG */}
            <MotionBox
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
            >
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Brain outline */}
                    <motion.path
                        d="M40 8C28 8 20 16 18 24C14 24 8 28 8 36C8 42 12 46 16 48C16 56 22 64 32 66C36 68 40 68 40 68C40 68 44 68 48 66C58 64 64 56 64 48C68 46 72 42 72 36C72 28 66 24 62 24C60 16 52 8 40 8Z"
                        stroke={GOLD}
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0.3 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' as const, ease: 'linear' as const }}
                    />
                    {/* Neural connections */}
                    {[
                        "M28 30 Q40 25 52 30",
                        "M24 40 Q40 35 56 40",
                        "M28 50 Q40 45 52 50",
                        "M40 20 L40 60",
                        "M30 25 L50 55",
                        "M50 25 L30 55",
                    ].map((path, i) => (
                        <motion.path
                            key={i}
                            d={path}
                            stroke={GOLD}
                            strokeWidth="1"
                            fill="none"
                            opacity={0.4}
                            animate={{ opacity: [0.2, 0.7, 0.2] }}
                            transition={{
                                duration: 2,
                                delay: i * 0.3,
                                repeat: Infinity,
                                ease: 'easeInOut' as const,
                            }}
                        />
                    ))}
                    {/* Neural nodes */}
                    {[
                        [28, 30], [52, 30], [24, 40], [56, 40],
                        [28, 50], [52, 50], [40, 20], [40, 40], [40, 60],
                    ].map(([cx, cy], i) => (
                        <motion.circle
                            key={`node-${i}`}
                            cx={cx}
                            cy={cy}
                            r="3"
                            fill={GOLD}
                            animate={{
                                r: [2, 4, 2],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                delay: i * 0.2,
                                repeat: Infinity,
                                ease: 'easeInOut' as const,
                            }}
                        />
                    ))}
                </svg>
            </MotionBox>
        </Box>
    );
}

// ── Fake progress bar ──────────────────────────────────────────────
function FakeProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return prev;
                // Logarithmic: fast start, slow middle, slight acceleration near end
                if (prev < 30) return prev + Math.random() * 3 + 1;
                if (prev < 70) return prev + Math.random() * 0.8 + 0.2;
                return prev + Math.random() * 1.5 + 0.3;
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ width: '100%', maxWidth: 320, mx: 'auto', mt: 3 }}>
            <Box
                sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                }}
            >
                <MotionBox
                    sx={{
                        height: '100%',
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${GOLD}, #F0C040, ${GOLD})`,
                        backgroundSize: '200% 100%',
                    }}
                    animate={{
                        width: `${progress}%`,
                        backgroundPosition: ['0% 0%', '200% 0%'],
                    }}
                    transition={{
                        width: { duration: 0.5, ease: 'easeOut' as const },
                        backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' as const },
                    }}
                />
            </Box>
            <Typography
                variant="caption"
                sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 0.5,
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'Space Grotesk',
                    fontSize: '0.7rem',
                }}
            >
                {Math.round(progress)}%
            </Typography>
        </Box>
    );
}

// ── Main component ─────────────────────────────────────────────────
interface AILoadingAnimationProps {
    mode: 'teammates' | 'roadmap' | 'session';
}

export default function AILoadingAnimation({ mode }: AILoadingAnimationProps) {
    const messages = mode === 'teammates'
        ? TEAMMATES_MESSAGES
        : mode === 'roadmap'
            ? ROADMAP_MESSAGES
            : SESSION_MESSAGES;
    const [messageIndex, setMessageIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    // Rotate messages every 3.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [messages.length]);

    // Elapsed time counter
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatElapsed = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const title = mode === 'teammates'
        ? 'Finding Your Dream Team'
        : mode === 'roadmap'
            ? 'Crafting Your Roadmap'
            : 'Launching Your Session';

    return (
        <Box
            sx={{
                textAlign: 'center',
                py: { xs: 4, md: 6 },
                px: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
            }}
        >
            {/* Animated SVG */}
            <AnimatedBrainSVG />

            {/* Title */}
            <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <Typography
                    variant="h5"
                    fontWeight="700"
                    sx={{
                        fontFamily: 'Space Grotesk',
                        background: `linear-gradient(135deg, ${GOLD}, #F0C040)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5,
                    }}
                >
                    {title}
                </Typography>
            </MotionBox>

            {/* Rotating messages */}
            <Box sx={{ height: 28, position: 'relative', width: '100%', maxWidth: 420 }}>
                <AnimatePresence mode="wait">
                    <MotionTypography
                        key={messageIndex}
                        variant="body2"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4 }}
                        sx={{
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'Space Grotesk',
                            position: 'absolute',
                            width: '100%',
                            textAlign: 'center',
                        }}
                    >
                        {messages[messageIndex]}
                    </MotionTypography>
                </AnimatePresence>
            </Box>

            {/* Progress bar */}
            <FakeProgressBar />

            {/* Elapsed time */}
            <MotionBox
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255,255,255,0.25)',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        letterSpacing: 1,
                    }}
                >
                    Working for {formatElapsed(elapsed)}...
                </Typography>
            </MotionBox>
        </Box>
    );
}
