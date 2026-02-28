'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
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
    InputBase,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowForward,
    AccessTime,
    Group,
    MoreHoriz,
    Explore,
    FolderSpecial,
    Inbox,
    CheckCircle,
    Cancel,
    PersonAdd,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { projectApi, ProjectResponse, InvitationResponse } from '@/utils/projectApi';
import { TopBar } from '@/components/shared/TopBar';
import { DistortedBackground } from '@/components/shared/DistortedBackground';
import { useThemeColors } from '@/context/ThemeContext';

const MotionPaper = motion(Paper);

function ProjectsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const c = useThemeColors();
    const GOLD = c.gold;
    const [myProjects, setMyProjects] = useState<ProjectResponse[]>([]);
    const [allProjects, setAllProjects] = useState<ProjectResponse[]>([]);
    const [joinRequests, setJoinRequests] = useState<InvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [filterCreated, setFilterCreated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ProjectResponse[]>([]);
    const [searching, setSearching] = useState(false);
    const searchTimer = useRef<NodeJS.Timeout | null>(null);

    // Request detail modal state
    const [selectedRequest, setSelectedRequest] = useState<InvitationResponse | null>(null);
    const [respondLoading, setRespondLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
            setCurrentUserId(parseInt(storedUserId));
        }

        const filterParam = searchParams.get('filter');
        if (filterParam === 'created') {
            setFilterCreated(true);
            setActiveTab(0);
        }

        const tabParam = searchParams.get('tab');
        if (tabParam === 'explore') {
            setActiveTab(1);
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

    // Debounced semantic search
    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);

        if (!searchQuery || searchQuery.trim().length < 3) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        searchTimer.current = setTimeout(async () => {
            try {
                const results = await projectApi.searchProjects(searchQuery.trim());
                setSearchResults(results);
            } catch (err) {
                console.error('Search failed:', err);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 800);

        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, [searchQuery]);

    const handleRespondRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
        setRespondLoading(true);
        try {
            await projectApi.respondJoinRequest({ invitation_id: requestId, status });
            setSnackbar({
                open: true,
                message: status === 'ACCEPTED' ? 'Request accepted! Member added to team.' : 'Request rejected.',
                severity: 'success'
            });
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
            case 'Open': return { bg: 'rgba(21, 101, 192, 0.2)', text: '#42a5f5' };
            case 'In Progress': return { bg: 'rgba(230, 81, 0, 0.2)', text: '#ff9800' };
            case 'Completed': return { bg: 'rgba(46, 125, 50, 0.2)', text: '#66bb6a' };
            default: return { bg: c.borderLight, text: c.textSecondary };
        }
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'Easy': return { bg: 'rgba(46, 125, 50, 0.2)', text: '#66bb6a' };
            case 'Medium': return { bg: 'rgba(230, 81, 0, 0.2)', text: '#ff9800' };
            case 'Hard': return { bg: 'rgba(198, 40, 40, 0.2)', text: '#ef5350' };
            default: return { bg: c.borderLight, text: c.textSecondary };
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
                    bgcolor: c.cardBg,
                    border: c.cardBorder,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 320,
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)',
                    boxShadow: c.shadow,
                    '&:hover': {
                        borderColor: c.gold,
                        boxShadow: c.shadowHover,
                    }
                }}
            >
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                            label={project.category}
                            size="small"
                            sx={{ bgcolor: c.borderLight, color: c.textSecondary, fontWeight: 500, fontSize: '0.75rem' }}
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
                        sx={{ color: c.textMuted, '&:hover': { color: c.textPrimary } }}
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
                        color: c.textPrimary,
                        fontFamily: 'Space Grotesk',
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
                    sx={{
                        mb: 2,
                        color: c.textSecondary,
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
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: c.textSecondary }}>
                        <Group sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight="500">
                            {project.team_size.min}-{project.team_size.max}
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: c.textSecondary }}>
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
                            sx={{ fontSize: '0.7rem', height: 24, color: c.textSecondary, borderColor: c.borderLight }}
                        />
                    ))}
                    {project.required_skills.length > 4 && (
                        <Chip
                            label={`+${project.required_skills.length - 4}`}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 24, bgcolor: c.borderLight, color: c.textSecondary }}
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
                            color: c.gold,
                            fontFamily: 'Space Grotesk',
                            '&:hover': { color: '#F0C040' },
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
                bgcolor: c.cardBg,
                border: c.cardBorder,
                boxShadow: c.shadow,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: c.gold,
                    boxShadow: c.shadowHover,
                }
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <PersonAdd sx={{ fontSize: 18, color: c.gold }} />
                        <Typography variant="subtitle1" fontWeight="700" color={c.textPrimary} fontFamily="Space Grotesk">
                            {req.project_title}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mb: 1, color: c.textSecondary }}>
                        <strong>Role:</strong> {req.role}
                    </Typography>
                    {req.message && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: c.textMuted,
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
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: c.textMuted }}>
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                </Box>
                <Chip
                    label={req.status}
                    size="small"
                    sx={{
                        bgcolor: req.status === 'PENDING' ? 'rgba(230, 81, 0, 0.2)' : req.status === 'ACCEPTED' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)',
                        color: req.status === 'PENDING' ? '#ff9800' : req.status === 'ACCEPTED' ? '#66bb6a' : '#ef5350',
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

    const exploreProjects = searchQuery.trim().length >= 2 ? searchResults : allProjects;
    const currentProjects = activeTab === 0 ? filteredMyProjects : exploreProjects;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', color: c.textPrimary, overflowX: 'hidden', position: 'relative' }}>
            <DistortedBackground />
            <TopBar />

            <Box sx={{ pt: '100px', position: 'relative', zIndex: 10 }}>
                <Box sx={{ width: { xs: '98%', sm: '90%', md: '85%', lg: '75%' }, maxWidth: '1300px', mx: 'auto' }}>
                    {/* Header */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                        sx={{ mb: 4 }}
                    >
                        <Box>
                            <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, fontFamily: 'Space Grotesk', color: c.textPrimary }}>
                                Projects
                            </Typography>
                            <Typography variant="body1" sx={{ color: c.textSecondary }}>
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
                                        sx={{
                                            bgcolor: !filterCreated ? GOLD : c.borderLight,
                                            color: !filterCreated ? 'black' : c.textPrimary,
                                            fontWeight: 600,
                                            '&:hover': { bgcolor: !filterCreated ? '#F0C040' : c.border }
                                        }}
                                        size="small"
                                        clickable
                                    />
                                    <Chip
                                        label="Created by Me"
                                        onClick={() => setFilterCreated(true)}
                                        sx={{
                                            bgcolor: filterCreated ? GOLD : c.borderLight,
                                            color: filterCreated ? 'black' : c.textPrimary,
                                            fontWeight: 600,
                                            '&:hover': { bgcolor: filterCreated ? '#F0C040' : c.border }
                                        }}
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
                                bgcolor: GOLD,
                                color: 'black',
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontFamily: 'Space Grotesk',
                                '&:hover': { bgcolor: '#F0C040' }
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
                                    color: c.textSecondary,
                                    fontFamily: 'Space Grotesk',
                                    '&.Mui-selected': { color: GOLD },
                                },
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                    bgcolor: GOLD,
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

                    {/* Search Bar — Explore tab only */}
                    {activeTab === 1 && (
                        <Box
                            sx={{
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                bgcolor: c.inputBg,
                                border: c.inputBorder,
                                borderRadius: 3,
                                px: 2,
                                py: 0.5,
                                maxWidth: 520,
                                transition: 'border-color 0.2s',
                                '&:focus-within': {
                                    borderColor: GOLD,
                                    boxShadow: `0 0 0 1px ${GOLD}40`,
                                },
                            }}
                        >
                            <SearchIcon sx={{ color: c.textMuted, fontSize: 22 }} />
                            <InputBase
                                placeholder="Search projects semantically — e.g. 'chat app with AI'"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                fullWidth
                                sx={{
                                    color: c.textPrimary,
                                    fontFamily: 'Space Grotesk',
                                    fontSize: '0.95rem',
                                    '& input::placeholder': {
                                        color: c.textMuted,
                                        opacity: 1,
                                    },
                                }}
                            />
                            {searching && <CircularProgress size={18} sx={{ color: GOLD }} />}
                        </Box>
                    )}

                    {/* Content */}
                    {loading ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 3 }}>
                            {[1, 2, 3].map((n) => (
                                <Skeleton key={n} variant="rectangular" height={320} sx={{ borderRadius: 4, bgcolor: c.skeletonBg }} />
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
                                    bgcolor: c.cardBg,
                                    border: c.cardBorder,
                                }}
                            >
                                <Inbox sx={{ fontSize: 48, color: c.textMuted, mb: 2 }} />
                                <Typography variant="h6" fontWeight="600" sx={{ mb: 1, color: c.textPrimary, fontFamily: 'Space Grotesk' }}>
                                    No pending requests
                                </Typography>
                                <Typography variant="body2" sx={{ color: c.textSecondary }}>
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
                                bgcolor: c.cardBg,
                                border: c.cardBorder,
                            }}
                        >
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 1, color: c.textPrimary, fontFamily: 'Space Grotesk' }}>
                                {activeTab === 0 ? 'No projects yet' : 'No projects to explore'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: c.textSecondary }}>
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
                                        bgcolor: GOLD,
                                        color: 'black',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontFamily: 'Space Grotesk',
                                        '&:hover': { bgcolor: '#F0C040' }
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
                </Box>
            </Box>

            {/* Request Detail Modal */}
            <Dialog
                open={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: c.cardBg, color: c.textPrimary, border: c.cardBorder, boxShadow: c.shadowHover } }}
            >
                {selectedRequest && (
                    <>
                        <DialogTitle sx={{ fontWeight: 700, pb: 1, fontFamily: 'Space Grotesk' }}>
                            Join Request
                        </DialogTitle>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ mt: 1 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: c.textSecondary }}>
                                        Project
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600" color={c.textPrimary}>
                                        {selectedRequest.project_title}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: c.textSecondary }}>
                                        Requested Role
                                    </Typography>
                                    <Chip label={selectedRequest.role} size="small" sx={{ bgcolor: c.goldBg, color: GOLD, fontWeight: 600 }} />
                                </Box>
                                {selectedRequest.message && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5, color: c.textSecondary }}>
                                            Message
                                        </Typography>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: c.borderLight,
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic', color: c.textSecondary }}>
                                                "{selectedRequest.message}"
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: c.textSecondary }}>
                                        Requested On
                                    </Typography>
                                    <Typography variant="body2" color={c.textSecondary}>
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
                                sx={{ textTransform: 'none', color: c.textSecondary }}
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

export default function ProjectsPage() {
    return (
        <React.Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'transparent' }}>
                <CircularProgress sx={{ color: '#D4AF37' }} />
            </Box>
        }>
            <ProjectsContent />
        </React.Suspense>
    );
}
