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
import { TopBar } from '@/components/shared/TopBar';
import { DistortedBackground } from '@/components/shared/DistortedBackground';
import { useThemeColors } from '@/context/ThemeContext';

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
    'TensorFlow', 'PyTorch', 'LangChain', 'LangGraph', 'MySQL'
];

export default function CreateProjectPage() {
    const router = useRouter();
    const c = useThemeColors();
    const GOLD = c.gold;
    const [activeStep, setActiveStep] = useState(0);
    const [featureInput, setFeatureInput] = useState('');

    /* ─── Shared dark-glass input styling ─── */
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: c.surface,
            '& fieldset': { borderColor: c.borderLight },
            '&:hover fieldset': { borderColor: c.border },
            '&.Mui-focused fieldset': { borderColor: GOLD },
        },
        '& .MuiInputLabel-root': { color: c.textSecondary },
        '& .MuiInputBase-input': { color: c.textPrimary },
        '& .MuiInputBase-input::placeholder': { color: c.textMuted },
        '& .MuiSelect-icon': { color: c.textSecondary },
    };

    /* ─── Shared Autocomplete dropdown styling ─── */
    const acSlotProps = {
        paper: {
            sx: {
                bgcolor: c.cardBg,
                border: c.cardBorder,
                boxShadow: c.shadowHover,
                '& .MuiAutocomplete-option': {
                    color: c.textPrimary,
                    '&:hover': { bgcolor: c.surfaceHover },
                    '&[aria-selected="true"]': { bgcolor: c.goldBg, color: GOLD },
                    '&[aria-selected="true"]:hover': { bgcolor: c.goldMuted },
                },
                '& .MuiAutocomplete-noOptions': { color: c.textMuted },
            },
        },
    };

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
                                    sx={inputSx}
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
                                    sx={inputSx}
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
                                    sx={inputSx}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: c.cardBg,
                                                    border: c.cardBorder,
                                                    boxShadow: c.shadowHover,
                                                    '& .MuiMenuItem-root': {
                                                        color: c.textPrimary,
                                                        '&:hover': { bgcolor: c.surfaceHover },
                                                        '&.Mui-selected': { bgcolor: c.goldBg, color: GOLD },
                                                        '&.Mui-selected:hover': { bgcolor: c.goldMuted },
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {CATEGORIES.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
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
                                    slotProps={acSlotProps}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Required Skills"
                                            placeholder="What technologies will you use?"
                                            error={!!errors.required_skills}
                                            helperText={errors.required_skills?.message}
                                            sx={inputSx}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option: string, index: number) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={option}
                                                label={option}
                                                sx={{
                                                    fontWeight: 500,
                                                    bgcolor: c.goldBg,
                                                    color: GOLD,
                                                    border: `1px solid ${c.goldBorder}`,
                                                    '& .MuiChip-deleteIcon': { color: c.textSecondary, '&:hover': { color: GOLD } },
                                                }}
                                            />
                                        ))
                                    }
                                />
                            )}
                        />

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: c.textSecondary }}>
                                Team Size
                            </Typography>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: c.surface,
                                    border: c.borderLight,
                                }}
                            >
                                <Controller
                                    name="team_size"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <>
                                            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: c.textPrimary }}>
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
                                                sx={{
                                                    color: GOLD,
                                                    '& .MuiSlider-thumb': {
                                                        bgcolor: GOLD,
                                                        '&:hover': { boxShadow: `0 0 0 8px ${c.goldBg}` },
                                                    },
                                                    '& .MuiSlider-track': { bgcolor: GOLD },
                                                    '& .MuiSlider-rail': { bgcolor: c.borderLight },
                                                }}
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
                                    <Typography variant="subtitle2" sx={{ mb: 2, color: c.textSecondary }}>
                                        Complexity
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        {COMPLEXITIES.map((level) => (
                                            <Chip
                                                key={level}
                                                label={level}
                                                onClick={() => field.onChange(level)}
                                                clickable
                                                sx={{
                                                    fontWeight: 500,
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    bgcolor: field.value === level ? c.goldBg : c.surfaceHover,
                                                    color: field.value === level ? GOLD : c.textSecondary,
                                                    border: `1px solid ${field.value === level ? c.goldBorder : c.borderLight}`,
                                                    '&:hover': { bgcolor: c.goldMuted },
                                                }}
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
                                    sx={inputSx}
                                />
                            )}
                        />

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: c.textSecondary }}>
                                Key Features
                            </Typography>
                            <TextField
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                placeholder="Add a feature and press Enter"
                                fullWidth
                                sx={{ ...inputSx, mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleAddFeature}
                                                size="small"
                                                sx={{
                                                    bgcolor: GOLD,
                                                    color: 'black',
                                                    '&:hover': { bgcolor: c.mode === 'dark' ? '#F0C040' : '#B8972E' }
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
                                        sx={{
                                            color: c.textPrimary,
                                            borderColor: c.borderLight,
                                            '& .MuiChip-deleteIcon': { color: c.textMuted, '&:hover': { color: c.textSecondary } },
                                        }}
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
        <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', color: c.textPrimary, position: 'relative' }}>
            <DistortedBackground />
            <TopBar />

            <Box sx={{ pt: '120px', pb: 8, position: 'relative', zIndex: 10 }}>
                <Container maxWidth="md">
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                        <Button
                            component={Link}
                            href="/projects"
                            startIcon={<ArrowBack />}
                            sx={{ color: c.textSecondary, textTransform: 'none', '&:hover': { color: c.textPrimary } }}
                        >
                            Back to Projects
                        </Button>
                        <IconButton onClick={() => router.push('/projects')} sx={{ color: c.textMuted }}>
                            <Close />
                        </IconButton>
                    </Stack>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: 4,
                            bgcolor: c.cardBg,
                            border: c.cardBorder,
                            backdropFilter: 'blur(20px)',
                            boxShadow: c.shadowHover,
                        }}
                    >
                        {/* Title */}
                        <Box sx={{ textAlign: 'center', mb: 5 }}>
                            <Typography variant="h4" fontWeight="800" sx={{
                                letterSpacing: '-0.02em',
                                mb: 1,
                                fontFamily: 'Space Grotesk',
                                background: `linear-gradient(135deg, white 0%, ${GOLD} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Create New Project
                            </Typography>
                            <Typography variant="body1" sx={{ color: c.textSecondary }}>
                                {steps[activeStep].description}
                            </Typography>
                        </Box>

                        {/* Progress */}
                        <Box sx={{ mb: 5 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Typography variant="body2" fontWeight="600" sx={{ color: c.textPrimary }}>
                                    Step {activeStep + 1} of {steps.length}
                                </Typography>
                                <Typography variant="body2" sx={{ color: c.textMuted }}>
                                    {steps[activeStep].title}
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    height: 6,
                                    borderRadius: 4,
                                    bgcolor: c.surfaceHover,
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: `linear-gradient(90deg, ${GOLD}, #F0C040)`,
                                    }
                                }}
                            />
                        </Box>

                        {/* Step Indicators */}
                        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 4 }}>
                            {steps.map((s, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        width: 32,
                                        height: 4,
                                        borderRadius: 2,
                                        bgcolor: i <= activeStep ? GOLD : c.borderLight,
                                        transition: 'background-color 0.3s',
                                    }}
                                />
                            ))}
                        </Stack>

                        {/* Form */}
                        <form onSubmit={(e) => e.preventDefault()}>
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
                                    sx={{
                                        color: c.textSecondary,
                                        textTransform: 'none',
                                        '&:hover': { color: c.textPrimary },
                                        '&.Mui-disabled': { color: c.textMuted },
                                    }}
                                >
                                    Back
                                </Button>

                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        type="button"
                                        variant="contained"
                                        disabled={isSubmitting}
                                        startIcon={<Check />}
                                        disableElevation
                                        onClick={handleSubmit(onSubmit)}
                                        sx={{
                                            background: `linear-gradient(45deg, ${GOLD} 30%, #F0C040 90%)`,
                                            color: 'black',
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            px: 4,
                                            boxShadow: `0 3px 12px ${c.goldBg}`,
                                            '&:hover': { background: `linear-gradient(45deg, #F0C040 30%, ${GOLD} 90%)` },
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
                                            background: `linear-gradient(45deg, ${GOLD} 30%, #F0C040 90%)`,
                                            color: 'black',
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            px: 4,
                                            boxShadow: `0 3px 12px ${c.goldBg}`,
                                            '&:hover': { background: `linear-gradient(45deg, #F0C040 30%, ${GOLD} 90%)` },
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
        </Box>
    );
}
