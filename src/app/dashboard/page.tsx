'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    CircularProgress,
    Avatar,
} from '@mui/material';
import {
    ArrowForward,
    Lens,
    Mail,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { projectApi, InvitationResponse } from '@/utils/projectApi';
import { profileApi } from '@/utils/profileApi';
import { TopBar } from '@/components/shared/TopBar';
import { DistortedBackground } from '@/components/shared/DistortedBackground';
import { useThemeColors } from '@/context/ThemeContext';

// ============ COMPONENTS ============

const HeroSection = () => {
    const c = useThemeColors();
    return (
        <Box sx={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
            pl: { xs: 4, md: 8, lg: 12 },
            pr: { xs: 3, md: 6 },
            mt: 4, // Add spacing for TopBar
        }}>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
                <Typography variant="h1" sx={{
                    fontFamily: 'Space Grotesk',
                    fontWeight: 900,
                    fontSize: { xs: '3rem', md: '6rem', lg: '8rem' },
                    lineHeight: 0.9,
                    letterSpacing: '-0.03em',
                    color: c.textPrimary,
                    whiteSpace: 'nowrap',
                    overflow: 'visible'
                }}>
                    The Perfect <br />
                    Workflow
                    <Box component="span" sx={{
                        display: 'inline-block',
                        width: { xs: 15, md: 25 },
                        height: { xs: 15, md: 25 },
                        bgcolor: c.gold,
                        borderRadius: '50%',
                        ml: 2,
                        mb: { xs: 1, md: 3 },
                        boxShadow: `0 0 30px ${c.gold}`
                    }} />
                </Typography>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
            >
                <Typography variant="h6" sx={{
                    fontFamily: 'Space Grotesk',
                    fontWeight: 400,
                    color: c.textSecondary,
                    mt: 4,
                    maxWidth: '600px',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    lineHeight: 1.5,
                }}>
                    Orchestrate your development lifecycle.<br />
                    Dashboard systems operational.
                </Typography>
            </motion.div>
        </Box>
    );
};

// ============ DATA COMPONENTS ============

const InviteRow = ({ invite, index }: { invite: any, index: number }) => {
    const c = useThemeColors();
    const router = useRouter();
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Box sx={{
                border: c.cardBorder,
                bgcolor: c.cardBg,
                p: 3,
                borderRadius: '4px',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: c.goldBg, color: c.gold }}><Mail /></Avatar>
                    <Box>
                        <Typography variant="subtitle1" sx={{ color: c.textPrimary, fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                            {invite.project_title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: c.textSecondary }}>
                            Role: {invite.role}
                        </Typography>
                    </Box>
                </Stack>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push('/invitations')}
                    sx={{ color: c.gold, borderColor: c.gold, fontFamily: 'Space Grotesk', '&:hover': { bgcolor: c.goldBg } }}
                >
                    Review
                </Button>
            </Box>
        </motion.div>
    );
};

const ProjectRow = ({ project, index }: { project: any, index: number }) => {
    const router = useRouter();
    const c = useThemeColors();
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
        >
            <Box
                onClick={() => router.push(`/projects/${project.id}`)}
                sx={{
                    borderTop: `1px solid ${c.divider}`,
                    py: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                        bgcolor: c.surfaceHover,
                        pl: 2
                    }
                }}
            >
                <Box>
                    <Typography variant="caption" sx={{ color: c.gold, fontFamily: 'Space Grotesk', mb: 1, display: 'block' }}>
                        0{index + 1} / {project.status?.toUpperCase() || 'ACTIVE'}
                    </Typography>
                    <Typography variant="h4" sx={{
                        fontFamily: 'Space Grotesk',
                        fontWeight: 600,
                        color: c.textPrimary,
                        fontSize: { xs: '1.5rem', md: '2.5rem' }
                    }}>
                        {project.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: c.textMuted, mt: 1, maxWidth: '500px' }}>
                        {project.description}
                    </Typography>
                </Box>
                <ArrowForward sx={{ color: c.textMuted, fontSize: 40, transform: 'rotate(-45deg)', transition: '0.3s', '.MuiBox-root:hover &': { color: c.gold, transform: 'rotate(0deg)' } }} />
            </Box>
        </motion.div>
    );
};

const DashboardContent = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [invites, setInvites] = useState<InvitationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const c = useThemeColors();

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if profile is complete — redirect if not
                const profile = await profileApi.getProfile();
                if (!profile || !profile.primary_skills?.length || !profile.experience_level) {
                    router.push('/profile/create');
                    return;
                }

                const projectsData = await projectApi.getMyProjects();
                setProjects(projectsData.slice(0, 3));

                const invitesData = await projectApi.getMyInvitations();
                const pendingInvites = invitesData.filter((i: any) => i.status === 'PENDING').slice(0, 3);
                setInvites(pendingInvites);

            } catch (error) {
                console.error("Dashboard data fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    return (
        <Box sx={{ pl: { xs: 4, md: 8, lg: 12 }, pr: { xs: 3, md: 6 }, pb: 10, position: 'relative', zIndex: 10 }}>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 8 }}>
                {/* Recent Projects Column */}
                <Box sx={{ flex: 2, width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                        <Lens sx={{ fontSize: 12, color: c.gold }} />
                        <Typography variant="overline" sx={{ color: c.textPrimary, letterSpacing: '0.2em', fontSize: '1rem', fontFamily: 'Space Grotesk' }}>
                            RECENT PROJECTS
                        </Typography>
                    </Stack>

                    <Box>
                        {loading ? (
                            <CircularProgress sx={{ color: c.gold }} />
                        ) : projects.length > 0 ? (
                            projects.map((p, i) => <ProjectRow key={p.id} project={p} index={i} />)
                        ) : (
                            <Typography variant="h5" sx={{ color: c.textMuted, fontFamily: 'Space Grotesk' }}>
                                No recent projects. Start one now.
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Recent Invites / Quick Stats Column */}
                <Box sx={{ flex: 1, width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                        <Lens sx={{ fontSize: 12, color: c.gold }} />
                        <Typography variant="overline" sx={{ color: c.textPrimary, letterSpacing: '0.2em', fontSize: '1rem', fontFamily: 'Space Grotesk' }}>
                            MISSION INVITES
                        </Typography>
                    </Stack>

                    <Box>
                        {loading ? (
                            <CircularProgress sx={{ color: c.gold }} />
                        ) : invites.length > 0 ? (
                            invites.map((inv, i) => <InviteRow key={inv.id} invite={inv} index={i} />)
                        ) : (
                            <Box sx={{ border: `1px dashed ${c.divider}`, p: 4, borderRadius: 2 }}>
                                <Typography variant="body1" sx={{ color: c.textMuted, fontFamily: 'Space Grotesk' }}>
                                    No pending invitations.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Compact Stats */}
                    <Box sx={{ mt: 8 }}>
                        <Typography variant="h4" sx={{ fontFamily: 'Space Grotesk', color: c.gold, fontWeight: 700 }}>
                            {projects.length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: c.textSecondary, textTransform: 'uppercase' }}>
                            Active Deployments
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Bottom Footer Area */}
            <Box sx={{ mt: 15, borderTop: `1px solid ${c.divider}`, pt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: c.textMuted }}>
                    © 2026 devcollab inc.
                </Typography>
                <Typography variant="caption" sx={{ color: c.textMuted }}>
                    SYSTEM OPERATIONAL
                </Typography>
            </Box>
        </Box>
    );
};

export default function DashboardPage() {
    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'transparent',
            color: 'inherit',
            overflowX: 'hidden',
            position: 'relative',
        }}>
            {/* Static Background */}
            <DistortedBackground />

            <TopBar />

            {/* Content Wrapper */}
            <Box
                style={{
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    paddingTop: '40px'
                }}
            >
                <HeroSection />
                <DashboardContent />
            </Box>
        </Box>
    );
}
