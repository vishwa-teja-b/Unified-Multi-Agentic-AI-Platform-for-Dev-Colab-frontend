'use client';

import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Stack,
    Chip,
    Autocomplete,
    Avatar,
    InputAdornment,
    LinearProgress,
    IconButton,
} from '@mui/material';
import {
    Person,
    GitHub,
    LinkedIn,
    Language,
    ArrowForward,
    ArrowBack,
    Check,
    Close,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { profileApi, ProfileData } from '@/utils/profileApi';

const steps = [
    { title: 'Basics', description: 'Tell us about yourself' },
    { title: 'Skills', description: 'Your tech stack & expertise' },
    { title: 'Preferences', description: 'Interests & availability' },
    { title: 'Links', description: 'Connect your profiles' },
];

const SKILL_OPTIONS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'C#', 'PHP', 'Ruby',
    'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Solid.js',
    'Node.js', 'Express', 'NestJS', 'Django', 'FastAPI', 'Spring Boot', 'Laravel',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'GraphQL', 'Prisma',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch'
];

const INTEREST_OPTIONS = [
    'Web Development', 'Mobile Apps', 'AI/ML', 'Data Science',
    'Blockchain', 'Game Dev', 'DevOps', 'Cybersecurity',
    'Open Source', 'Hackathons', 'Startups', 'EdTech', 'FinTech', 'HealthTech'
];

const LANGUAGE_OPTIONS = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean',
    'Hindi', 'Portuguese', 'Russian', 'Arabic', 'Italian'
];

export default function CreateProfilePage() {
    const [activeStep, setActiveStep] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const router = useRouter();

    const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<ProfileData>({
        defaultValues: {
            name: '',
            username: '',
            email: '',
            bio: '',
            primary_skills: [],
            secondary_skills: [],
            interests: [],
            languages: [],
            open_to: [],
            availability_hours: 10,
            timezone: '',
        }
    });

    React.useEffect(() => {
        const init = async () => {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            try {
                const profile = await profileApi.getProfile();
                if (profile) {
                    setIsEditMode(true);
                    reset({
                        ...profile,
                        timezone: profile.timezone || tz,
                        primary_skills: profile.primary_skills || [],
                        secondary_skills: profile.secondary_skills || [],
                        interests: profile.interests || [],
                        languages: profile.languages || [],
                        open_to: profile.open_to || [],
                    });
                } else {
                    setValue('timezone', tz);
                }
            } catch (e) {
                setValue('timezone', tz);
            }
        };
        init();
    }, [setValue, reset]);

    const onSubmit = async (data: ProfileData) => {
        try {
            if (isEditMode) {
                await profileApi.updateProfile(data);
            } else {
                await profileApi.createProfile(data);
            }
            router.push('/profile');
        } catch (error) {
            console.error("Failed to save profile:", error);
        }
    };

    const progress = ((activeStep + 1) / steps.length) * 100;

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Stack spacing={3}>
                        {/* Avatar */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'primary.main',
                                    fontSize: '2.5rem',
                                    fontWeight: 700,
                                }}
                            >
                                {watch('name')?.[0]?.toUpperCase() || <Person />}
                            </Avatar>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Name is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Full Name"
                                        fullWidth
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                )}
                            />
                            <Controller
                                name="username"
                                control={control}
                                rules={{ required: 'Username is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Username"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">@</InputAdornment>
                                        }}
                                        error={!!errors.username}
                                        helperText={errors.username?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Stack>

                        <Controller
                            name="email"
                            control={control}
                            rules={{ required: 'Email is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            )}
                        />

                        <Controller
                            name="bio"
                            control={control}
                            rules={{ required: 'Bio is required', maxLength: { value: 300, message: 'Max 300 characters' } }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Bio"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    placeholder="Tell us about yourself, your passion, and what you build..."
                                    error={!!errors.bio}
                                    helperText={errors.bio?.message || `${field.value?.length || 0}/300`}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            )}
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Controller
                                name="city"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="City"
                                        fullWidth
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                )}
                            />
                            <Controller
                                name="country"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Country"
                                        fullWidth
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Stack>
                    </Stack>
                );

            case 1:
                return (
                    <Stack spacing={4}>
                        <Controller
                            name="primary_skills"
                            control={control}
                            rules={{ required: 'Select at least 1 primary skill' }}
                            render={({ field: { onChange, value } }) => (
                                <Autocomplete
                                    multiple
                                    options={SKILL_OPTIONS}
                                    value={value || []}
                                    onChange={(_, newValue) => onChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Primary Skills"
                                            placeholder="Your core technologies"
                                            error={!!errors.primary_skills}
                                            helperText={errors.primary_skills?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
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

                        <Controller
                            name="secondary_skills"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Autocomplete
                                    multiple
                                    options={SKILL_OPTIONS}
                                    value={value || []}
                                    onChange={(_, newValue) => onChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Secondary Skills"
                                            placeholder="Technologies you're familiar with"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={option}
                                                label={option}
                                                variant="outlined"
                                            />
                                        ))
                                    }
                                />
                            )}
                        />

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                Experience Level
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {['Junior (0-2y)', 'Intermediate (2-5y)', 'Senior (5y+)'].map((level) => {
                                    const levelKey = level.split(' ')[0].toLowerCase();
                                    return (
                                        <Controller
                                            key={level}
                                            name="experience_level"
                                            control={control}
                                            render={({ field }) => (
                                                <Chip
                                                    label={level}
                                                    onClick={() => field.onChange(levelKey)}
                                                    color={field.value === levelKey ? "primary" : "default"}
                                                    variant={field.value === levelKey ? "filled" : "outlined"}
                                                    clickable
                                                    sx={{ fontWeight: 500 }}
                                                />
                                            )}
                                        />
                                    );
                                })}
                            </Stack>
                        </Box>
                    </Stack>
                );

            case 2:
                return (
                    <Stack spacing={4}>
                        <Controller
                            name="interests"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={INTEREST_OPTIONS}
                                    value={value || []}
                                    onChange={(_, newValue) => onChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Interests & Passions"
                                            placeholder="E.g. AI, Open Source, Startups"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={option}
                                                label={option}
                                                color="secondary"
                                                variant="outlined"
                                            />
                                        ))
                                    }
                                />
                            )}
                        />

                        <Controller
                            name="languages"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={LANGUAGE_OPTIONS}
                                    value={value || []}
                                    onChange={(_, newValue) => onChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Languages Spoken"
                                            placeholder="E.g. English, Spanish"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={option}
                                                label={option}
                                                variant="outlined"
                                            />
                                        ))
                                    }
                                />
                            )}
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Controller
                                name="availability_hours"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        label="Weekly Availability"
                                        fullWidth
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">hrs/week</InputAdornment>
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                )}
                            />
                            <Controller
                                name="preferred_role"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Preferred Role"
                                        placeholder="e.g. Full Stack Developer"
                                        fullWidth
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Stack>
                    </Stack>
                );

            case 3:
                return (
                    <Stack spacing={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Connect your social profiles so teams can learn more about you.
                        </Typography>

                        <Controller
                            name="github"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="GitHub"
                                    placeholder="https://github.com/username"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <GitHub />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            )}
                        />

                        <Controller
                            name="linkedin"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="LinkedIn"
                                    placeholder="https://linkedin.com/in/username"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LinkedIn />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            )}
                        />

                        <Controller
                            name="portfolio"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Portfolio / Website"
                                    placeholder="https://yourwebsite.com"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Language />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            )}
                        />
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
                        href="/profile"
                        startIcon={<ArrowBack />}
                        sx={{ color: 'text.secondary', textTransform: 'none' }}
                    >
                        Back to Profile
                    </Button>
                    <IconButton onClick={() => router.push('/profile')}>
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
                            {isEditMode ? 'Update Your Profile' : 'Create Your Profile'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {steps[activeStep].description}
                        </Typography>
                    </Box>

                    {/* Progress Bar */}
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
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                }
                            }}
                        />
                    </Box>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box sx={{ minHeight: 320 }}>
                                    {renderStepContent(activeStep)}
                                </Box>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
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
                                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Profile' : 'Complete Profile')}
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
