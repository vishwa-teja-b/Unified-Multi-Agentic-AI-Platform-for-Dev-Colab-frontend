'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    Chip,
    Button,
    Skeleton,
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowForward,
    AccessTime,
    Group,
    ArrowBack,
    MoreHoriz,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { projectApi, ProjectResponse } from '@/utils/projectApi';

// Dummy data for testing/fallback
const DUMMY_PROJECTS: ProjectResponse[] = [
    {
        id: 'dummy-1',
        auth_user_id: 1,
        title: 'AI-Powered Agent Platform',
        category: 'AI/ML',
        description: 'A unified platform for deploying and orchestrating autonomous AI agents to solve complex developer workflows. Features real-time collaboration and skill matching.',
        features: ['Agent Orchestration', 'Real-time Chat', 'Skill Matching'],
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
        features: ['Carbon Calculator', 'Social Sharing', 'Gamification'],
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
        description: 'A comprehensive dashboard for tracking decentralized finance investments across multiple chains. Includes real-time price charts.',
        features: ['Wallet Integration', 'Price Charts', 'Portfolio Analytics'],
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

export default function MyProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectApi.getMyProjects();
                if (data && data.length > 0) {
                    setProjects(data);
                } else {
                    setProjects(DUMMY_PROJECTS);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                setProjects(DUMMY_PROJECTS);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return { bg: '#E3F2FD', text: '#1565C0' };
            case 'In Progress': return { bg: '#FFF3E0', text: '#E65100' };
            case 'Completed': return { bg: '#E8F5E9', text: '#2E7D32' };
            default: return { bg: '#F5F5F5', text: '#616161' };
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="xl">
                {/* Navigation */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Button
                        component={Link}
                        href="/"
                        startIcon={<ArrowBack />}
                        sx={{ color: 'text.secondary', textTransform: 'none' }}
                    >
                        Home
                    </Button>
                </Stack>

                {/* Header */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    sx={{ mb: 6 }}
                >
                    <Box>
                        <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                            My Projects
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your ideas and track progress
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/projects/create')}
                        disableElevation
                        sx={{
                            bgcolor: 'text.primary',
                            color: 'background.default',
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: 'text.secondary' }
                        }}
                    >
                        New Project
                    </Button>
                </Stack>

                {/* Content */}
                {loading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 3 }}>
                        {[1, 2, 3].map((n) => (
                            <Skeleton key={n} variant="rectangular" height={320} sx={{ borderRadius: 4 }} />
                        ))}
                    </Box>
                ) : projects.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 8,
                            borderRadius: 4,
                            textAlign: 'center',
                            border: theme => `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>No projects yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create your first project to get started
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => router.push('/projects/create')}
                            disableElevation
                            sx={{
                                bgcolor: 'text.primary',
                                color: 'background.default',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { bgcolor: 'text.secondary' }
                            }}
                        >
                            Create Project
                        </Button>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 3 }}>
                        {projects.map((project, index) => {
                            const statusColors = getStatusColor(project.status);
                            return (
                                <MotionPaper
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    elevation={0}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                    sx={{
                                        p: 3,
                                        borderRadius: 4,
                                        border: theme => `1px solid ${theme.palette.divider}`,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: 320,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: 'text.disabled',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                        }
                                    }}
                                >
                                    {/* Header */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                label={project.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'action.hover',
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                            <Chip
                                                label={project.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: statusColors.bg,
                                                    color: statusColors.text,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        </Stack>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); }}
                                            sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                                        >
                                            <MoreHoriz fontSize="small" />
                                        </IconButton>
                                    </Stack>

                                    {/* Title & Description */}
                                    <Typography
                                        variant="h6"
                                        fontWeight="700"
                                        sx={{
                                            mb: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {project.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 2,
                                            lineHeight: 1.6,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            flex: 1,
                                        }}
                                    >
                                        {project.description}
                                    </Typography>

                                    {/* Meta */}
                                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                                            <Group sx={{ fontSize: 16 }} />
                                            <Typography variant="caption" fontWeight="500">
                                                {project.team_size.min}-{project.team_size.max}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                                            <AccessTime sx={{ fontSize: 16 }} />
                                            <Typography variant="caption" fontWeight="500">
                                                {project.estimated_duration}
                                            </Typography>
                                        </Stack>
                                    </Stack>

                                    {/* Skills */}
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                        {project.required_skills.slice(0, 4).map((skill, i) => (
                                            <Chip
                                                key={i}
                                                label={skill}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: 24 }}
                                            />
                                        ))}
                                        {project.required_skills.length > 4 && (
                                            <Chip
                                                label={`+${project.required_skills.length - 4}`}
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'action.hover' }}
                                            />
                                        )}
                                    </Box>

                                    {/* Footer */}
                                    <Stack direction="row" justifyContent="flex-end" alignItems="center">
                                        <Typography
                                            variant="caption"
                                            fontWeight="600"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                color: 'text.secondary',
                                                '&:hover': { color: 'text.primary' },
                                            }}
                                        >
                                            View Details <ArrowForward sx={{ fontSize: 14 }} />
                                        </Typography>
                                    </Stack>
                                </MotionPaper>
                            );
                        })}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
