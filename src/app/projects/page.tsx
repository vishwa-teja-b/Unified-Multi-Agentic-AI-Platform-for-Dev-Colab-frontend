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
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Badge,
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowForward,
    AccessTime,
    Group,
    ArrowBack,
    MoreHoriz,
    Explore,
    FolderSpecial,
    Inbox,
    CheckCircle,
    Cancel,
    PersonAdd,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { projectApi, ProjectResponse, InvitationResponse } from '@/utils/projectApi';

const MotionPaper = motion(Paper);

export default function ProjectsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [myProjects, setMyProjects] = useState<ProjectResponse[]>([]);
    const [allProjects, setAllProjects] = useState<ProjectResponse[]>([]);
    const [joinRequests, setJoinRequests] = useState<InvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [filterCreated, setFilterCreated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // Request detail modal state
    const [selectedRequest, setSelectedRequest] = useState<InvitationResponse | null>(null);
    const [respondLoading, setRespondLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        // Get current user ID from localStorage
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
            setCurrentUserId(parseInt(storedUserId));
        }

        // Check for filter param
        const filterParam = searchParams.get('filter');
        if (filterParam === 'created') {
            setFilterCreated(true);
            setActiveTab(0); // Ensure we are on My Projects tab
        }

        const fetchAll = async () => {
            try {
                const [mine, all, requests] = await Promise.allSettled([
                    projectApi.getMyProjects(),
                    projectApi.getAllProjects(),
                    projectApi.getJoinRequests(),
                ]);
                if (mine.status === 'fulfilled') setMyProjects(mine.value);
                if (all.status === 'fulfilled') setAllProjects(all.value);
                if (requests.status === 'fulfilled') setJoinRequests(requests.value);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [searchParams]);

    const handleRespondRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
        setRespondLoading(true);
        try {
            await projectApi.respondJoinRequest({ invitation_id: requestId, status });
            setSnackbar({
                open: true,
                message: status === 'ACCEPTED' ? 'Request accepted! Member added to team.' : 'Request rejected.',
                severity: 'success'
            });
            // Remove from list
            setJoinRequests(prev => prev.filter(r => r.id !== requestId));
            setSelectedRequest(null);
        } catch (err: any) {
            const msg = err?.response?.data?.detail || 'Failed to respond to request.';
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setRespondLoading(false);
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

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'Easy': return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'Medium': return { bg: '#FFF3E0', text: '#E65100' };
            case 'Hard': return { bg: '#FCE4EC', text: '#C62828' };
            default: return { bg: '#F5F5F5', text: '#616161' };
        }
    };

    const pendingRequests = joinRequests.filter(r => r.status === 'PENDING');

    const renderProjectCard = (project: ProjectResponse, index: number) => {
        const statusColors = getStatusColor(project.status);
        const complexityColors = getComplexityColor(project.complexity);
        return (
            <MotionPaper
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
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
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                            label={project.category}
                            size="small"
                            sx={{ bgcolor: 'action.hover', fontWeight: 500, fontSize: '0.75rem' }}
                        />
                        <Chip
                            label={project.status}
                            size="small"
                            sx={{ bgcolor: statusColors.bg, color: statusColors.text, fontWeight: 600, fontSize: '0.75rem' }}
                        />
                        <Chip
                            label={project.complexity}
                            size="small"
                            sx={{ bgcolor: complexityColors.bg, color: complexityColors.text, fontWeight: 600, fontSize: '0.75rem' }}
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
    };

    const renderRequestCard = (req: InvitationResponse, index: number) => (
        <MotionPaper
            key={req.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -2 }}
            elevation={0}
            onClick={() => setSelectedRequest(req)}
            sx={{
                p: 3,
                borderRadius: 4,
                border: theme => `1px solid ${theme.palette.divider}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: '#a855f7',
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.1)',
                }
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <PersonAdd sx={{ fontSize: 18, color: '#a855f7' }} />
                        <Typography variant="subtitle1" fontWeight="700">
                            {req.project_title}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Role:</strong> {req.role}
                    </Typography>
                    {req.message && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            "{req.message}"
                        </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                </Box>
                <Chip
                    label={req.status}
                    size="small"
                    sx={{
                        bgcolor: req.status === 'PENDING' ? '#FFF3E0' : req.status === 'ACCEPTED' ? '#E8F5E9' : '#FCE4EC',
                        color: req.status === 'PENDING' ? '#E65100' : req.status === 'ACCEPTED' ? '#2E7D32' : '#C62828',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                    }}
                />
            </Stack>
        </MotionPaper>
    );

    const filteredMyProjects = filterCreated && currentUserId
        ? myProjects.filter(p => p.auth_user_id === currentUserId)
        : myProjects;

    const currentProjects = activeTab === 0 ? filteredMyProjects : allProjects;

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
                    sx={{ mb: 4 }}
                >
                    <Box>
                        <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                            Projects
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {activeTab === 0
                                ? 'Manage your projects and track progress'
                                : activeTab === 1
                                    ? 'Discover projects and request to join'
                                    : 'Review join requests from other users'}
                        </Typography>
                        {activeTab === 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Chip
                                    label="All"
                                    onClick={() => setFilterCreated(false)}
                                    color={!filterCreated ? "primary" : "default"}
                                    variant={!filterCreated ? "filled" : "outlined"}
                                    size="small"
                                    clickable
                                />
                                <Chip
                                    label="Created by Me"
                                    onClick={() => setFilterCreated(true)}
                                    color={filterCreated ? "primary" : "default"}
                                    variant={filterCreated ? "filled" : "outlined"}
                                    size="small"
                                    clickable
                                />
                            </Stack>
                        )}
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

                {/* Tabs */}
                <Box sx={{ mb: 4 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                minHeight: 48,
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            },
                        }}
                    >
                        <Tab
                            icon={<FolderSpecial sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={`My Projects (${myProjects.length})`}
                        />
                        <Tab
                            icon={<Explore sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={`Explore (${allProjects.length})`}
                        />
                        <Tab
                            icon={
                                <Badge badgeContent={pendingRequests.length} color="error" max={99}>
                                    <Inbox sx={{ fontSize: 20 }} />
                                </Badge>
                            }
                            iconPosition="start"
                            label="Requests"
                        />
                    </Tabs>
                </Box>

                {/* Content */}
                {loading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 3 }}>
                        {[1, 2, 3].map((n) => (
                            <Skeleton key={n} variant="rectangular" height={320} sx={{ borderRadius: 4 }} />
                        ))}
                    </Box>
                ) : activeTab === 2 ? (
                    // Requests Tab
                    pendingRequests.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 8,
                                borderRadius: 4,
                                textAlign: 'center',
                                border: theme => `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Inbox sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                                No pending requests
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                When someone requests to join your project, it will appear here.
                            </Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={2} sx={{ maxWidth: 700 }}>
                            {pendingRequests.map((req, index) => renderRequestCard(req, index))}
                        </Stack>
                    )
                ) : currentProjects.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 8,
                            borderRadius: 4,
                            textAlign: 'center',
                            border: theme => `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                            {activeTab === 0 ? 'No projects yet' : 'No projects to explore'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {activeTab === 0
                                ? 'Create your first project to get started'
                                : 'Check back later for new projects from other users'
                            }
                        </Typography>
                        {activeTab === 0 && (
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
                        )}
                    </Paper>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 3 }}>
                        {currentProjects.map((project, index) => renderProjectCard(project, index))}
                    </Box>
                )}
            </Container>

            {/* Request Detail Modal */}
            <Dialog
                open={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedRequest && (
                    <>
                        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                            Join Request
                        </DialogTitle>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ mt: 1 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Project
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600">
                                        {selectedRequest.project_title}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Requested Role
                                    </Typography>
                                    <Chip label={selectedRequest.role} size="small" sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 600 }} />
                                </Box>
                                {selectedRequest.message && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Message
                                        </Typography>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'action.hover',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
                                                "{selectedRequest.message}"
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Requested On
                                    </Typography>
                                    <Typography variant="body2">
                                        {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                            <Button
                                onClick={() => setSelectedRequest(null)}
                                sx={{ textTransform: 'none', color: 'text.secondary' }}
                            >
                                Close
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => handleRespondRequest(selectedRequest.id, 'REJECTED')}
                                disabled={respondLoading}
                                sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CheckCircle />}
                                onClick={() => handleRespondRequest(selectedRequest.id, 'ACCEPTED')}
                                disabled={respondLoading}
                                disableElevation
                                sx={{
                                    bgcolor: '#16a34a',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: '#15803d' }
                                }}
                            >
                                {respondLoading ? 'Processing...' : 'Accept'}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Snackbar */}
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
