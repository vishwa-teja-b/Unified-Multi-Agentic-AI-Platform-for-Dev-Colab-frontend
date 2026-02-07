'use client';

import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Stack,
    Chip,
    Autocomplete,
    Paper,
    Slider,
    MenuItem,
    InputAdornment,
    IconButton,
    LinearProgress,
} from '@mui/material';
import {
    ArrowForward,
    ArrowBack,
    Check,
    Close,
    Add as AddIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { projectApi, ProjectCreateData } from '@/utils/projectApi';

const steps = [
    { title: 'Concept', description: 'What are you building?' },
    { title: 'Tech Stack', description: 'Skills & team requirements' },
    { title: 'Details', description: 'Timeline & features' },
];

const CATEGORIES = ["Full Stack", "Frontend", "Backend", "Mobile", "Data Science", "AI/ML", "DevOps", "Other"];
const COMPLEXITIES = ["Easy", "Medium", "Hard"];
const COMMON_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
    'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
    'Node.js', 'Express', 'NestJS', 'Django', 'FastAPI', 'Spring Boot',
    'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
    'Flutter', 'React Native', 'Swift', 'Kotlin',
    'TensorFlow', 'PyTorch', 'LangChain'
];

export default function CreateProjectPage() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [featureInput, setFeatureInput] = useState('');

    const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ProjectCreateData>({
        defaultValues: {
            title: '',
            category: 'Full Stack',
            description: '',
            features: [],
            required_skills: [],
            team_size: { min: 2, max: 4 },
            complexity: 'Medium',
            estimated_duration: '',
        }
    });

    const features = watch('features');
    const progress = ((activeStep + 1) / steps.length) * 100;

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

    const onSubmit = async (data: ProjectCreateData) => {
        try {
            await projectApi.createProject(data);
            router.push('/projects');
        } catch (error) {
            console.error("Failed to create project:", error);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Stack spacing={3}>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: "Title is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Project Title"
                                    placeholder="Something groundbreaking..."
                                    fullWidth
                                    error={!!errors.title}
                                    helperText={errors.title?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            rules={{ required: "Description is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Description"
                                    placeholder="What problem are you solving? Be specific..."
                                    multiline
                                    rows={5}
                                    fullWidth
                                    error={!!errors.description}
                                    helperText={errors.description?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            )}
                        />

                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Category"
                                    fullWidth
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                >
                                    {CATEGORIES.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Stack>
                );

            case 1:
                return (
                    <Stack spacing={4}>
                        <Controller
                            name="required_skills"
                            control={control}
                            rules={{ required: "Select at least one skill" }}
                            render={({ field: { onChange, value } }) => (
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={COMMON_SKILLS}
                                    value={value || []}
                                    onChange={(_, newValue) => onChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Required Skills"
                                            placeholder="What technologies will you use?"
                                            error={!!errors.required_skills}
                                            helperText={errors.required_skills?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option: string, index: number) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={option}
                                                label={option}
                                                sx={{ bgcolor: 'primary.main', color: 'white' }}
                                            />
                                        ))
                                    }
                                />
                            )}
                        />

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                Team Size
                            </Typography>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <Controller
                                    name="team_size"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <>
                                            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                                                <strong>{value.min} - {value.max}</strong> members
                                            </Typography>
                                            <Slider
                                                value={[value.min, value.max]}
                                                onChange={(_, v) => {
                                                    if (Array.isArray(v)) onChange({ min: v[0], max: v[1] });
                                                }}
                                                valueLabelDisplay="auto"
                                                min={1}
                                                max={10}
                                                sx={{ color: 'text.primary' }}
                                            />
                                        </>
                                    )}
                                />
                            </Paper>
                        </Box>

                        <Controller
                            name="complexity"
                            control={control}
                            render={({ field }) => (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                        Complexity
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        {COMPLEXITIES.map((level) => (
                                            <Chip
                                                key={level}
                                                label={level}
                                                onClick={() => field.onChange(level)}
                                                color={field.value === level ? "primary" : "default"}
                                                variant={field.value === level ? "filled" : "outlined"}
                                                clickable
                                                sx={{ fontWeight: 500, flex: 1, justifyContent: 'center' }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        />
                    </Stack>
                );

            case 2:
                return (
                    <Stack spacing={4}>
                        <Controller
                            name="estimated_duration"
                            control={control}
                            rules={{ required: "Duration is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Estimated Duration"
                                    placeholder="e.g. 3 months, 6 weeks"
                                    fullWidth
                                    error={!!errors.estimated_duration}
                                    helperText={errors.estimated_duration?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            )}
                        />

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                Key Features
                            </Typography>
                            <TextField
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                placeholder="Add a feature and press Enter"
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleAddFeature}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'text.primary',
                                                    color: 'background.default',
                                                    '&:hover': { bgcolor: 'text.secondary' }
                                                }}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {features.map((feature: string, index: number) => (
                                    <Chip
                                        key={index}
                                        label={feature}
                                        onDelete={() => removeFeature(index)}
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Stack>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Button
                        component={Link}
                        href="/projects"
                        startIcon={<ArrowBack />}
                        sx={{ color: 'text.secondary', textTransform: 'none' }}
                    >
                        Back to Projects
                    </Button>
                    <IconButton onClick={() => router.push('/projects')}>
                        <Close />
                    </IconButton>
                </Stack>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        border: theme => `1px solid ${theme.palette.divider}`,
                    }}
                >
                    {/* Title */}
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                            Create New Project
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {steps[activeStep].description}
                        </Typography>
                    </Box>

                    {/* Progress */}
                    <Box sx={{ mb: 5 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight="600">
                                Step {activeStep + 1} of {steps.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {steps[activeStep].title}
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': { borderRadius: 4 }
                            }}
                        />
                    </Box>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box sx={{ minHeight: 300 }}>
                                    {renderStepContent(activeStep)}
                                </Box>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={() => setActiveStep(prev => prev - 1)}
                                startIcon={<ArrowBack />}
                                sx={{ color: 'text.secondary', textTransform: 'none' }}
                            >
                                Back
                            </Button>

                            {activeStep === steps.length - 1 ? (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting}
                                    startIcon={<Check />}
                                    disableElevation
                                    sx={{
                                        bgcolor: 'text.primary',
                                        color: 'background.default',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        '&:hover': { bgcolor: 'text.secondary' }
                                    }}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Project'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setActiveStep(prev => prev + 1)}
                                    variant="contained"
                                    endIcon={<ArrowForward />}
                                    disableElevation
                                    sx={{
                                        bgcolor: 'text.primary',
                                        color: 'background.default',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        '&:hover': { bgcolor: 'text.secondary' }
                                    }}
                                >
                                    Continue
                                </Button>
                            )}
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}
