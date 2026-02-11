'use client';

import React from 'react';
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const pendingInvites = [
    {
        id: 1,
        projectName: 'AI Study Buddy',
        role: 'Backend Developer',
        invitedBy: 'Priya Sharma',
        invitedByAvatar: null,
        skills: ['Python', 'FastAPI', 'MongoDB'],
        daysAgo: 2,
    },
    {
        id: 2,
        projectName: 'Fitness Tracker Pro',
        role: 'Mobile Developer',
        invitedBy: 'Arjun Reddy',
        invitedByAvatar: null,
        skills: ['React Native', 'Firebase'],
        daysAgo: 1,
    },
];

const myProjects = [
    {
        id: 'proj1',
        name: 'Campus Event Manager',
        description: 'An app for college students to discover and manage campus events',
        status: 'active',
        role: 'Owner',
        progress: 45,
        currentSprint: 2,
        totalSprints: 4,
        teamSize: 4,
        teamAvatars: [null, null, null, null],
        dueDate: '2026-03-15',
    },
    {
        id: 'proj2',
        name: 'DevCollab Platform',
        description: 'AI-powered developer collaboration and team matching',
        status: 'active',
        role: 'Mobile Dev',
        progress: 68,
        currentSprint: 3,
        totalSprints: 4,
        teamSize: 5,
        teamAvatars: [null, null, null, null, null],
        dueDate: '2026-02-28',
    },
    {
        id: 'proj3',
        name: 'Smart Notes AI',
        description: 'AI-powered note-taking app with auto-summarization',
        status: 'forming',
        role: 'Owner',
        progress: 10,
        currentSprint: 1,
        totalSprints: 6,
        teamSize: 2,
        teamAvatars: [null, null],
        dueDate: '2026-04-30',
    },
];

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

    return (
        <Box sx={{
            bgcolor: 'rgba(10, 10, 26, 0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <Container maxWidth="xl">
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: 64 }}>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
                        DevCollab
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            <Notifications />
                        </IconButton>
                        <IconButton onClick={() => router.push('/profile')} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            <Person />
                        </IconButton>
                        <IconButton sx={{ color: 'rgba(255,255,255,0.6)' }}>
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
                <Grid item xs={6} md={3} key={stat.label}>
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        sx={{
                            background: 'rgba(20, 20, 40, 0.6)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px',
                            p: 3,
                            position: 'relative',
                            overflow: 'hidden',
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
                        <Typography variant="h4" fontWeight="700" sx={{ color: '#fff', mb: 0.5 }}>
                            {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            {stat.label}
                        </Typography>
                    </MotionBox>
                </Grid>
            ))}
        </Grid>
    );
}

function PendingInvitations() {
    if (pendingInvites.length === 0) return null;

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{
                background: 'linear-gradient(135deg, rgba(244,114,182,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                border: '1px solid rgba(244,114,182,0.2)',
                borderRadius: '20px',
                p: 3,
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(244,114,182,0.2)' }}>
                        <Mail sx={{ color: '#f472b6' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#fff' }}>
                        Pending Invitations
                    </Typography>
                    <Chip label={pendingInvites.length} size="small" sx={{ bgcolor: '#f472b6', color: '#fff', fontWeight: 600 }} />
                </Stack>
            </Stack>

            <Stack spacing={2}>
                {pendingInvites.map((invite) => (
                    <Box key={invite.id} sx={{
                        bgcolor: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        p: 2.5,
                    }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#fff', mb: 0.5 }}>
                                    {invite.projectName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
                                    as <strong style={{ color: '#f472b6' }}>{invite.role}</strong> • invited by {invite.invitedBy}
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                    {invite.skills.map(skill => (
                                        <Chip key={skill} label={skill} size="small" sx={{
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            color: 'rgba(255,255,255,0.7)',
                                            fontSize: '0.7rem',
                                        }} />
                                    ))}
                                </Stack>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Check />}
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
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#fff' }}>
                        My Projects
                    </Typography>
                </Stack>
                <Button
                    startIcon={<Add />}
                    onClick={() => router.push('/projects/new')}
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
                {myProjects.map((project) => (
                    <Grid item xs={12} md={4} key={project.id}>
                        <Box sx={{
                            background: 'rgba(20, 20, 40, 0.6)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '16px',
                            p: 3,
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'rgba(168,85,247,0.3)',
                                transform: 'translateY(-4px)',
                            },
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#fff', mb: 0.5 }}>
                                        {project.name}
                                    </Typography>
                                    <Chip
                                        label={project.status === 'active' ? 'Active' : 'Forming'}
                                        size="small"
                                        sx={{
                                            bgcolor: project.status === 'active' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)',
                                            color: project.status === 'active' ? '#34d399' : '#fbbf24',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                </Box>
                                <Chip label={project.role} size="small" sx={{ bgcolor: 'rgba(168,85,247,0.2)', color: '#c084fc' }} />
                            </Stack>

                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, minHeight: 40 }}>
                                {project.description.slice(0, 60)}...
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                        Sprint {project.currentSprint}/{project.totalSprints}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {project.progress}%
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={project.progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            background: 'linear-gradient(90deg, #a855f7, #6366f1)',
                                        },
                                    }}
                                />
                            </Box>

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#6366f1' } }}>
                                    {project.teamAvatars.map((_, i) => (
                                        <Avatar key={i}>{String.fromCharCode(65 + i)}</Avatar>
                                    ))}
                                </AvatarGroup>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CalendarToday sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
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
                background: 'rgba(20, 20, 40, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                p: 3,
                height: '100%',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(96,165,250,0.2)' }}>
                    <Assignment sx={{ color: '#60a5fa' }} />
                </Box>
                <Typography variant="h6" fontWeight="700" sx={{ color: '#fff' }}>
                    Upcoming Tasks
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                {upcomingTasks.map((task) => (
                    <Box key={task.id} sx={{
                        bgcolor: 'rgba(0,0,0,0.2)',
                        borderRadius: '10px',
                        p: 2,
                        borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                    }}>
                        <Typography variant="body2" fontWeight="600" sx={{ color: '#fff', mb: 0.5 }}>
                            {task.title}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
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
                <Typography variant="h6" fontWeight="700" sx={{ color: '#fff' }}>
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
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                    <strong>{activity.user}</strong>{' '}
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{activity.action}</span>{' '}
                                    <span style={{ color: '#a855f7' }}>{activity.target}</span>
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
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
        { icon: <Groups />, label: 'Find Teammates', desc: 'AI matches you with developers', color: '#a855f7', href: '/projects/new' },
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
                <Typography variant="h6" fontWeight="700" sx={{ color: '#fff' }}>
                    AI Quick Actions
                </Typography>
            </Stack>

            <Grid container spacing={2}>
                {actions.map((action) => (
                    <Grid item xs={12} sm={4} key={action.label}>
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
                            <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#fff', mb: 0.5 }}>
                                {action.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
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
                background: 'rgba(20, 20, 40, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                p: 3,
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(251,191,36,0.2)' }}>
                        <Explore sx={{ color: '#fbbf24' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#fff' }}>
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
                    <Grid item xs={12} md={4} key={project.id}>
                        <Box sx={{
                            bgcolor: 'rgba(0,0,0,0.2)',
                            borderRadius: '12px',
                            p: 2.5,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.3)' },
                        }}>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#fff', mb: 1 }}>
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
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
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
            background: 'linear-gradient(180deg, #0a0a1a 0%, #12122a 50%, #1a1a2e 100%)',
        }}>
            <DashboardNav />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Welcome Header */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ mb: 4 }}
                >
                    <Typography variant="h4" fontWeight="800" sx={{ color: '#fff', mb: 0.5 }}>
                        Welcome back, {currentUser.name}! 👋
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
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
                    <Grid item xs={12} md={6}>
                        <UpcomingTasks />
                    </Grid>
                    <Grid item xs={12} md={6}>
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
