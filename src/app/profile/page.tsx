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
    Paper,
} from '@mui/material';
import {
    Edit,
    LocationOn,
    Email,
    GitHub,
    LinkedIn,
    Language,
    Schedule,
    Code,
    Interests,
    WorkspacePremium,
    TrendingUp,
    Verified,
    Translate,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { profileApi, ProfileData } from '@/utils/profileApi';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/shared/TopBar';
import { DistortedBackground } from '@/components/shared/DistortedBackground';

const MotionBox = motion(Box);
const GOLD = '#D4AF37';

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileApi.getProfile();
                if (!data) {
                    router.push('/profile/create');
                    return;
                }
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#050505',
            }}>
                <CircularProgress sx={{ color: GOLD }} />
            </Box>
        );
    }

    if (!profile) return null;

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
                {/* Actions */}
                <Container maxWidth="lg" sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => router.push('/profile/create')}
                        sx={{
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            borderRadius: '50px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            fontFamily: 'Space Grotesk',
                            backdropFilter: 'blur(10px)',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '&:hover': {
                                borderColor: GOLD,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: GOLD,
                            },
                        }}
                    >
                        Edit Profile
                    </Button>
                </Container>

                {/* Hero Section */}
                <Container maxWidth="lg">
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        sx={{
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '32px',
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
                            height: '2px',
                            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                            opacity: 0.5,
                        }} />

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                            {/* Avatar with ring */}
                            <Box sx={{ position: 'relative' }}>
                                <Box sx={{
                                    position: 'absolute',
                                    inset: -3,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${GOLD}, transparent)`,
                                    p: '2px',
                                    opacity: 0.6,
                                }} />
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        color: GOLD,
                                        fontSize: '3rem',
                                        fontWeight: 700,
                                        border: '4px solid #050505',
                                        fontFamily: 'Space Grotesk',
                                        boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                                    }}
                                    src={profile.profile_picture}
                                >
                                    {profile.name[0]}
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
                                            color: 'white',
                                            letterSpacing: '-0.02em',
                                            fontFamily: 'Space Grotesk',
                                        }}
                                    >
                                        {profile.name}
                                    </Typography>
                                    <Verified sx={{ color: GOLD, fontSize: 24 }} />
                                </Stack>

                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, fontSize: '1.1rem', fontFamily: 'Space Grotesk' }}>
                                    @{profile.username}
                                </Typography>

                                {profile.preferred_role && (
                                    <Chip
                                        icon={<WorkspacePremium sx={{ color: 'black !important', fontSize: 16 }} />}
                                        label={profile.preferred_role}
                                        sx={{
                                            bgcolor: GOLD,
                                            color: 'black',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            mb: 3,
                                            height: 28,
                                            borderRadius: '8px',
                                            fontFamily: 'Space Grotesk',
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
                                            <LocationOn sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
                                            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                                {profile.city}{profile.country ? `, ${profile.country}` : ''}
                                            </Typography>
                                        </Stack>
                                    )}
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Email sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{profile.email}</Typography>
                                    </Stack>
                                    {profile.availability_hours && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Schedule sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
                                            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{profile.availability_hours} hrs/week</Typography>
                                        </Stack>
                                    )}
                                </Stack>

                                {/* Social Links */}
                                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                                    {[
                                        { link: profile.github, icon: GitHub, label: 'GitHub' },
                                        { link: profile.linkedin, icon: LinkedIn, label: 'LinkedIn' },
                                        { link: profile.portfolio, icon: Language, label: 'Portfolio' }
                                    ].map((item, idx) => (
                                        item.link && (
                                            <Tooltip key={idx} title={item.label} arrow>
                                                <IconButton
                                                    component="a"
                                                    href={item.link}
                                                    target="_blank"
                                                    sx={{
                                                        bgcolor: 'rgba(255,255,255,0.05)',
                                                        color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        width: 40,
                                                        height: 40,
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            borderColor: GOLD,
                                                            color: GOLD,
                                                            bgcolor: 'rgba(255,255,255,0.08)',
                                                            transform: 'translateY(-2px)',
                                                        },
                                                    }}
                                                >
                                                    <item.icon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </MotionBox>

                    {/* Content Grid - Replaced with Stack for better compatibility */}
                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                        {/* Left Column - About & Skills */}
                        <Box sx={{ flex: 2, width: '100%' }}>
                            <Stack spacing={3}>
                                {/* About */}
                                <MotionBox
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        backdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 4,
                                        p: 4,
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: 'Space Grotesk' }}>
                                        <Box sx={{ color: GOLD, fontSize: '1.2rem' }}>✦</Box>
                                        About Me
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
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        backdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 4,
                                        p: 4,
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                        <Box sx={{
                                            p: 1,
                                            borderRadius: '8px',
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            color: GOLD,
                                            display: 'flex',
                                        }}>
                                            <Code sx={{ fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk' }}>Skills & Stack</Typography>
                                    </Stack>

                                    {/* Primary Skills */}
                                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                                        Primary Skills
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                                        {profile.primary_skills?.length > 0 ? profile.primary_skills.map((skill) => (
                                            <Chip
                                                key={skill}
                                                label={skill}
                                                sx={{
                                                    bgcolor: 'rgba(212, 175, 55, 0.15)',
                                                    color: '#F0C040',
                                                    border: '1px solid rgba(212, 175, 55, 0.2)',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem',
                                                    height: 32,
                                                    borderRadius: '8px',
                                                    fontFamily: 'Space Grotesk',
                                                    '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.25)' },
                                                }}
                                            />
                                        )) : (
                                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No primary skills listed</Typography>
                                        )}
                                    </Box>

                                    {/* Secondary Skills */}
                                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                                        Secondary Skills
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {profile.secondary_skills?.length > 0 ? profile.secondary_skills.map((skill) => (
                                            <Chip
                                                key={skill}
                                                label={skill}
                                                variant="outlined"
                                                sx={{
                                                    borderColor: 'rgba(255,255,255,0.1)',
                                                    color: 'rgba(255,255,255,0.6)',
                                                    fontWeight: 500,
                                                    fontSize: '0.85rem',
                                                    height: 30,
                                                    borderRadius: '8px',
                                                    '&:hover': {
                                                        borderColor: 'rgba(255,255,255,0.3)',
                                                        color: 'white',
                                                    },
                                                }}
                                            />
                                        )) : (
                                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No secondary skills listed</Typography>
                                        )}
                                    </Box>
                                </MotionBox>
                            </Stack>
                        </Box>

                        {/* Right Column - Stats */}
                        <Box sx={{ flex: 1, width: '100%' }}>
                            <Stack spacing={3}>
                                {/* Experience Level */}
                                <MotionBox
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 4,
                                        p: 3,
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                                        <Box sx={{
                                            p: 1,
                                            borderRadius: '8px',
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            color: GOLD,
                                            display: 'flex',
                                        }}>
                                            <TrendingUp sx={{ fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk' }}>Experience</Typography>
                                    </Stack>
                                    <Chip
                                        label={profile.experience_level || 'Not specified'}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            fontWeight: 600,
                                            textTransform: 'capitalize',
                                            fontSize: '0.9rem',
                                            height: 36,
                                            borderRadius: '8px',
                                            width: '100%',
                                        }}
                                    />
                                </MotionBox>

                                {/* Languages */}
                                <MotionBox
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 4,
                                        p: 3,
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                                        <Box sx={{
                                            p: 1,
                                            borderRadius: '8px',
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            color: GOLD,
                                            display: 'flex',
                                        }}>
                                            <Translate sx={{ fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk' }}>Languages</Typography>
                                    </Stack>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {profile.languages?.length > 0 ? profile.languages.map((lang) => (
                                            <Chip
                                                key={lang}
                                                label={lang}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                    color: 'rgba(255,255,255,0.8)',
                                                    fontSize: '0.85rem',
                                                    borderRadius: '6px',
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
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 4,
                                        p: 3,
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                                        <Box sx={{
                                            p: 1,
                                            borderRadius: '8px',
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            color: GOLD,
                                            display: 'flex',
                                        }}>
                                            <Interests sx={{ fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk' }}>Interests</Typography>
                                    </Stack>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {profile.interests?.length > 0 ? profile.interests.map((interest) => (
                                            <Chip
                                                key={interest}
                                                label={interest}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                    color: 'rgba(255,255,255,0.8)',
                                                    fontSize: '0.85rem',
                                                    borderRadius: '6px',
                                                }}
                                            />
                                        )) : (
                                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>None listed</Typography>
                                        )}
                                    </Box>
                                </MotionBox>
                            </Stack>
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
