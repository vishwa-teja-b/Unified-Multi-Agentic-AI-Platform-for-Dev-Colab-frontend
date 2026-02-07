'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Chip,
    Stack,
    Button,
    CircularProgress,
    IconButton,
    Tooltip,
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
    ArrowBack,
    Check,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profileApi, ProfileData } from '@/utils/profileApi';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            {/* Navigation */}
            <Container maxWidth="lg">
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Button
                        component={Link}
                        href="/"
                        startIcon={<ArrowBack />}
                        sx={{ color: 'text.secondary', textTransform: 'none' }}
                    >
                        Home
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => router.push('/profile/create')}
                        disableElevation
                        sx={{
                            bgcolor: 'text.primary',
                            color: 'background.default',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: 'text.secondary' }
                        }}
                    >
                        Edit Profile
                    </Button>
                </Stack>
            </Container>

            {/* Hero Section */}
            <Container maxWidth="lg">
                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        border: theme => `1px solid ${theme.palette.divider}`,
                        mb: 3,
                    }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems={{ xs: 'center', md: 'flex-start' }}>
                        {/* Avatar */}
                        <Avatar
                            sx={{
                                width: 140,
                                height: 140,
                                bgcolor: 'primary.main',
                                fontSize: '3.5rem',
                                fontWeight: 700,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            }}
                            src={profile.profile_picture}
                        >
                            {profile.name[0]}
                        </Avatar>

                        {/* Info */}
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                            <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                                {profile.name}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                @{profile.username}
                            </Typography>

                            {profile.preferred_role && (
                                <Chip
                                    label={profile.preferred_role}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        fontWeight: 600,
                                        mb: 3,
                                    }}
                                />
                            )}

                            {/* Meta Info */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={3}
                                sx={{ color: 'text.secondary', flexWrap: 'wrap' }}
                            >
                                {profile.city && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LocationOn fontSize="small" />
                                        <Typography variant="body2">{profile.city}, {profile.country}</Typography>
                                    </Stack>
                                )}
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Email fontSize="small" />
                                    <Typography variant="body2">{profile.email}</Typography>
                                </Stack>
                                {profile.availability_hours && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Schedule fontSize="small" />
                                        <Typography variant="body2">{profile.availability_hours} hrs/week</Typography>
                                    </Stack>
                                )}
                            </Stack>

                            {/* Social Links */}
                            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                                {profile.github && (
                                    <Tooltip title="GitHub">
                                        <IconButton
                                            href={profile.github}
                                            target="_blank"
                                            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
                                        >
                                            <GitHub />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {profile.linkedin && (
                                    <Tooltip title="LinkedIn">
                                        <IconButton
                                            href={profile.linkedin}
                                            target="_blank"
                                            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
                                        >
                                            <LinkedIn />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {profile.portfolio && (
                                    <Tooltip title="Portfolio">
                                        <IconButton
                                            href={profile.portfolio}
                                            target="_blank"
                                            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
                                        >
                                            <Language />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </MotionPaper>

                {/* Content Grid */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {/* Left Column */}
                    <Box sx={{ flex: 2 }}>
                        <Stack spacing={3}>
                            {/* Bio */}
                            <MotionPaper
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                                    About
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                                    {profile.bio || 'No bio provided yet.'}
                                </Typography>
                            </MotionPaper>

                            {/* Skills */}
                            <MotionPaper
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                    <Code color="primary" />
                                    <Typography variant="h6" fontWeight="700">Skills & Stack</Typography>
                                </Stack>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    Primary Skills
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                    {profile.primary_skills?.length > 0 ? profile.primary_skills.map(skill => (
                                        <Chip
                                            key={skill}
                                            label={skill}
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                fontWeight: 500,
                                            }}
                                        />
                                    )) : (
                                        <Typography variant="body2" color="text.secondary">No primary skills listed</Typography>
                                    )}
                                </Box>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    Secondary Skills
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {profile.secondary_skills?.length > 0 ? profile.secondary_skills.map(skill => (
                                        <Chip key={skill} label={skill} variant="outlined" />
                                    )) : (
                                        <Typography variant="body2" color="text.secondary">No secondary skills listed</Typography>
                                    )}
                                </Box>
                            </MotionPaper>
                        </Stack>
                    </Box>

                    {/* Right Column */}
                    <Box sx={{ flex: 1 }}>
                        <Stack spacing={3}>
                            {/* Experience */}
                            <MotionPaper
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                                    Experience Level
                                </Typography>
                                <Chip
                                    icon={<Check />}
                                    label={profile.experience_level || 'Not specified'}
                                    sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                                />
                            </MotionPaper>

                            {/* Languages */}
                            <MotionPaper
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                                    Languages
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {profile.languages?.length > 0 ? profile.languages.map(lang => (
                                        <Chip key={lang} label={lang} size="small" variant="outlined" />
                                    )) : (
                                        <Typography variant="body2" color="text.secondary">None listed</Typography>
                                    )}
                                </Box>
                            </MotionPaper>

                            {/* Interests */}
                            <MotionPaper
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <Interests color="secondary" />
                                    <Typography variant="h6" fontWeight="700">Interests</Typography>
                                </Stack>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {profile.interests?.length > 0 ? profile.interests.map(interest => (
                                        <Chip
                                            key={interest}
                                            label={interest}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    )) : (
                                        <Typography variant="body2" color="text.secondary">None listed</Typography>
                                    )}
                                </Box>
                            </MotionPaper>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}
