'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Modal,
    Typography,
    Stack,
    Chip,
    Button,
    IconButton,
    Avatar,
    CircularProgress,
    Alert,
    LinearProgress,
    Divider,
    Snackbar,
} from '@mui/material';
import {
    Close,
    Person,
    AccessTime,
    Public,
    Send,
    Visibility,
    AutoAwesome,
    Groups,
    CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import teamFormationApi, { CandidateRecommendation, TeamFormationRequest } from '@/utils/teamFormationApi';
import { projectApi } from '@/utils/projectApi';

const MotionBox = motion(Box);

interface TeamRecommendationsModalProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectTitle: string;
    requiredSkills: string[];
    teamSize: number;
    timeline: string;
}

function getTimezoneLabel(tzDiff: number): { label: string; color: string } {
    if (tzDiff <= 2) return { label: 'Excellent', color: '#22c55e' };
    if (tzDiff <= 5) return { label: 'Good', color: '#eab308' };
    return { label: 'Challenging', color: '#ef4444' };
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
}

export default function TeamRecommendationsModal({
    open,
    onClose,
    projectId,
    projectTitle,
    requiredSkills,
    teamSize,
    timeline,
}: TeamRecommendationsModalProps) {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<CandidateRecommendation[]>([]);
    const [inviteLoading, setInviteLoading] = useState<string | null>(null);
    const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (open && recommendations.length === 0) {
            fetchRecommendations();
        }
    }, [open]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const request: TeamFormationRequest = {
                project_id: projectId,
                project_title: projectTitle,
                required_skills: requiredSkills,
                team_size: teamSize,
                timeline: timeline,
            };
            const response = await teamFormationApi.findTeammates(request);
            if (response.error) {
                setError(response.error);
            } else {
                setRecommendations(response.recommendations || []);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async (candidate: CandidateRecommendation) => {
        setInviteLoading(candidate.username);
        try {
            const senderId = Number(localStorage.getItem('user_id') || '0');
            await projectApi.sendInvitation({
                project_id: projectId,
                sender_id: senderId,
                receiver_username: candidate.username,
                project_title: projectTitle,
                role: candidate.role,
            });
            setSentInvites(prev => new Set(prev).add(candidate.username));
            setSnackbar({ open: true, message: `Invitation sent to @${candidate.username}!`, severity: 'success' });
        } catch (err: any) {
            const detail = err.response?.data?.detail || 'Failed to send invitation';
            setSnackbar({ open: true, message: detail, severity: 'error' });
        } finally {
            setInviteLoading(null);
        }
    };

    const handleViewProfile = (username: string) => {
        // Navigate to profile page with username
        router.push(`/profile/${username}`);
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 900,
                        maxHeight: '90vh',
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 24,
                        border: 'none',
                        outline: 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 3,
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.default',
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(168,85,247,0.2)',
                                    }}
                                >
                                    <Groups color="primary" sx={{ fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
                                        Recommended Team
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        For "{projectTitle}"
                                    </Typography>
                                </Box>
                            </Stack>
                            <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
                                <Close />
                            </IconButton>
                        </Stack>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        {loading ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: '#a855f7', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                    AI is finding the best teammates for your project...
                                </Typography>
                            </Box>
                        ) : error ? (
                            <Alert
                                severity="error"
                                action={
                                    <Button color="inherit" size="small" onClick={fetchRecommendations}>
                                        Retry
                                    </Button>
                                }
                                sx={{ mb: 2 }}
                            >
                                {error}
                            </Alert>
                        ) : recommendations.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <AutoAwesome sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                                    No recommendations found
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                    Try adjusting your project skills or expanding the team size
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={3}>
                                {recommendations.map((candidate, index) => {
                                    const scorePercent = candidate.match_score;
                                    const scoreColor = getScoreColor(candidate.match_score / 100);
                                    const tzInfo = getTimezoneLabel(candidate.timezone_diff || 0);
                                    const skills = candidate.skills.split(/[,\s]+/).filter(Boolean);

                                    return (
                                        <MotionBox
                                            key={`${candidate.email}-${index}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            sx={{
                                                bgcolor: 'background.default',
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 3,
                                                p: 3,
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    boxShadow: 1,
                                                },
                                            }}
                                        >
                                            {/* Candidate Header */}
                                            <Stack
                                                direction={{ xs: 'column', sm: 'row' }}
                                                justifyContent="space-between"
                                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                                spacing={2}
                                                sx={{ mb: 2 }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                        sx={{
                                                            width: 56,
                                                            height: 56,
                                                            bgcolor: '#6366f1',
                                                            fontSize: '1.25rem',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {(candidate.name || candidate.username || 'U')
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary' }}>
                                                            {candidate.name || candidate.username || 'Unknown'}
                                                        </Typography>
                                                        {candidate.username && (
                                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                @{candidate.username}
                                                            </Typography>
                                                        )}
                                                        <Chip
                                                            label={candidate.role}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'action.selected',
                                                                color: 'primary.main',
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>

                                                {/* Match Score */}
                                                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Match Score
                                                    </Typography>
                                                    <Typography
                                                        variant="h4"
                                                        fontWeight="800"
                                                        sx={{ color: scoreColor }}
                                                    >
                                                        {scorePercent}%
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            {/* Stats Row */}
                                            <Stack
                                                direction="row"
                                                spacing={3}
                                                sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                        {candidate.availability_hours} hrs/week
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Public sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                        {candidate.timezone}
                                                    </Typography>
                                                    <Chip
                                                        label={tzInfo.label}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            bgcolor: `${tzInfo.color}20`,
                                                            color: tzInfo.color,
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Stack>
                                            </Stack>

                                            {/* Skills */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: 'text.secondary', mb: 1, display: 'block' }}
                                                >
                                                    Skills
                                                </Typography>
                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                                    {skills.slice(0, 6).map((skill, i) => (
                                                        <Chip
                                                            key={i}
                                                            label={skill}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'action.hover',
                                                                color: 'text.primary',
                                                                fontSize: '0.7rem',
                                                            }}
                                                        />
                                                    ))}
                                                    {skills.length > 6 && (
                                                        <Chip
                                                            label={`+${skills.length - 6}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'action.hover',
                                                                color: 'text.secondary',
                                                                fontSize: '0.7rem',
                                                            }}
                                                        />
                                                    )}
                                                </Stack>
                                            </Box>

                                            {/* Reason (if provided) */}
                                            {candidate.reasoning && (
                                                <Box
                                                    sx={{
                                                        bgcolor: 'action.hover',
                                                        borderRadius: '8px',
                                                        p: 2,
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                        <strong>Why:</strong> "{candidate.reasoning}"
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Divider sx={{ my: 2 }} />

                                            {/* Actions */}
                                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Visibility />}
                                                    onClick={() => handleViewProfile(candidate.username)}
                                                    sx={{
                                                        color: 'text.secondary',
                                                        borderColor: 'divider',
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            borderColor: 'text.primary',
                                                            bgcolor: 'action.hover',
                                                        },
                                                    }}
                                                >
                                                    View Profile
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    startIcon={
                                                        inviteLoading === candidate.username
                                                            ? <CircularProgress size={16} color="inherit" />
                                                            : sentInvites.has(candidate.username)
                                                                ? <CheckCircle />
                                                                : <Send />
                                                    }
                                                    onClick={() => handleSendInvite(candidate)}
                                                    disabled={inviteLoading === candidate.username || sentInvites.has(candidate.username)}
                                                    sx={{
                                                        bgcolor: sentInvites.has(candidate.username) ? 'success.main' : 'primary.main',
                                                        color: 'primary.contrastText',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        '&:hover': { bgcolor: sentInvites.has(candidate.username) ? 'success.dark' : 'primary.dark' },
                                                        '&.Mui-disabled': { bgcolor: sentInvites.has(candidate.username) ? 'success.main' : 'action.disabledBackground', color: 'text.disabled', opacity: 0.8 },
                                                    }}
                                                >
                                                    {sentInvites.has(candidate.username) ? 'Invited ✓' : 'Send Invite'}
                                                </Button>
                                            </Stack>
                                        </MotionBox>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Modal>

            {/* Snackbar for invite feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
