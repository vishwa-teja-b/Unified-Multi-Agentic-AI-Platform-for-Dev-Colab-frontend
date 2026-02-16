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
    Groups,
    ArrowForward,
    Person,
    Star,
    AccessTime,
    Folder,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { projectApi, TeamResponse } from '@/utils/projectApi';
import { TopBar } from '@/components/shared/TopBar';
import { DistortedBackground } from '@/components/shared/DistortedBackground';

const MotionBox = motion(Box);
const GOLD = '#D4AF37';

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

function getRoleColor(role: string): string {
    const map: Record<string, string> = {
        owner: '#D4AF37',
        admin: '#a855f7',
        mobile_developer: '#60a5fa',
        backend_developer: '#34d399',
        frontend_developer: '#f472b6',
        ui_ux_designer: '#fbbf24',
        member: '#94a3b8',
    };
    return map[role.toLowerCase()] || '#94a3b8';
}

function formatRole(role: string): string {
    return role
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export default function TeamsPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<TeamResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await projectApi.getMyTeams();
            setTeams(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load teams');
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
                            My Teams
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            All teams you're a part of across your projects.
                        </Typography>
                    </Box>

                    {/* Stats Bar */}
                    {!loading && !error && teams.length > 0 && (
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
                                <Groups sx={{ color: GOLD, fontSize: 22 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                    <strong style={{ color: 'white' }}>{teams.length}</strong> {teams.length === 1 ? 'Team' : 'Teams'}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Person sx={{ color: '#60a5fa', fontSize: 22 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                    <strong style={{ color: 'white' }}>
                                        {teams.reduce((acc, t) => acc + t.team_members.length, 0)}
                                    </strong> Total Members
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
                            action={<Button color="inherit" size="small" onClick={fetchTeams}>Retry</Button>}
                            sx={{
                                bgcolor: 'rgba(239,68,68,0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239,68,68,0.2)',
                            }}
                        >
                            {error}
                        </Alert>
                    ) : teams.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <AnimatePresence>
                            <Stack spacing={3}>
                                {teams.map((team, i) => (
                                    <TeamCard key={team.id} team={team} index={i} router={router} />
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
                <Groups sx={{ fontSize: 56 }} />
            </Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 0.5, fontFamily: 'Space Grotesk' }}>
                No teams yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3 }}>
                Create a project or accept an invitation to join a team.
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
                Browse Projects
            </Button>
        </MotionBox>
    );
}

function TeamCard({ team, index, router }: { team: TeamResponse; index: number; router: any }) {
    const currentUserId = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('user_id') || '0')
        : 0;
    const myRole = team.team_members.find(m => m.user_id === currentUserId)?.role || 'member';
    const isOwner = team.project_owner === currentUserId;

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: index * 0.06 }}
            onClick={() => router.push(`/projects/${team.project_id}`)}
            sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                p: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: GOLD,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    boxShadow: `0 0 25px rgba(212, 175, 55, 0.1)`,
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
                {/* Left: Team Info */}
                <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flex: 1 }}>
                    <Avatar sx={{
                        width: 52,
                        height: 52,
                        bgcolor: 'rgba(212,175,55,0.1)',
                        color: GOLD,
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        border: '1px solid rgba(212,175,55,0.2)',
                    }}>
                        {team.project_title.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{
                                color: 'white',
                                fontFamily: 'Space Grotesk',
                            }}>
                                {team.project_title}
                            </Typography>
                            {isOwner && (
                                <Chip
                                    icon={<Star sx={{ fontSize: '14px !important', color: '#D4AF37 !important' }} />}
                                    label="Owner"
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(212,175,55,0.12)',
                                        color: GOLD,
                                        fontWeight: 700,
                                        fontSize: '0.65rem',
                                        borderRadius: '6px',
                                        height: 22,
                                    }}
                                />
                            )}
                        </Stack>

                        {/* Role */}
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1 }}>
                            Your role: <span style={{ color: getRoleColor(myRole), fontWeight: 600 }}>
                                {formatRole(myRole)}
                            </span>
                        </Typography>

                        {/* Members */}
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <AvatarGroup
                                max={5}
                                sx={{
                                    '& .MuiAvatar-root': {
                                        width: 28, height: 28,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        border: '2px solid rgba(20,20,20,0.8)',
                                        color: 'rgba(255,255,255,0.7)',
                                    },
                                }}
                            >
                                {team.team_members.map((member) => (
                                    <Avatar
                                        key={member.user_id}
                                        sx={{
                                            bgcolor: getRoleColor(member.role) + '30',
                                            color: getRoleColor(member.role),
                                        }}
                                    >
                                        {member.username
                                            ? member.username.charAt(0).toUpperCase()
                                            : `#${member.user_id}`}
                                    </Avatar>
                                ))}
                            </AvatarGroup>

                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                {team.team_members.length} {team.team_members.length === 1 ? 'member' : 'members'}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                {/* Right: Meta + Arrow */}
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTime sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                            Formed {timeAgo(team.created_at)}
                        </Typography>
                    </Stack>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: GOLD,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                    }}>
                        View Project <ArrowForward sx={{ fontSize: 16 }} />
                    </Box>
                </Stack>
            </Stack>

            {/* Member Tags Row */}
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {team.team_members.map((member) => (
                    <Chip
                        key={member.user_id}
                        label={`${member.username || `User #${member.user_id}`} · ${formatRole(member.role)}`}
                        size="small"
                        sx={{
                            bgcolor: getRoleColor(member.role) + '15',
                            color: getRoleColor(member.role),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            borderRadius: '8px',
                            border: `1px solid ${getRoleColor(member.role)}25`,
                        }}
                    />
                ))}
            </Stack>
        </MotionBox>
    );
}
