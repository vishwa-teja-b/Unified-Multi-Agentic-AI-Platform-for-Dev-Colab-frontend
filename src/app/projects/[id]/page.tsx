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
} from '@mui/icons-material';
import TeamRecommendationsModal from '@/components/TeamRecommendationsModal';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { projectApi, ProjectResponse, ProjectCreateData } from '@/utils/projectApi';

const CATEGORIES = ["Full Stack", "Frontend", "Backend", "Mobile", "Data Science", "AI/ML", "DevOps", "Other"];
const COMPLEXITIES = ["Easy", "Medium", "Hard"];

// Dummy data for testing/fallback
const DUMMY_PROJECTS: ProjectResponse[] = [
    {
        id: 'dummy-1',
        auth_user_id: 1,
        title: 'AI-Powered Agent Platform',
        category: 'AI/ML',
        description: 'A unified platform for deploying and orchestrating autonomous AI agents to solve complex developer workflows. Features real-time collaboration and skill matching.',
        features: ['Agent Orchestration', 'Real-time Chat', 'Skill Matching', 'AI-powered team recommendations'],
        required_skills: ['Python', 'LangChain', 'Next.js', 'FastAPI', 'Docker'],
        team_size: { min: 3, max: 6 },
        complexity: 'Hard',
        estimated_duration: '3 months',
        status: 'Open',
        created_at: new Date().toISOString(),
        team_members: []
    },
    {
        id: 'dummy-2',
        auth_user_id: 1,
        title: 'EcoTrack Mobile App',
        category: 'Mobile',
        description: 'Cross-platform mobile application to help users track their carbon footprint and suggest eco-friendly lifestyle changes using gamification.',
        features: ['Carbon Calculator', 'Social Sharing', 'Gamification', 'Daily Challenges'],
        required_skills: ['Flutter', 'Firebase', 'Dart', 'UI/UX Design'],
        team_size: { min: 2, max: 4 },
        complexity: 'Medium',
        estimated_duration: '2 months',
        status: 'In Progress',
        created_at: new Date().toISOString(),
        team_members: []
    },
    {
        id: 'dummy-3',
        auth_user_id: 1,
        title: 'DeFi Portfolio Dashboard',
        category: 'Frontend',
        description: 'A comprehensive dashboard for tracking decentralized finance investments across multiple chains. Includes real-time price charts and portfolio analytics.',
        features: ['Wallet Integration', 'Price Charts', 'Portfolio Analytics', 'Multi-chain Support'],
        required_skills: ['React', 'Web3.js', 'TailwindCSS', 'GraphQL'],
        team_size: { min: 2, max: 3 },
        complexity: 'Medium',
        estimated_duration: '6 weeks',
        status: 'Open',
        created_at: new Date().toISOString(),
        team_members: []
    }
];

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

    const { control, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<ProjectCreateData>();
    const features = watch('features') || [];

    useEffect(() => {
        if (!id) return;
        const fetchProject = async () => {
            try {
                // Check if it's a dummy project
                if (typeof id === 'string' && id.startsWith('dummy-')) {
                    const dummyProject = DUMMY_PROJECTS.find(p => p.id === id);
                    if (dummyProject) {
                        setProject(dummyProject);
                        reset(dummyProject);
                        setLoading(false);
                        return;
                    }
                }

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
                        </Stack>
                    )}
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

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
                        </Box>
                    </Stack>
                </form>
            </Container>

            {/* Team Recommendations Modal */}
            <TeamRecommendationsModal
                open={showTeamModal}
                onClose={() => setShowTeamModal(false)}
                projectId={project.id}
                projectTitle={project.title}
                requiredSkills={project.required_skills}
                teamSize={project.team_size.max}
                timeline={project.estimated_duration}
            />
        </Box>
    );
}
