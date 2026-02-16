'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Stack,
    Chip,
    Button,
    Tabs,
    Tab,
    Avatar,
    CircularProgress,
    Alert,
    Snackbar,
    IconButton,
    Divider,
    Paper,
} from '@mui/material';
import {
    ArrowBack,
    Mail,
    PersonAdd,
    Check,
    Close,
    AccessTime,
    Folder,
    Inbox,
    History,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { projectApi, InvitationResponse } from '@/utils/projectApi';
import { TopBar } from '@/components/shared/TopBar';
import { DistortedBackground } from '@/components/shared/DistortedBackground';

const MotionBox = motion(Box);
const GOLD = '#D4AF37';

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
}

function getStatusChip(status: string) {
    const map: Record<string, { color: string; bg: string }> = {
        PENDING: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
        ACCEPTED: { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
        REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    };
    const s = map[status] || map.PENDING;
    return (
        <Chip
            label={status}
            size="small"
            sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.7rem', borderRadius: '6px' }}
        />
    );
}

export default function InvitationsPage() {
    const router = useRouter();
    const [tab, setTab] = useState(0);
    const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
    const [joinRequests, setJoinRequests] = useState<InvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [invResp, joinResp] = await Promise.all([
                projectApi.getMyInvitations(),
                projectApi.getJoinRequests(),
            ]);
            setInvitations(invResp);
            setJoinRequests(joinResp);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleInvitationResponse = async (invitationId: string, status: string) => {
        setActionLoading(invitationId);
        try {
            await projectApi.updateInvitation({ invitation_id: invitationId, status });
            setSnackbar({ open: true, message: `Invitation ${status.toLowerCase()}!`, severity: 'success' });
            // Update local state
            setInvitations(prev => prev.map(inv =>
                inv.id === invitationId ? { ...inv, status: status.toUpperCase() } : inv
            ));
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.detail || 'Action failed', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleJoinRequestResponse = async (invitationId: string, status: string) => {
        setActionLoading(invitationId);
        try {
            await projectApi.respondJoinRequest({ invitation_id: invitationId, status });
            setSnackbar({ open: true, message: `Request ${status.toLowerCase()}!`, severity: 'success' });
            setJoinRequests(prev => prev.map(req =>
                req.id === invitationId ? { ...req, status: status.toUpperCase() } : req
            ));
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.detail || 'Action failed', severity: 'error' });
        } finally {
            setActionLoading(null);
        }
    };

    const pendingInvitations = invitations.filter(i => i.status === 'PENDING');
    const pastInvitations = invitations.filter(i => i.status !== 'PENDING');
    const pendingJoinRequests = joinRequests.filter(j => j.status === 'PENDING');
    const pastJoinRequests = joinRequests.filter(j => j.status !== 'PENDING');

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#050505',
            color: 'white',
            overflowX: 'hidden',
            position: 'relative',
        }}>
            <DistortedBackground />
            <TopBar />

            <Box sx={{ pt: '120px', pb: 8, position: 'relative', zIndex: 10 }}>
                <Container maxWidth="lg">
                    {/* Header */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, fontFamily: 'Space Grotesk', color: 'white' }}>
                            Invitations & Requests
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Manage your project invitations and review join requests.
                        </Typography>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{
                            mb: 4,
                            '& .MuiTab-root': {
                                color: 'rgba(255,255,255,0.5)',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                fontFamily: 'Space Grotesk',
                                '&.Mui-selected': { color: GOLD },
                            },
                            '& .MuiTabs-indicator': { bgcolor: GOLD, height: 3, borderRadius: '3px 3px 0 0' },
                        }}
                    >
                        <Tab
                            icon={<Mail sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <span>Received Invitations</span>
                                    {pendingInvitations.length > 0 && (
                                        <Chip label={pendingInvitations.length} size="small"
                                            sx={{ bgcolor: '#fbbf24', color: 'black', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                                    )}
                                </Stack>
                            }
                        />
                        <Tab
                            icon={<PersonAdd sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <span>Join Requests</span>
                                    {pendingJoinRequests.length > 0 && (
                                        <Chip label={pendingJoinRequests.length} size="small"
                                            sx={{ bgcolor: '#60a5fa', color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                                    )}
                                </Stack>
                            }
                        />
                    </Tabs>

                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: GOLD }} />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchData}>Retry</Button>}
                            sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                            {error}
                        </Alert>
                    ) : (
                        <>
                            {/* Tab 0: Received Invitations */}
                            {tab === 0 && (
                                <AnimatePresence>
                                    {invitations.length === 0 ? (
                                        <EmptyState icon={<Mail />} title="No invitations yet" subtitle="When someone invites you to their project, it'll show up here." />
                                    ) : (
                                        <Stack spacing={3}>
                                            {pendingInvitations.length > 0 && (
                                                <SectionLabel label="Pending" count={pendingInvitations.length} color="#fbbf24" />
                                            )}
                                            {pendingInvitations.map((inv, i) => (
                                                <InvitationCard
                                                    key={inv.id}
                                                    item={inv}
                                                    index={i}
                                                    type="invitation"
                                                    actionLoading={actionLoading}
                                                    onAccept={() => handleInvitationResponse(inv.id, 'ACCEPTED')}
                                                    onReject={() => handleInvitationResponse(inv.id, 'REJECTED')}
                                                />
                                            ))}
                                            {pastInvitations.length > 0 && (
                                                <>
                                                    <SectionLabel label="Past" count={pastInvitations.length} color="rgba(255,255,255,0.4)" />
                                                    {pastInvitations.map((inv, i) => (
                                                        <InvitationCard key={inv.id} item={inv} index={i} type="invitation" actionLoading={actionLoading} />
                                                    ))}
                                                </>
                                            )}
                                        </Stack>
                                    )}
                                </AnimatePresence>
                            )}

                            {/* Tab 1: Join Requests (as project owner) */}
                            {tab === 1 && (
                                <AnimatePresence>
                                    {joinRequests.length === 0 ? (
                                        <EmptyState icon={<PersonAdd />} title="No join requests" subtitle="When someone requests to join your project, it'll appear here." />
                                    ) : (
                                        <Stack spacing={3}>
                                            {pendingJoinRequests.length > 0 && (
                                                <SectionLabel label="Pending Review" count={pendingJoinRequests.length} color="#60a5fa" />
                                            )}
                                            {pendingJoinRequests.map((req, i) => (
                                                <InvitationCard
                                                    key={req.id}
                                                    item={req}
                                                    index={i}
                                                    type="join_request"
                                                    actionLoading={actionLoading}
                                                    onAccept={() => handleJoinRequestResponse(req.id, 'ACCEPTED')}
                                                    onReject={() => handleJoinRequestResponse(req.id, 'REJECTED')}
                                                />
                                            ))}
                                            {pastJoinRequests.length > 0 && (
                                                <>
                                                    <SectionLabel label="Past" count={pastJoinRequests.length} color="rgba(255,255,255,0.4)" />
                                                    {pastJoinRequests.map((req, i) => (
                                                        <InvitationCard key={req.id} item={req} index={i} type="join_request" actionLoading={actionLoading} />
                                                    ))}
                                                </>
                                            )}
                                        </Stack>
                                    )}
                                </AnimatePresence>
                            )}
                        </>
                    )}
                </Container>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                        sx={{ borderRadius: 2 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}

// ---- Sub-components ----

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                textAlign: 'center',
                py: 10,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
            }}
        >
            <Box sx={{ color: 'rgba(255,255,255,0.1)', mb: 2, '& .MuiSvgIcon-root': { fontSize: 56 } }}>{icon}</Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 0.5, fontFamily: 'Space Grotesk' }}>{title}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</Typography>
        </MotionBox>
    );
}

function SectionLabel({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="700" sx={{ color, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Space Grotesk' }}>
                {label}
            </Typography>
            <Chip label={count} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
        </Stack>
    );
}

interface InvitationCardProps {
    item: InvitationResponse;
    index: number;
    type: 'invitation' | 'join_request';
    actionLoading: string | null;
    onAccept?: () => void;
    onReject?: () => void;
}

function InvitationCard({ item, index, type, actionLoading, onAccept, onReject }: InvitationCardProps) {
    const isPending = item.status === 'PENDING';
    const isLoading = actionLoading === item.id;

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: index * 0.05 }}
            sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                p: 3,
                opacity: isPending ? 1 : 0.6,
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: GOLD,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    boxShadow: `0 0 20px rgba(212, 175, 55, 0.1)`,
                },
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                    <Avatar sx={{
                        width: 48, height: 48,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        color: type === 'invitation' ? '#a855f7' : '#60a5fa',
                        fontSize: '1.1rem', fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {type === 'invitation' ? <Mail /> : <PersonAdd />}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ color: 'white', fontFamily: 'Space Grotesk' }}>
                                {item.project_title || 'Untitled Project'}
                            </Typography>
                            {getStatusChip(item.status)}
                        </Stack>

                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>
                            {type === 'invitation'
                                ? <>Role: <strong style={{ color: 'white' }}>{item.role}</strong></>
                                : <>Requesting as <strong style={{ color: 'white' }}>{item.role}</strong> • User #{item.sender_id}</>
                            }
                        </Typography>

                        {item.message && (
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', mt: 0.5 }}>
                                &quot;{item.message}&quot;
                            </Typography>
                        )}

                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                            <AccessTime sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                                {timeAgo(item.created_at)}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                {isPending && onAccept && onReject && (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <Check />}
                            disabled={isLoading}
                            onClick={onAccept}
                            disableElevation
                            sx={{
                                bgcolor: '#16a34a',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '8px',
                                '&:hover': { bgcolor: '#15803d' },
                            }}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Close />}
                            disabled={isLoading}
                            onClick={onReject}
                            sx={{
                                borderColor: 'rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.7)',
                                textTransform: 'none',
                                borderRadius: '8px',
                                '&:hover': { borderColor: '#ef4444', color: '#ef4444' },
                            }}
                        >
                            Decline
                        </Button>
                    </Stack>
                )}
            </Stack>
        </MotionBox>
    );
}
