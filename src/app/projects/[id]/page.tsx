'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Stack,
    Chip,
    Button,
    Paper,
    Divider,
    TextField,
    MenuItem,
    Slider,
    InputAdornment,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Avatar,
    Tabs,
    Tab,
} from '@mui/material';
import {
    ArrowBack,
    Edit,
    Delete,
    Save,
    Cancel,
    AccessTime,
    Group,
    CheckCircle,
    Add as AddIcon,
    Groups,
    PersonAdd,
    AutoAwesome,
    Code,
} from '@mui/icons-material';
import TeamRecommendationsModal from '@/components/TeamRecommendationsModal';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { projectApi, ProjectResponse, ProjectCreateData, TeamResponse, TeamMember, ProjectPlannerResponse } from '@/utils/projectApi';
import { profileApi } from '@/utils/profileApi';
import RoadmapView from '@/components/projects/RoadmapView';
import { TopBar } from '@/components/shared/TopBar';
import { DistortedBackground } from '@/components/shared/DistortedBackground';
import AILoadingAnimation from '@/components/shared/AILoadingAnimation';

const CATEGORIES = ["Full Stack", "Frontend", "Backend", "Mobile", "Data Science", "AI/ML", "DevOps", "Other"];
const COMPLEXITIES = ["Easy", "Medium", "Hard"];
const GOLD = '#D4AF37';

const MotionPaper = motion(Paper);

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [featureInput, setFeatureInput] = useState('');
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [authUserId, setAuthUserId] = useState<number | null>(null);

    // Join request state
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [joinRole, setJoinRole] = useState('');
    const [joinMessage, setJoinMessage] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    // Team members state
    const [teamData, setTeamData] = useState<TeamResponse | null>(null);
    const [teamLoading, setTeamLoading] = useState(false);
    const [isTeamMember, setIsTeamMember] = useState(false);

    // Roadmap state
    const [tabValue, setTabValue] = useState(0);
    const [roadmapData, setRoadmapData] = useState<ProjectPlannerResponse | null>(null);
    const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
    const [fetchedRoadmap, setFetchedRoadmap] = useState(false);
    const [startingSession, setStartingSession] = useState(false);

    const { control, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<ProjectCreateData>();
    const features = watch('features') || [];

    useEffect(() => {
        // Fetch current user's profile to get authoritative ID
        const fetchProfile = async () => {
            try {
                const identity = await profileApi.getIdentity();
                if (identity?.user_id) {
                    setAuthUserId(identity.user_id);
                }
            } catch (error) {
                console.error("Failed to fetch profile/identity", error);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchProject = async () => {
            try {
                const data = await projectApi.getProjectById(id as string);
                setProject(data);
                reset(data);
            } catch (err) {
                console.error("Failed to load project", err);
                setError("Failed to load project details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, reset]);

    // Check ownership when project or auth user is loaded
    useEffect(() => {
        if (project && authUserId) {
            if (authUserId === project.auth_user_id) {
                setIsOwner(true);
            }
        }
    }, [project, authUserId]);

    // Fetch team members when project loads
    useEffect(() => {
        if (!id) return;
        setTeamLoading(true);
        projectApi.getTeamByProject(id as string)
            .then(data => {
                setTeamData(data);
            })
            .catch(() => { /* No team yet */ })
            .finally(() => setTeamLoading(false));
    }, [id]);

    // Check team membership
    useEffect(() => {
        if (teamData && authUserId) {
            if (teamData.team_members.some(m => m.user_id === authUserId)) {
                setIsTeamMember(true);
            }
        }
    }, [teamData, authUserId]);

    // Fetch roadmap if tab is active
    useEffect(() => {
        if (tabValue === 1 && id && !fetchedRoadmap) {
            projectApi.getProjectPlan(id as string)
                .then(data => {
                    setRoadmapData({
                        project_id: data.project_id,
                        roadmap: data.roadmap,
                        extracted_features: [] // Plan doesn't store this, but view needs it? Optional.
                    });
                    setFetchedRoadmap(true);
                })
                .catch(() => {
                    setFetchedRoadmap(true); // Tried fetching, none found
                });
        }
    }, [tabValue, id, fetchedRoadmap]);

    const handleUpdate = async (data: ProjectCreateData) => {
        try {
            const updated = await projectApi.updateProject(id as string, data);
            setProject(updated);
            setIsEditing(false);
        } catch (err) {
            console.error("Update failed", err);
            setError("Failed to update project.");
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            try {
                await projectApi.deleteProject(id as string);
                router.push('/projects');
            } catch (err) {
                console.error("Delete failed", err);
                setError("Failed to delete project.");
            }
        }
    };

    const handleJoinRequest = async () => {
        if (!joinRole.trim()) return;
        setJoinLoading(true);
        try {
            await projectApi.requestToJoin({
                project_id: id as string,
                role: joinRole,
                message: joinMessage || undefined,
            });
            setSnackbar({ open: true, message: 'Join request sent successfully!', severity: 'success' });
            setShowJoinDialog(false);
            setJoinRole('');
            setJoinMessage('');
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Failed to send join request.';
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setJoinLoading(false);
        }
    };

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setValue('features', [...features, featureInput.trim()]);
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...features];
        newFeatures.splice(index, 1);
        setValue('features', newFeatures);
    };

    const handleGenerateRoadmap = async () => {
        if (!project) return;
        setGeneratingRoadmap(true);
        try {
            const data = await projectApi.generateRoadmap(project.id);
            setRoadmapData(data);
            setTabValue(1); // Switch to Roadmap tab
            setSnackbar({ open: true, message: 'Roadmap generated successfully!', severity: 'success' });
        } catch (err) {
            console.error("Roadmap generation failed", err);
            setSnackbar({ open: true, message: 'Failed to generate roadmap. Please try again.', severity: 'error' });
        } finally {
            setGeneratingRoadmap(false);
        }
    };

    const handleTaskMove = async (taskId: string, newStatus: string) => {
        if (!roadmapData || !id) return;

        // 1. Optimistic Update
        const previousRoadmap = [...roadmapData.roadmap];
        const updatedRoadmap = roadmapData.roadmap.map(sprint => ({
            ...sprint,
            tasks: sprint.tasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        }));

        setRoadmapData({ ...roadmapData, roadmap: updatedRoadmap });

        // 2. API Call
        try {
            await projectApi.updateTaskStatus({
                project_id: id as string,
                task_id: taskId,
                status: newStatus
            });
        } catch (err) {
            console.error("Failed to update task status", err);
            // 3. Revert on Error
            setRoadmapData({ ...roadmapData, roadmap: previousRoadmap });
            setSnackbar({ open: true, message: 'Failed to update task status', severity: 'error' });
        }
    };

    const handleStartSession = async () => {
        if (!roadmapData) {
            setSnackbar({ open: true, message: 'Please generate a Project Plan first.', severity: 'error' });
            return;
        }

        setStartingSession(true);
        try {
            const userId = localStorage.getItem('user_id');
            // Create/Get Room
            await projectApi.createRoom({
                project_id: id as string,
                created_by: userId || "unknown"
            });
            // Brief delay for animation to show before navigation
            await new Promise(resolve => setTimeout(resolve, 2500));
            // Redirect
            router.push(`/room/${id}`);
        } catch (err) {
            console.error("Failed to start session", err);
            setStartingSession(false);
            setSnackbar({ open: true, message: 'Failed to start session. Ensure you have a plan.', severity: 'error' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' };
            case 'In Progress': return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' };
            case 'Completed': return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' };
            default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#9ca3af' };
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#050505' }}>
                <CircularProgress sx={{ color: GOLD }} />
            </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#050505', py: 4, pt: '120px' }}>
                <DistortedBackground />
                <TopBar />
                <Container maxWidth="lg">
                    <Paper elevation={0} sx={{
                        p: 8,
                        borderRadius: 4,
                        textAlign: 'center',
                        bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Typography variant="h5" fontWeight="600" sx={{ mb: 1, color: 'white' }}>Project not found</Typography>
                        <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.6)' }}>
                            This project may have been deleted or doesn't exist.
                        </Typography>
                        <Button component={Link} href="/projects" startIcon={<ArrowBack />} sx={{ color: GOLD }}>
                            Back to Projects
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const statusColors = getStatusColor(project.status);

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#050505', // Dark background
            color: 'white',
            overflowX: 'hidden',
            position: 'relative',
        }}>
            <DistortedBackground />
            <TopBar />

            <Box sx={{ pt: '120px', pb: 8, position: 'relative', zIndex: 10 }}>
                <Container maxWidth="lg">
                    {/* Navigation */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                        <Button
                            component={Link}
                            href="/projects"
                            startIcon={<ArrowBack />}
                            sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', '&:hover': { color: 'white' } }}
                        >
                            Back to Projects
                        </Button>
                        {!isEditing && (
                            <Stack direction="row" spacing={1}>
                                {isOwner ? (
                                    <>
                                        <Button
                                            startIcon={<Delete />}
                                            onClick={handleDelete}
                                            color="error"
                                            sx={{ textTransform: 'none', color: '#ef4444' }}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<Groups />}
                                            onClick={() => setShowTeamModal(true)}
                                            disabled={!!(teamData && project && teamData.team_members.length >= project.team_size.max)}
                                            disableElevation
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-disabled': {
                                                    color: 'rgba(255,255,255,0.3)',
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                },
                                            }}
                                        >
                                            {teamData && project && teamData.team_members.length >= project.team_size.max
                                                ? 'Team Full'
                                                : 'Find Teammates'}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<Edit />}
                                            onClick={() => setIsEditing(true)}
                                            disableElevation
                                            sx={{
                                                bgcolor: GOLD,
                                                color: 'black',
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': { bgcolor: '#F0C040' }
                                            }}
                                        >
                                            Edit Project
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAdd />}
                                        onClick={() => setShowJoinDialog(true)}
                                        disableElevation
                                        sx={{
                                            bgcolor: GOLD,
                                            color: 'black',
                                            borderRadius: 2,
                                            px: 3,
                                            py: 1.2,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            '&:hover': { bgcolor: '#F0C040' }
                                        }}
                                    >
                                        Request to Join
                                    </Button>
                                )}
                            </Stack>
                        )}
                    </Stack>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</Alert>}

                    {/* Tabs Header */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 4, gap: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(_, v) => setTabValue(v)}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                                width: { xs: '100%', sm: 'auto' },
                                '& .MuiTab-root': {
                                    color: 'rgba(255,255,255,0.5)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    fontFamily: 'Space Grotesk',
                                    '&.Mui-selected': { color: GOLD },
                                },
                                '& .MuiTabs-indicator': { bgcolor: GOLD, height: 3 },
                            }}
                        >
                            <Tab label="Overview" />
                            <Tab label="Roadmap" disabled={!roadmapData && !isOwner} />
                        </Tabs>
                        {isOwner && (
                            <Button
                                variant="contained"
                                startIcon={generatingRoadmap ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                                onClick={handleGenerateRoadmap}
                                disabled={generatingRoadmap}
                                sx={{
                                    background: generatingRoadmap
                                        ? 'rgba(212, 175, 55, 0.2)'
                                        : `linear-gradient(45deg, ${GOLD} 30%, #F0C040 90%)`,
                                    color: generatingRoadmap ? GOLD : 'black',
                                    boxShadow: generatingRoadmap
                                        ? `0 0 15px rgba(212, 175, 55, 0.2)`
                                        : `0 3px 5px 2px rgba(212, 175, 55, .3)`,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: 5,
                                    px: 3,
                                    border: generatingRoadmap ? `1px solid ${GOLD}40` : 'none',
                                    width: { xs: '100%', sm: 'auto' },
                                    '&.Mui-disabled': {
                                        color: GOLD,
                                    },
                                }}
                            >
                                {generatingRoadmap ? 'Generating Plan...' : (roadmapData ? 'Re-Generate Roadmap' : 'Generate Roadmap')}
                            </Button>
                        )}
                    </Stack>

                    {/* Start Session Button (Visible to Team Members/Owner when Plan exists) */}
                    {(isOwner || isTeamMember) && roadmapData && !isEditing && !startingSession && (
                        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<Code />}
                                onClick={handleStartSession}
                                size="large"
                                sx={{
                                    bgcolor: '#10b981',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    py: 1.5,
                                    px: 4,
                                    borderRadius: 3,
                                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                                    textTransform: 'none',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        bgcolor: '#059669',
                                        transform: 'scale(1.02)'
                                    }
                                }}
                            >
                                Start Coding Session
                            </Button>
                        </Box>
                    )}

                    {/* Session Starting Animation */}
                    {startingSession && (
                        <MotionPaper
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                backdropFilter: 'blur(10px)',
                                mb: 3,
                                overflow: 'hidden',
                                boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)',
                            }}
                        >
                            <AILoadingAnimation mode="session" />
                        </MotionPaper>
                    )}

                    {generatingRoadmap ? (
                        <MotionPaper
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                mb: 3,
                                overflow: 'hidden',
                            }}
                        >
                            <AILoadingAnimation mode="roadmap" />
                        </MotionPaper>
                    ) : tabValue === 1 && roadmapData ? (
                        <RoadmapView
                            roadmap={roadmapData.roadmap}
                            extractedFeatures={roadmapData.extracted_features || []}
                            onTaskMove={isOwner ? handleTaskMove : undefined}
                        />
                    ) : (
                        <form onSubmit={handleSubmit(handleUpdate)}>
                            {/* Hero Section */}
                            <MotionPaper
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                elevation={0}
                                sx={{
                                    p: { xs: 4, md: 6 },
                                    borderRadius: 4,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(10px)',
                                    mb: 3,
                                }}
                            >
                                {isEditing ? (
                                    <Stack spacing={3}>
                                        <Controller
                                            name="title"
                                            control={control}
                                            rules={{ required: "Title is required" }}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Project Title"
                                                    fullWidth
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                                                        '& .MuiInputBase-input': { color: 'white' }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                                            <Button
                                                variant="outlined"
                                                startIcon={<Cancel />}
                                                onClick={() => { setIsEditing(false); reset(project); }}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: 2,
                                                    borderColor: 'rgba(255,255,255,0.2)',
                                                    color: 'white',
                                                    '&:hover': { borderColor: 'white' }
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<Save />}
                                                disabled={isSubmitting}
                                                disableElevation
                                                sx={{
                                                    bgcolor: GOLD,
                                                    color: 'black',
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    '&:hover': { bgcolor: '#F0C040' }
                                                }}
                                            >
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <>
                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                            <Chip label={project.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600 }} />
                                            <Chip
                                                label={project.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: statusColors.bg,
                                                    color: statusColors.text,
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Stack>
                                        <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 1, fontFamily: 'Space Grotesk', color: 'white' }}>
                                            {project.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                            Created on {new Date(project.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                    </>
                                )}
                            </MotionPaper>

                            {/* Content Grid */}
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                {/* Main Content */}
                                <Box sx={{ flex: 2 }}>
                                    <Stack spacing={3}>
                                        {/* Description */}
                                        <MotionPaper
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.1 }}
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                borderRadius: 4,
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: 'white', fontFamily: 'Space Grotesk' }}>
                                                Overview
                                            </Typography>
                                            {isEditing ? (
                                                <Controller
                                                    name="description"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            multiline
                                                            rows={5}
                                                            fullWidth
                                                            placeholder="Describe your project..."
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                                                                '& .MuiInputBase-input': { color: 'white' }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            ) : (
                                                <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.7)' }}>
                                                    {project.description}
                                                </Typography>
                                            )}
                                        </MotionPaper>

                                        {/* Features */}
                                        <MotionPaper
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.2 }}
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                borderRadius: 4,
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: 'white', fontFamily: 'Space Grotesk' }}>
                                                Key Features
                                            </Typography>
                                            {isEditing ? (
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        placeholder="Add feature and press Enter"
                                                        value={featureInput}
                                                        onChange={(e) => setFeatureInput(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={handleAddFeature} size="small" sx={{ color: 'white' }}>
                                                                        <AddIcon />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {features.map((feature: string, i: number) => (
                                                            <Chip
                                                                key={i}
                                                                label={feature}
                                                                onDelete={() => removeFeature(i)}
                                                                variant="outlined"
                                                                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Stack spacing={1.5}>
                                                    {project.features.length > 0 ? (
                                                        project.features.map((feature, i) => (
                                                            <Stack key={i} direction="row" alignItems="flex-start" spacing={1.5}>
                                                                <CheckCircle sx={{ fontSize: 20, color: GOLD, mt: 0.3 }} />
                                                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>{feature}</Typography>
                                                            </Stack>
                                                        ))
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                                            No specific features listed.
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            )}
                                        </MotionPaper>
                                    </Stack>
                                </Box>

                                {/* Sidebar */}
                                <Box sx={{ flex: 1 }}>
                                    <MotionPaper
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.3 }}
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: 4,
                                            bgcolor: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight="700" sx={{ mb: 3, color: 'white', fontFamily: 'Space Grotesk' }}>
                                            Details
                                        </Typography>
                                        <Stack spacing={3}>
                                            {/* Category */}
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.5)' }}>
                                                    Category
                                                </Typography>
                                                {isEditing ? (
                                                    <Controller
                                                        name="category"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                select
                                                                fullWidth
                                                                size="small"
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                                                            >
                                                                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                                            </TextField>
                                                        )}
                                                    />
                                                ) : (
                                                    <Chip label={project.category} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                                                )}
                                            </Box>

                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                                            {/* Complexity */}
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.5)' }}>
                                                    Complexity
                                                </Typography>
                                                {isEditing ? (
                                                    <Controller
                                                        name="complexity"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                select
                                                                fullWidth
                                                                size="small"
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                                                            >
                                                                {COMPLEXITIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                                            </TextField>
                                                        )}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" fontWeight="500" sx={{ color: 'white' }}>{project.complexity}</Typography>
                                                )}
                                            </Box>

                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                                            {/* Duration */}
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.5)' }}>
                                                    Duration
                                                </Typography>
                                                {isEditing ? (
                                                    <Controller
                                                        name="estimated_duration"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                fullWidth
                                                                size="small"
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                                                            />
                                                        )}
                                                    />
                                                ) : (
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <AccessTime fontSize="small" sx={{ color: 'rgba(255,255,255,0.4)' }} />
                                                        <Typography variant="body1" fontWeight="500" sx={{ color: 'white' }}>{project.estimated_duration}</Typography>
                                                    </Stack>
                                                )}
                                            </Box>

                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                                            {/* Team Size */}
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.5)' }}>
                                                    Team Size
                                                </Typography>
                                                {isEditing ? (
                                                    <Controller
                                                        name="team_size"
                                                        control={control}
                                                        render={({ field: { value, onChange } }) => (
                                                            <Box sx={{ px: 1 }}>
                                                                <Slider
                                                                    value={[value?.min || 2, value?.max || 4]}
                                                                    onChange={(_, v) => {
                                                                        if (Array.isArray(v)) onChange({ min: v[0], max: v[1] });
                                                                    }}
                                                                    valueLabelDisplay="auto"
                                                                    min={1}
                                                                    max={10}
                                                                    sx={{ color: GOLD }}
                                                                />
                                                            </Box>
                                                        )}
                                                    />
                                                ) : (
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Group fontSize="small" sx={{ color: 'rgba(255,255,255,0.4)' }} />
                                                        <Typography variant="body1" fontWeight="500" sx={{ color: 'white' }}>
                                                            {project.team_size.min} - {project.team_size.max} members
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Box>

                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                                            {/* Skills */}
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'rgba(255,255,255,0.5)' }}>
                                                    Required Skills
                                                </Typography>
                                                {isEditing ? (
                                                    <Controller
                                                        name="required_skills"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                                                                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                                                fullWidth
                                                                multiline
                                                                rows={2}
                                                                placeholder="React, Python, etc."
                                                                size="small"
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                                                            />
                                                        )}
                                                    />
                                                ) : (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {project.required_skills.map((skill, i) => (
                                                            <Chip key={i} label={skill} size="small" variant="outlined" sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }} />
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Stack>
                                    </MotionPaper>

                                    {/* Team Members */}
                                    <MotionPaper
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.4 }}
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: 4,
                                            bgcolor: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            mt: 3,
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                            <Groups fontSize="small" sx={{ color: 'rgba(255,255,255,0.4)' }} />
                                            <Typography variant="h6" fontWeight="700" sx={{ color: 'white', fontFamily: 'Space Grotesk' }}>
                                                Team Members
                                            </Typography>
                                        </Stack>
                                        {teamLoading ? (
                                            <CircularProgress size={24} sx={{ color: GOLD }} />
                                        ) : teamData && teamData.team_members.length > 0 ? (
                                            <Stack spacing={1.5}>
                                                {teamData.team_members.map((member, i) => (
                                                    <Stack key={i} direction="row" alignItems="center" spacing={2}
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            bgcolor: 'rgba(255,255,255,0.03)',
                                                        }}
                                                    >
                                                        <Avatar sx={{ width: 36, height: 36, bgcolor: i === 0 ? GOLD : 'rgba(255,255,255,0.1)', color: i === 0 ? 'black' : 'white', fontSize: '0.85rem' }}>
                                                            {(member.username || 'U')[0].toUpperCase()}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" fontWeight="600" sx={{ color: 'white' }}>
                                                                {member.username || `User #${member.user_id}`}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                                {member.role}
                                                            </Typography>
                                                        </Box>
                                                        {i === 0 && (
                                                            <Chip label="Owner" size="small" sx={{ bgcolor: 'rgba(212, 175, 55, 0.15)', color: GOLD, fontWeight: 600, fontSize: '0.65rem' }} />
                                                        )}
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                                No team formed yet.
                                            </Typography>
                                        )}
                                    </MotionPaper>
                                </Box>
                            </Stack>
                        </form>
                    )}
                </Container>

                {/* Team Recommendations Modal (Owner only) */}
                {isOwner && (
                    <TeamRecommendationsModal
                        open={showTeamModal}
                        onClose={() => setShowTeamModal(false)}
                        projectId={project.id}
                        projectTitle={project.title}
                        requiredSkills={project.required_skills}
                        teamSize={project.team_size.max}
                        timeline={project.estimated_duration}
                    />
                )}

                {/* Join Request Dialog (Non-owner only) */}
                <Dialog
                    open={showJoinDialog}
                    onClose={() => setShowJoinDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            bgcolor: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white'
                        }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                        Request to Join — {project.title}
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField
                                label="Role you'd like to play"
                                placeholder="e.g. Frontend Developer, Backend Engineer"
                                value={joinRole}
                                onChange={(e) => setJoinRole(e.target.value)}
                                fullWidth
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                                }}
                            />
                            <TextField
                                label="Message (optional)"
                                placeholder="Tell the owner why you're a great fit..."
                                value={joinMessage}
                                onChange={(e) => setJoinMessage(e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2, color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={() => setShowJoinDialog(false)}
                            sx={{ textTransform: 'none', color: 'rgba(255,255,255,0.6)' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleJoinRequest}
                            disabled={!joinRole.trim() || joinLoading}
                            disableElevation
                            sx={{
                                bgcolor: GOLD,
                                color: 'black',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#F0C040' }
                            }}
                        >
                            {joinLoading ? 'Sending...' : 'Send Request'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for feedback */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{ borderRadius: 2 }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}
