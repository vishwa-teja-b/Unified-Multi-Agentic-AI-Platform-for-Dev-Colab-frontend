'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Avatar,
    Chip,
    Stack,
    Button,
    IconButton,
    LinearProgress,
    AvatarGroup,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    Folder,
    Mail,
    Assignment,
    TrendingUp,
    AutoAwesome,
    ArrowForward,
    Check,
    Close,
    AccessTime,
    Groups,
    Add,
    Notifications,
    Person,
    Logout,
    CalendarToday,
    Code,
    Explore,
    Chat,
    Brightness4,
    Brightness7,
    Search,
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectApi, InvitationResponse } from '@/utils/projectApi';

const MotionBox = motion(Box);

// ============ DUMMY DATA ============

const currentUser = {
    name: 'Vishwateja',
    username: 'vishwateja',
    avatar: null,
};

const stats = [
    { label: 'Active Projects', value: 3, icon: <Folder />, color: '#a855f7' },
    { label: 'Pending Invites', value: 2, icon: <Mail />, color: '#f472b6' },
    { label: 'Tasks This Week', value: 8, icon: <Assignment />, color: '#60a5fa' },
    { label: 'Completed', value: 12, icon: <TrendingUp />, color: '#34d399' },
];

// pendingInvites: fetched live from API inside PendingInvitations component

// pendingInvites: fetched live from API inside PendingInvitations component

// myProjects: fetched live from API inside MyProjects component


const upcomingTasks = [
    { id: 1, title: 'Implement user authentication', project: 'Campus Event Manager', priority: 'high', dueDate: 'Today', status: 'in_progress' },
    { id: 2, title: 'Design event listing UI', project: 'Campus Event Manager', priority: 'high', dueDate: 'Tomorrow', status: 'todo' },
    { id: 3, title: 'Setup MongoDB schemas', project: 'Smart Notes AI', priority: 'medium', dueDate: 'Feb 12', status: 'todo' },
    { id: 4, title: 'Create API endpoints for teams', project: 'DevCollab Platform', priority: 'medium', dueDate: 'Feb 13', status: 'todo' },
    { id: 5, title: 'Write unit tests for auth', project: 'Campus Event Manager', priority: 'low', dueDate: 'Feb 14', status: 'todo' },
];

const activityFeed = [
    { id: 1, user: 'Priya Sharma', action: 'completed', target: 'Setup React Native project', project: 'Campus Event Manager', time: '2 hours ago' },
    { id: 2, user: 'Vikram Reddy', action: 'commented on', target: 'Database schema design', project: 'Campus Event Manager', time: '4 hours ago' },
    { id: 3, user: 'Ananya Singh', action: 'uploaded', target: 'UI mockups for dashboard', project: 'DevCollab Platform', time: '5 hours ago' },
    { id: 4, user: 'Arjun Kumar', action: 'started working on', target: 'Push notification service', project: 'Campus Event Manager', time: '1 day ago' },
];

const discoverProjects = [
    { id: 'd1', name: 'E-commerce Platform', skills: ['Next.js', 'Node.js', 'PostgreSQL'], looking: 2, category: 'Web App' },
    { id: 'd2', name: 'Mental Health Tracker', skills: ['React Native', 'AI/ML', 'Python'], looking: 3, category: 'Mobile App' },
    { id: 'd3', name: 'Open Source CMS', skills: ['TypeScript', 'GraphQL', 'Docker'], looking: 4, category: 'Open Source' },
];

// ============ COMPONENTS ============

function DashboardNav() {
    const router = useRouter();
    const { mode, toggleColorMode } = useThemeContext();

    return (
        <Box sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <Container maxWidth="xl">
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: 64 }}>
                    <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
                        DevCollab
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton onClick={toggleColorMode} sx={{ color: 'text.secondary' }}>
                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                        <IconButton onClick={() => router.push('/invitations')} sx={{ color: 'text.secondary' }}>
                            <Notifications />
                        </IconButton>
                        <IconButton onClick={() => router.push('/profile')} sx={{ color: 'text.secondary' }}>
                            <Person />
                        </IconButton>
                        <IconButton sx={{ color: 'text.secondary' }}>
                            <Logout />
                        </IconButton>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}

function StatsCards() {
    return (
        <Grid container spacing={2.5}>
            {stats.map((stat, index) => (
                <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            p: 3,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 1,
                            border: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`,
                        }} />
                        <Box sx={{ color: stat.color, mb: 1.5 }}>{stat.icon}</Box>
                        <Typography variant="h4" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
                            {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {stat.label}
                        </Typography>
                    </MotionBox>
                </Grid>
            ))}
        </Grid>
    );
}

function PendingInvitations() {
    const router = useRouter();
    const [invites, setInvites] = useState<InvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        projectApi.getMyInvitations()
            .then(data => setInvites(data.filter((i: InvitationResponse) => i.status === 'PENDING')))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleAction = async (id: string, status: string) => {
        setActionLoading(id);
        try {
            await projectApi.updateInvitation({ invitation_id: id, status });
            setInvites(prev => prev.filter(i => i.id !== id));
        } catch (e) { /* silently fail */ }
        setActionLoading(null);
    };

    if (loading) return null;
    if (invites.length === 0) return null;

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 4,
                p: 3,
                boxShadow: 1,
                border: 1,
                borderColor: 'divider',
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'secondary.main' }}>
                        <Mail color="primary" />
                    </Box>
                    <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary' }}>
                        Pending Invitations
                    </Typography>
                    <Chip label={invites.length} size="small" sx={{ bgcolor: 'secondary.dark', color: 'text.primary', fontWeight: 600 }} />
                </Stack>
                <Button
                    onClick={() => router.push('/invitations')}
                    sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                >
                    View All
                </Button>
            </Stack>

            <Stack spacing={2}>
                {invites.slice(0, 3).map((invite) => (
                    <Box key={invite.id} sx={{
                        bgcolor: 'background.default',
                        borderRadius: 3,
                        p: 2.5,
                        border: 1,
                        borderColor: 'divider',
                    }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'text.primary', mb: 0.5 }}>
                                    {invite.project_title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    as <strong style={{ color: 'text.primary' }}>{invite.role}</strong>
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={actionLoading === invite.id ? <CircularProgress size={14} color="inherit" /> : <Check />}
                                    disabled={actionLoading === invite.id}
                                    onClick={() => handleAction(invite.id, 'ACCEPTED')}
                                    sx={{
                                        bgcolor: '#34d399',
                                        color: '#000',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#22c55e' },
                                    }}
                                >
                                    Accept
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Close />}
                                    disabled={actionLoading === invite.id}
                                    onClick={() => handleAction(invite.id, 'REJECTED')}
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        color: 'rgba(255,255,255,0.7)',
                                        '&:hover': { borderColor: '#ef4444', color: '#ef4444' },
                                    }}
                                >
                                    Decline
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </MotionBox>
    );
}

function MyProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectApi.getMyProjects();

                // Map API response to UI format
                const mappedProjects = data.map((p: any) => {
                    // Logic to determine role (assuming current user is owner for now if auth_user_id matches, 
                    // but we need current user ID. For now, defaulting to 'Owner' for created projects)
                    // TODO: Get actual current user ID to check role

                    // Randomize progress/sprints for demo visualization since backend doesn't track this yet
                    const totalSprints = 4;
                    const currentSprint = Math.floor(Math.random() * totalSprints) + 1;
                    const progress = Math.floor(Math.random() * 100);

                    return {
                        id: p.id,
                        name: p.title,
                        description: p.description,
                        status: p.status || 'Active', // Default to active if undefined
                        role: 'Owner', // Defaulting to Owner for "My Projects" endpoint for now
                        progress: progress,
                        currentSprint: currentSprint,
                        totalSprints: totalSprints,
                        teamSize: p.team_size?.max || 4,
                        teamAvatars: Array(Math.min(p.team_size?.min || 1, 4)).fill(null), // Placeholder avatars
                        dueDate: p.estimated_duration || 'TBD',
                    };
                });

                setProjects(mappedProjects);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (projects.length === 0) {
        return (
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 4, border: 1, borderColor: 'divider' }}
            >
                <Box sx={{ mb: 2, bgcolor: 'action.hover', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
                    <Folder sx={{ fontSize: 30, color: 'text.secondary' }} />
                </Box>
                <Typography variant="h6" color="text.primary" gutterBottom>
                    No projects yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    Create your first project to start finding teammates and planning your roadmap.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => router.push('/projects/create')}
                >
                    Create Project
                </Button>
            </MotionBox>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(168,85,247,0.2)' }}>
                        <Folder sx={{ color: '#a855f7' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary' }}>
                        My Projects
                    </Typography>
                </Stack>
                <Button
                    startIcon={<Add />}
                    onClick={() => router.push('/projects/create')}
                    sx={{
                        color: '#a855f7',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(168,85,247,0.1)' },
                    }}
                >
                    New Project
                </Button>
            </Stack>

            <Grid container spacing={2.5}>
                {projects.map((project) => (
                    <Grid size={{ xs: 12, md: 4 }} key={project.id}>
                        <Box
                            onClick={() => router.push(`/projects/${project.id}`)}
                            sx={{
                                bgcolor: 'background.paper', // Changed from hardcoded dark color
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: '16px',
                                p: 3,
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-4px)',
                                    boxShadow: 2,
                                },
                            }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
                                        {project.name}
                                    </Typography>
                                    <Chip
                                        label={project.status}
                                        size="small"
                                        sx={{
                                            bgcolor: project.status.toLowerCase() === 'active' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)',
                                            color: project.status.toLowerCase() === 'active' ? '#34d399' : '#fbbf24',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                </Box>
                                <Chip label={project.role} size="small" sx={{ bgcolor: 'rgba(168,85,247,0.2)', color: '#c084fc' }} />
                            </Stack>

                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {project.description}
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Sprint {project.currentSprint}/{project.totalSprints}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {project.progress}%
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={project.progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: 'action.hover',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            background: 'linear-gradient(90deg, #a855f7, #6366f1)',
                                        },
                                    }}
                                />
                            </Box>

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#6366f1' } }}>
                                    {project.teamAvatars.map((_: any, i: number) => (
                                        <Avatar key={i} />
                                    ))}
                                </AvatarGroup>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {project.dueDate}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </MotionBox>
    );
}

function UpcomingTasks() {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#fbbf24';
            default: return '#60a5fa';
        }
    };

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            sx={{
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 4,
                boxShadow: 1,
                p: 3,
                height: '100%',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(96,165,250,0.2)' }}>
                    <Assignment sx={{ color: '#60a5fa' }} />
                </Box>
                <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary' }}>
                    Upcoming Tasks
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                {upcomingTasks.map((task) => (
                    <Box key={task.id} sx={{
                        bgcolor: 'background.default',
                        borderRadius: 3,
                        p: 2,
                        borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                        border: 1,
                        borderColor: 'divider',
                        borderLeftWidth: 3,
                        borderLeftColor: getPriorityColor(task.priority),
                    }}>
                        <Typography variant="body2" fontWeight="600" sx={{ color: 'text.primary', mb: 0.5 }}>
                            {task.title}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {task.project}
                            </Typography>
                            <Chip
                                label={task.dueDate}
                                size="small"
                                sx={{
                                    bgcolor: task.dueDate === 'Today' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                                    color: task.dueDate === 'Today' ? '#ef4444' : 'rgba(255,255,255,0.6)',
                                    fontSize: '0.65rem',
                                    height: 20,
                                }}
                            />
                        </Stack>
                    </Box>
                ))}
            </Stack>

            <Button
                fullWidth
                endIcon={<ArrowForward />}
                sx={{
                    mt: 2,
                    color: '#60a5fa',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(96,165,250,0.1)' },
                }}
            >
                View All Tasks
            </Button>
        </MotionBox>
    );
}

function ActivityFeed() {
    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            sx={{
                background: 'rgba(20, 20, 40, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                p: 3,
                height: '100%',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(52,211,153,0.2)' }}>
                    <Chat sx={{ color: '#34d399' }} />
                </Box>
                <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary' }}>
                    Team Activity
                </Typography>
            </Stack>

            <Stack spacing={2}>
                {activityFeed.map((activity) => (
                    <Box key={activity.id}>
                        <Stack direction="row" spacing={2}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: '0.85rem' }}>
                                {activity.user.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                    <strong>{activity.user}</strong>{' '}
                                    <span style={{ color: 'text.secondary' }}>{activity.action}</span>{' '}
                                    <span style={{ color: '#a855f7' }}>{activity.target}</span>
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {activity.project} • {activity.time}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </MotionBox>
    );
}

function AIQuickActions() {
    const router = useRouter();

    const actions = [
        { icon: <Groups />, label: 'Find Teammates', desc: 'AI matches you with developers', color: '#a855f7', href: '/projects?filter=created' },
        { icon: <AutoAwesome />, label: 'Generate Roadmap', desc: 'Create project plan with AI', color: '#f472b6', href: '/projects' },
        { icon: <Explore />, label: 'Explore Projects', desc: 'Browse open projects', color: '#60a5fa', href: '/projects' },
    ];

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(168,85,247,0.2)' }}>
                    <AutoAwesome sx={{ color: '#a855f7' }} />
                </Box>
                <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary' }}>
                    AI Quick Actions
                </Typography>
            </Stack>

            <Grid container spacing={2}>
                {actions.map((action) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={action.label}>
                        <Box
                            onClick={() => router.push(action.href)}
                            sx={{
                                background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}05 100%)`,
                                border: `1px solid ${action.color}30`,
                                borderRadius: '16px',
                                p: 3,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textAlign: 'center',
                                '&:hover': {
                                    borderColor: action.color,
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 32px ${action.color}20`,
                                },
                            }}
                        >
                            <Box sx={{ color: action.color, mb: 1.5 }}>{action.icon}</Box>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
                                {action.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {action.desc}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </MotionBox>
    );
}

function DiscoverProjects() {
    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 4,
                p: 3,
                boxShadow: 1,
                border: 1,
                borderColor: 'divider',
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(251,191,36,0.2)' }}>
                        <Explore sx={{ color: '#fbbf24' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary' }}>
                        Discover Projects
                    </Typography>
                </Stack>
                <Button
                    endIcon={<ArrowForward />}
                    sx={{ color: '#fbbf24', textTransform: 'none', fontWeight: 600 }}
                >
                    Browse All
                </Button>
            </Stack>

            <Grid container spacing={2}>
                {discoverProjects.map((project) => (
                    <Grid size={{ xs: 12, md: 4 }} key={project.id}>
                        <Box sx={{
                            bgcolor: 'background.default',
                            borderRadius: 3,
                            p: 2.5,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: 1,
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.primary', mb: 1 }}>
                                {project.name}
                            </Typography>
                            <Chip label={project.category} size="small" sx={{ bgcolor: 'rgba(251,191,36,0.15)', color: '#fbbf24', mb: 1.5, fontSize: '0.65rem' }} />
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
                                {project.skills.slice(0, 3).map(skill => (
                                    <Chip key={skill} label={skill} size="small" sx={{
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.65rem',
                                        height: 20,
                                    }} />
                                ))}
                            </Stack>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Looking for <strong style={{ color: '#fbbf24' }}>{project.looking} teammates</strong>
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </MotionBox>
    );
}

// ============ MAIN DASHBOARD ============

export default function DashboardPage() {
    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
        }}>
            <DashboardNav />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Welcome Header */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ mb: 4 }}
                >
                    <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary', mb: 0.5 }}>
                        Welcome back, {currentUser.name}! 👋
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Here's what's happening with your projects today.
                    </Typography>
                </MotionBox>

                {/* Stats Cards */}
                <Box sx={{ mb: 4 }}>
                    <StatsCards />
                </Box>

                {/* Pending Invitations */}
                <Box sx={{ mb: 4 }}>
                    <PendingInvitations />
                </Box>

                {/* My Projects */}
                <Box sx={{ mb: 4 }}>
                    <MyProjects />
                </Box>

                {/* Tasks + Activity Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <UpcomingTasks />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ActivityFeed />
                    </Grid>
                </Grid>

                {/* AI Quick Actions */}
                <Box sx={{ mb: 4 }}>
                    <AIQuickActions />
                </Box>

                {/* Discover Projects */}
                <Box sx={{ mb: 4 }}>
                    <DiscoverProjects />
                </Box>
            </Container>
        </Box>
    );
}
