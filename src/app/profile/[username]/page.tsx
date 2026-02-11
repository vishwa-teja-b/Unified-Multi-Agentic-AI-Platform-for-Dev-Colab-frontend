'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Avatar,
    Chip,
    Stack,
    Button,
    CircularProgress,
    IconButton,
    Tooltip,
    Grid,
} from '@mui/material';
import {
    LocationOn,
    Email,
    GitHub,
    LinkedIn,
    Language,
    Schedule,
    Code,
    Interests,
    ArrowBack,
    WorkspacePremium,
    TrendingUp,
    Verified,
    Translate,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/utils/api';

const MotionBox = motion(Box);

interface ProfileData {
    id: string;
    auth_user_id: number;
    username: string;
    name: string;
    email: string;
    bio?: string;
    city?: string;
    country?: string;
    timezone?: string;
    availability_hours?: number;
    experience_level?: string;
    preferred_role?: string;
    primary_skills?: string[];
    secondary_skills?: string[];
    interests?: string[];
    languages?: string[];
    github?: string;
    linkedin?: string;
    portfolio?: string;
    profile_picture?: string;
}

export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/api/profiles/profile/${username}`);
                setProfile(response.data);
            } catch (err: any) {
                console.error("Failed to fetch profile", err);
                setError(err.response?.data?.detail || 'Profile not found');
            } finally {
                setLoading(false);
            }
        };
        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #0a0a1a 0%, #12122a 100%)',
            }}>
                <CircularProgress sx={{ color: '#a855f7' }} />
            </Box>
        );
    }

    if (error || !profile) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #0a0a1a 0%, #12122a 100%)',
                gap: 3,
            }}>
                <Typography variant="h5" sx={{ color: '#ef4444' }}>
                    {error || 'Profile not found'}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => router.back()}
                    sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                    Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0a0a1a 0%, #12122a 50%, #1a1a2e 100%)',
            position: 'relative',
            overflow: 'hidden',
            pb: 8,
        }}>
            {/* Subtle grid pattern overlay */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
            }} />

            {/* Glow effects */}
            <Box sx={{
                position: 'absolute',
                top: '-20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '500px',
                background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
            }} />

            {/* Navigation */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
                    <Button
                        onClick={() => router.back()}
                        startIcon={<ArrowBack />}
                        sx={{
                            color: 'rgba(255,255,255,0.6)',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                        }}
                    >
                        Back
                    </Button>
                </Stack>
            </Container>

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{
                        background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.9) 0%, rgba(30, 30, 50, 0.8) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        borderRadius: '28px',
                        p: { xs: 4, md: 5 },
                        mb: 4,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Top gradient accent */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #a855f7, #6366f1, #ec4899)',
                    }} />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                        {/* Avatar with ring */}
                        <Box sx={{ position: 'relative' }}>
                            <Box sx={{
                                position: 'absolute',
                                inset: -4,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                p: '3px',
                            }}>
                                <Box sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    bgcolor: '#0a0a1a',
                                }} />
                            </Box>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                                    fontSize: '3rem',
                                    fontWeight: 700,
                                    position: 'relative',
                                    boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3)',
                                }}
                                src={profile.profile_picture}
                            >
                                {(profile.name || profile.username || 'U')[0]}
                            </Avatar>
                        </Box>

                        {/* Info */}
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 0.5 }}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                        background: 'linear-gradient(135deg, #fff 0%, #e0e0ff 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {profile.name || profile.username}
                                </Typography>
                                <Verified sx={{ color: '#a855f7', fontSize: 28 }} />
                            </Stack>

                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, fontSize: '1.1rem' }}>
                                @{profile.username}
                            </Typography>

                            {profile.preferred_role && (
                                <Chip
                                    icon={<WorkspacePremium sx={{ color: '#fff !important', fontSize: 18 }} />}
                                    label={profile.preferred_role}
                                    sx={{
                                        background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        mb: 3,
                                        px: 1,
                                        height: 36,
                                        borderRadius: '10px',
                                        '& .MuiChip-icon': { color: '#fff' },
                                    }}
                                />
                            )}

                            {/* Meta Info */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 1.5, sm: 3 }}
                                sx={{ flexWrap: 'wrap' }}
                                alignItems={{ xs: 'center', md: 'flex-start' }}
                            >
                                {profile.city && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LocationOn sx={{ color: '#f472b6', fontSize: 20 }} />
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                                            {profile.city}{profile.country ? `, ${profile.country}` : ''}
                                        </Typography>
                                    </Stack>
                                )}
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Email sx={{ color: '#60a5fa', fontSize: 20 }} />
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{profile.email}</Typography>
                                </Stack>
                                {profile.availability_hours && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Schedule sx={{ color: '#a78bfa', fontSize: 20 }} />
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{profile.availability_hours} hrs/week</Typography>
                                    </Stack>
                                )}
                            </Stack>

                            {/* Social Links */}
                            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                                {profile.github && (
                                    <Tooltip title="GitHub" arrow>
                                        <IconButton
                                            component="a"
                                            href={profile.github}
                                            target="_blank"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                color: '#fff',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                width: 44,
                                                height: 44,
                                                '&:hover': {
                                                    bgcolor: '#24292e',
                                                    borderColor: '#24292e',
                                                    transform: 'translateY(-3px)',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <GitHub />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {profile.linkedin && (
                                    <Tooltip title="LinkedIn" arrow>
                                        <IconButton
                                            component="a"
                                            href={profile.linkedin}
                                            target="_blank"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                color: '#fff',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                width: 44,
                                                height: 44,
                                                '&:hover': {
                                                    bgcolor: '#0077b5',
                                                    borderColor: '#0077b5',
                                                    transform: 'translateY(-3px)',
                                                    boxShadow: '0 8px 24px rgba(0,119,181,0.4)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <LinkedIn />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {profile.portfolio && (
                                    <Tooltip title="Portfolio" arrow>
                                        <IconButton
                                            component="a"
                                            href={profile.portfolio}
                                            target="_blank"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                color: '#fff',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                width: 44,
                                                height: 44,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                                    borderColor: 'transparent',
                                                    transform: 'translateY(-3px)',
                                                    boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <Language />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </MotionBox>

                {/* Content Grid */}
                <Grid container spacing={3}>
                    {/* Left Column - About & Skills */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Stack spacing={3}>
                            {/* About */}
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                sx={{
                                    background: 'rgba(20, 20, 40, 0.6)',
                                    backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '20px',
                                    p: 4,
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: '1.2rem',
                                    }}>✦</Box>
                                    About
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1rem' }}>
                                    {profile.bio || 'No bio provided yet.'}
                                </Typography>
                            </MotionBox>

                            {/* Skills */}
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                sx={{
                                    background: 'rgba(20, 20, 40, 0.6)',
                                    backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '20px',
                                    p: 4,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                    <Box sx={{
                                        p: 1.2,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                                        display: 'flex',
                                    }}>
                                        <Code sx={{ color: '#818cf8', fontSize: 22 }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Skills & Stack</Typography>
                                </Stack>

                                {/* Primary Skills */}
                                <Typography sx={{ color: 'rgba(255,255,255,0.4)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem', fontWeight: 600 }}>
                                    Primary Skills
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                                    {profile.primary_skills?.length ? profile.primary_skills.map((skill) => (
                                        <Chip
                                            key={skill}
                                            label={skill}
                                            sx={{
                                                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                height: 34,
                                                borderRadius: '10px',
                                                '&:hover': { transform: 'scale(1.05)' },
                                                transition: 'transform 0.2s ease',
                                            }}
                                        />
                                    )) : (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No primary skills listed</Typography>
                                    )}
                                </Box>

                                {/* Secondary Skills */}
                                <Typography sx={{ color: 'rgba(255,255,255,0.4)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem', fontWeight: 600 }}>
                                    Secondary Skills
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {profile.secondary_skills?.length ? profile.secondary_skills.map((skill) => (
                                        <Chip
                                            key={skill}
                                            label={skill}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                color: 'rgba(255,255,255,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                fontWeight: 500,
                                                fontSize: '0.85rem',
                                                height: 32,
                                                borderRadius: '8px',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                    transform: 'scale(1.05)',
                                                },
                                                transition: 'all 0.2s ease',
                                            }}
                                        />
                                    )) : (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No secondary skills listed</Typography>
                                    )}
                                </Box>
                            </MotionBox>
                        </Stack>
                    </Grid>

                    {/* Right Column - Stats */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={3}>
                            {/* Experience Level */}
                            <MotionBox
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                sx={{
                                    background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                                    border: '1px solid rgba(236,72,153,0.2)',
                                    borderRadius: '20px',
                                    p: 3.5,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                                    <Box sx={{
                                        p: 1.2,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))',
                                        display: 'flex',
                                    }}>
                                        <TrendingUp sx={{ color: '#f472b6', fontSize: 22 }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Experience</Typography>
                                </Stack>
                                <Chip
                                    label={profile.experience_level || 'Not specified'}
                                    sx={{
                                        background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))',
                                        color: '#f9a8d4',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        border: '1px solid rgba(236,72,153,0.3)',
                                        fontSize: '0.95rem',
                                        height: 38,
                                        borderRadius: '10px',
                                    }}
                                />
                            </MotionBox>

                            {/* Languages */}
                            <MotionBox
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                sx={{
                                    background: 'linear-gradient(135deg, rgba(96,165,250,0.1) 0%, rgba(99,102,241,0.1) 100%)',
                                    border: '1px solid rgba(96,165,250,0.2)',
                                    borderRadius: '20px',
                                    p: 3.5,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                                    <Box sx={{
                                        p: 1.2,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(99,102,241,0.2))',
                                        display: 'flex',
                                    }}>
                                        <Translate sx={{ color: '#60a5fa', fontSize: 22 }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Languages</Typography>
                                </Stack>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {profile.languages?.length ? profile.languages.map((lang) => (
                                        <Chip
                                            key={lang}
                                            label={lang}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(96,165,250,0.15)',
                                                color: '#93c5fd',
                                                border: '1px solid rgba(96,165,250,0.25)',
                                                fontWeight: 500,
                                                fontSize: '0.85rem',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    )) : (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>None listed</Typography>
                                    )}
                                </Box>
                            </MotionBox>

                            {/* Interests */}
                            <MotionBox
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                sx={{
                                    background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                                    border: '1px solid rgba(168,85,247,0.2)',
                                    borderRadius: '20px',
                                    p: 3.5,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                                    <Box sx={{
                                        p: 1.2,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.2))',
                                        display: 'flex',
                                    }}>
                                        <Interests sx={{ color: '#c084fc', fontSize: 22 }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Interests</Typography>
                                </Stack>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {profile.interests?.length ? profile.interests.map((interest) => (
                                        <Chip
                                            key={interest}
                                            label={interest}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(168,85,247,0.15)',
                                                color: '#d8b4fe',
                                                border: '1px solid rgba(168,85,247,0.25)',
                                                fontWeight: 500,
                                                fontSize: '0.85rem',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    )) : (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>None listed</Typography>
                                    )}
                                </Box>
                            </MotionBox>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
