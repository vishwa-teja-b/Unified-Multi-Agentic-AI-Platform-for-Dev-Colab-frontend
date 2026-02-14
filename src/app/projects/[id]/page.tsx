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
} from '@mui/icons-material';
import TeamRecommendationsModal from '@/components/TeamRecommendationsModal';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { projectApi, ProjectResponse, ProjectCreateData, TeamResponse, TeamMember, ProjectPlannerResponse } from '@/utils/projectApi';
import RoadmapView from '@/components/projects/RoadmapView';
import { AutoAwesome } from '@mui/icons-material';

const CATEGORIES = ["Full Stack", "Frontend", "Backend", "Mobile", "Data Science", "AI/ML", "DevOps", "Other"];
const COMPLEXITIES = ["Easy", "Medium", "Hard"];

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

    // Join request state
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [joinRole, setJoinRole] = useState('');
    const [joinMessage, setJoinMessage] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    // Team members state
    const [teamData, setTeamData] = useState<TeamResponse | null>(null);
    const [teamLoading, setTeamLoading] = useState(false);

    // Roadmap state
    const [tabValue, setTabValue] = useState(0);
    const [roadmapData, setRoadmapData] = useState<ProjectPlannerResponse | null>(null);
    const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

    const { control, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<ProjectCreateData>();
    const features = watch('features') || [];

    useEffect(() => {
        if (!id) return;
        const fetchProject = async () => {
            try {
                const data = await projectApi.getProjectById(id as string);
                setProject(data);
                reset(data);

                // Check ownership
                const userId = localStorage.getItem('user_id');
                if (userId && Number(userId) === data.auth_user_id) {
                    setIsOwner(true);
                }
            } catch (err) {
                console.error("Failed to load project", err);
                setError("Failed to load project details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, reset]);

    // Fetch team members when project loads
    useEffect(() => {
        if (!id) return;
        setTeamLoading(true);
        projectApi.getTeamByProject(id as string)
            .then(data => setTeamData(data))
            .catch(() => { /* No team yet */ })
            .finally(() => setTeamLoading(false));
    }, [id]);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return { bg: '#E3F2FD', text: '#1565C0' };
            case 'In Progress': return { bg: '#FFF3E0', text: '#E65100' };
            case 'Completed': return { bg: '#E8F5E9', text: '#2E7D32' };
            default: return { bg: '#F5F5F5', text: '#616161' };
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!project) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
                <Container maxWidth="lg">
                    <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: theme => `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>Project not found</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            This project may have been deleted or doesn't exist.
                        </Typography>
                        <Button component={Link} href="/projects" startIcon={<ArrowBack />}>
                            Back to Projects
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const statusColors = getStatusColor(project.status);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="lg">
                {/* Navigation */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Button
                        component={Link}
                        href="/projects"
                        startIcon={<ArrowBack />}
                        sx={{ color: 'text.secondary', textTransform: 'none' }}
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
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<Groups />}
                                        onClick={() => setShowTeamModal(true)}
                                        disableElevation
                                        sx={{
                                            bgcolor: '#a855f7',
                                            color: '#fff',
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            '&:hover': { bgcolor: '#9333ea' }
                                        }}
                                    >
                                        Find Teammates
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<Edit />}
                                        onClick={() => setIsEditing(true)}
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
                                        bgcolor: '#a855f7',
                                        color: '#fff',
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1.2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#9333ea' }
                                    }}
                                >
                                    Request to Join
                                </Button>
                            )}
                        </Stack>
                    )}
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                {/* Tabs Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, v) => setTabValue(v)}
                        sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}
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
                                background: 'linear-gradient(45deg, #a855f7 30%, #ec4899 90%)',
                                color: 'white',
                                boxShadow: '0 3px 5px 2px rgba(168, 85, 247, .3)',
                                textTransform: 'none',
                                borderRadius: 5,
                                px: 3,
                                width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                                mt: { xs: 2, sm: 0 },
                                ml: { sm: 2 }
                            }}
                        >
                            {generatingRoadmap ? 'Generating Plan...' : 'Generate Roadmap'}
                        </Button>
                    )}
                </Stack>

                {tabValue === 1 && roadmapData ? (
                    <RoadmapView roadmap={roadmapData.roadmap} extractedFeatures={roadmapData.extracted_features} />
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
                                border: theme => `1px solid ${theme.palette.divider}`,
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
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />
                                        )}
                                    />
                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                        <Button
                                            variant="outlined"
                                            startIcon={<Cancel />}
                                            onClick={() => { setIsEditing(false); reset(project); }}
                                            sx={{ textTransform: 'none', borderRadius: 2 }}
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
                                                bgcolor: 'text.primary',
                                                color: 'background.default',
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': { bgcolor: 'text.secondary' }
                                            }}
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </Stack>
                                </Stack>
                            ) : (
                                <>
                                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                        <Chip label={project.category} size="small" />
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
                                    <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                                        {project.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
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
                                            border: theme => `1px solid ${theme.palette.divider}`,
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
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
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
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
                                            border: theme => `1px solid ${theme.palette.divider}`,
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
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
                                                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={handleAddFeature} size="small">
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
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Stack spacing={1.5}>
                                                {project.features.length > 0 ? (
                                                    project.features.map((feature, i) => (
                                                        <Stack key={i} direction="row" alignItems="flex-start" spacing={1.5}>
                                                            <CheckCircle sx={{ fontSize: 20, color: 'success.main', mt: 0.3 }} />
                                                            <Typography variant="body1">{feature}</Typography>
                                                        </Stack>
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
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
                                        border: theme => `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
                                        Details
                                    </Typography>
                                    <Stack spacing={3}>
                                        {/* Category */}
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
                                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                        >
                                                            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                                        </TextField>
                                                    )}
                                                />
                                            ) : (
                                                <Chip label={project.category} />
                                            )}
                                        </Box>

                                        <Divider />

                                        {/* Complexity */}
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
                                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                        >
                                                            {COMPLEXITIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                                        </TextField>
                                                    )}
                                                />
                                            ) : (
                                                <Typography variant="body1" fontWeight="500">{project.complexity}</Typography>
                                            )}
                                        </Box>

                                        <Divider />

                                        {/* Duration */}
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
                                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                        />
                                                    )}
                                                />
                                            ) : (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <AccessTime fontSize="small" color="action" />
                                                    <Typography variant="body1" fontWeight="500">{project.estimated_duration}</Typography>
                                                </Stack>
                                            )}
                                        </Box>

                                        <Divider />

                                        {/* Team Size */}
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
                                                            />
                                                        </Box>
                                                    )}
                                                />
                                            ) : (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Group fontSize="small" color="action" />
                                                    <Typography variant="body1" fontWeight="500">
                                                        {project.team_size.min} - {project.team_size.max} members
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </Box>

                                        <Divider />

                                        {/* Skills */}
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
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
                                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                        />
                                                    )}
                                                />
                                            ) : (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {project.required_skills.map((skill, i) => (
                                                        <Chip key={i} label={skill} size="small" variant="outlined" />
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
                                        border: theme => `1px solid ${theme.palette.divider}`,
                                        mt: 3,
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <Groups fontSize="small" color="action" />
                                        <Typography variant="h6" fontWeight="700">
                                            Team Members
                                        </Typography>
                                    </Stack>
                                    {teamLoading ? (
                                        <CircularProgress size={24} />
                                    ) : teamData && teamData.team_members.length > 0 ? (
                                        <Stack spacing={1.5}>
                                            {teamData.team_members.map((member, i) => (
                                                <Stack key={i} direction="row" alignItems="center" spacing={2}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: 'action.hover',
                                                    }}
                                                >
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: i === 0 ? '#a855f7' : '#6366f1', fontSize: '0.85rem' }}>
                                                        {(member.username || 'U')[0].toUpperCase()}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight="600">
                                                            {member.username || `User #${member.user_id}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {member.role}
                                                        </Typography>
                                                    </Box>
                                                    {i === 0 && (
                                                        <Chip label="Owner" size="small" sx={{ bgcolor: 'rgba(168,85,247,0.15)', color: '#a855f7', fontWeight: 600, fontSize: '0.65rem' }} />
                                                    )}
                                                </Stack>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
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
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            label="Message (optional)"
                            placeholder="Tell the owner why you're a great fit..."
                            value={joinMessage}
                            onChange={(e) => setJoinMessage(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setShowJoinDialog(false)}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleJoinRequest}
                        disabled={!joinRole.trim() || joinLoading}
                        disableElevation
                        sx={{
                            bgcolor: '#a855f7',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#9333ea' }
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
    );
}
