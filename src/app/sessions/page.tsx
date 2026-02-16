'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Stack,
    Chip,
    Avatar,
    CircularProgress,
    Alert,
    Button,
    AvatarGroup,
} from '@mui/material';
import {
    Terminal,
    ArrowForward,
    Code,
    AccessTime,
    InsertDriveFile,
    People,
    PlayArrow,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { projectApi } from '@/utils/projectApi';
import { TopBar } from '@/components/shared/TopBar';
import { DistortedBackground } from '@/components/shared/DistortedBackground';

const MotionBox = motion(Box);
const GOLD = '#D4AF37';

interface RoomSession {
    room_id: string;
    project_id: string;
    project_title?: string;
    participants: Array<{
        user_id: string;
        username: string;
        avatar?: string;
        role: string;
    }>;
    files: Array<{
        id: string;
        name: string;
        content: string;
        language?: string;
    }>;
    created_at: string;
    updated_at?: string;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
}

function getLanguageColor(lang?: string): string {
    const map: Record<string, string> = {
        javascript: '#f7df1e',
        typescript: '#3178c6',
        python: '#3572A5',
        java: '#b07219',
        html: '#e34c26',
        css: '#563d7c',
        cpp: '#f34b7d',
        c: '#555555',
        go: '#00ADD8',
        rust: '#dea584',
    };
    return map[lang?.toLowerCase() || ''] || '#94a3b8';
}

export default function SessionsPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<RoomSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await projectApi.getMyRooms();
            setSessions(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#050505',
            color: 'white',
            overflowX: 'hidden',
            position: 'relative',
        }}>
            <DistortedBackground />
            <TopBar />

            <Box sx={{ pt: '120px', pb: 8, position: 'relative', zIndex: 10 }}>
                <Container maxWidth="lg">
                    {/* Header */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h3" fontWeight="800" sx={{
                            letterSpacing: '-0.02em',
                            mb: 0.5,
                            fontFamily: 'Space Grotesk',
                            color: 'white',
                        }}>
                            Sessions
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Your active collaboration coding sessions.
                        </Typography>
                    </Box>

                    {/* Stats Bar */}
                    {!loading && !error && sessions.length > 0 && (
                        <Stack
                            direction="row"
                            spacing={3}
                            sx={{
                                mb: 4,
                                p: 2.5,
                                borderRadius: '16px',
                                bgcolor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Terminal sx={{ color: GOLD, fontSize: 22 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                    <strong style={{ color: 'white' }}>{sessions.length}</strong> {sessions.length === 1 ? 'Session' : 'Sessions'}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <InsertDriveFile sx={{ color: '#60a5fa', fontSize: 22 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                    <strong style={{ color: 'white' }}>
                                        {sessions.reduce((acc, s) => acc + (s.files?.length || 0), 0)}
                                    </strong> Total Files
                                </Typography>
                            </Stack>
                        </Stack>
                    )}

                    {/* Content */}
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: GOLD }} />
                        </Box>
                    ) : error ? (
                        <Alert
                            severity="error"
                            action={<Button color="inherit" size="small" onClick={fetchSessions}>Retry</Button>}
                            sx={{
                                bgcolor: 'rgba(239,68,68,0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239,68,68,0.2)',
                            }}
                        >
                            {error}
                        </Alert>
                    ) : sessions.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <AnimatePresence>
                            <Stack spacing={3}>
                                {sessions.map((session, i) => (
                                    <SessionCard key={session.room_id} session={session} index={i} router={router} />
                                ))}
                            </Stack>
                        </AnimatePresence>
                    )}
                </Container>
            </Box>
        </Box>
    );
}

// ---- Sub-components ----

function EmptyState() {
    const router = useRouter();
    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                textAlign: 'center',
                py: 10,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
            }}
        >
            <Box sx={{ color: 'rgba(255,255,255,0.1)', mb: 2 }}>
                <Terminal sx={{ fontSize: 56 }} />
            </Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 0.5, fontFamily: 'Space Grotesk' }}>
                No sessions yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
                Start a collaboration session from any project with a generated roadmap.
            </Typography>
            <Button
                variant="outlined"
                onClick={() => router.push('/projects')}
                sx={{
                    borderColor: GOLD,
                    color: GOLD,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px',
                    px: 3,
                    '&:hover': {
                        bgcolor: 'rgba(212,175,55,0.1)',
                        borderColor: GOLD,
                    },
                }}
            >
                Go to Projects
            </Button>
        </MotionBox>
    );
}

function SessionCard({ session, index, router }: { session: RoomSession; index: number; router: any }) {
    const fileCount = session.files?.length || 0;
    const participantCount = session.participants?.length || 0;

    // Get unique file languages
    const languages = [...new Set(
        (session.files || [])
            .map(f => f.language)
            .filter(Boolean)
    )];

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: index * 0.06 }}
            onClick={() => router.push(`/room/${session.room_id}`)}
            sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                p: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: '#34d399',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    boxShadow: `0 0 25px rgba(52, 211, 153, 0.1)`,
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
            >
                {/* Left: Session Info */}
                <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flex: 1 }}>
                    <Avatar sx={{
                        width: 52,
                        height: 52,
                        bgcolor: 'rgba(52,211,153,0.1)',
                        color: '#34d399',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        border: '1px solid rgba(52,211,153,0.2)',
                    }}>
                        <Code />
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{
                                color: 'white',
                                fontFamily: 'Space Grotesk',
                            }}>
                                {session.project_title || 'Untitled Session'}
                            </Typography>
                            <Chip
                                icon={<PlayArrow sx={{ fontSize: '14px !important', color: '#34d399 !important' }} />}
                                label="Active"
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(52,211,153,0.12)',
                                    color: '#34d399',
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    borderRadius: '6px',
                                    height: 22,
                                }}
                            />
                        </Stack>

                        {/* Stats row */}
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <InsertDriveFile sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                    {fileCount} {fileCount === 1 ? 'file' : 'files'}
                                </Typography>
                            </Stack>
                            {participantCount > 0 && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <People sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>

                        {/* Language tags */}
                        {languages.length > 0 && (
                            <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                {languages.map(lang => (
                                    <Chip
                                        key={lang}
                                        label={lang}
                                        size="small"
                                        sx={{
                                            bgcolor: getLanguageColor(lang) + '20',
                                            color: getLanguageColor(lang),
                                            fontWeight: 600,
                                            fontSize: '0.65rem',
                                            borderRadius: '6px',
                                            height: 20,
                                            border: `1px solid ${getLanguageColor(lang)}30`,
                                        }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>

                {/* Right: Meta + CTA */}
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTime sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                            Created {timeAgo(session.created_at)}
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/room/${session.room_id}`);
                        }}
                        disableElevation
                        sx={{
                            bgcolor: '#34d399',
                            color: '#050505',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '10px',
                            px: 2.5,
                            fontSize: '0.8rem',
                            '&:hover': {
                                bgcolor: '#2dd4a0',
                                boxShadow: '0 0 15px rgba(52,211,153,0.3)',
                            },
                        }}
                    >
                        Resume
                    </Button>
                </Stack>
            </Stack>

            {/* File list preview */}
            {fileCount > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {(session.files || []).slice(0, 6).map(file => (
                        <Chip
                            key={file.id}
                            icon={<InsertDriveFile sx={{ fontSize: '14px !important', color: `${getLanguageColor(file.language)} !important` }} />}
                            label={file.name}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.04)',
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        />
                    ))}
                    {fileCount > 6 && (
                        <Chip
                            label={`+${fileCount - 6} more`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.04)',
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.7rem',
                                borderRadius: '8px',
                            }}
                        />
                    )}
                </Stack>
            )}
        </MotionBox>
    );
}
