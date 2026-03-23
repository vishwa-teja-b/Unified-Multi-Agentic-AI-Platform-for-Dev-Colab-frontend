'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider as MuiDivider,
} from '@mui/material';
import {
    Add,
    Person,
    Logout,
    LightMode,
    DarkMode,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useThemeContext, useThemeColors } from '@/context/ThemeContext';

const TOPBAR_HEIGHT = 50;

export const TopBar = () => {
    const router = useRouter();
    // Removed toggleColorMode
    const c = useThemeColors();
    const GOLD = c.gold;
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const [animate, setAnimate] = useState(false);
    const hasChecked = useRef(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const handleLogout = () => {
        setMenuAnchor(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('token');
        sessionStorage.clear();
        router.push('/login');
    };

    const navItems = [
        { label: 'Projects', path: '/projects' },
        { label: 'Teams', path: '/teams' },
        { label: 'Sessions', path: '/sessions' },
        { label: 'Invitations', path: '/invitations' },
        { label: 'Search', path: '/projects?tab=explore' },
    ];

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const hasPlayed = sessionStorage.getItem('topbar_anim_done');
        if (!hasPlayed) {
            setAnimate(true);
            sessionStorage.setItem('topbar_anim_done', 'true');
        }
    }, []);

    // Shared bar style tokens
    const barBg = 'linear-gradient(135deg, rgba(20, 15, 10, 0.8) 0%, rgba(212, 175, 55, 0.15) 100%)';
    const barBorder = '1px solid rgba(212, 175, 55, 0.12)';
    const barShadow = '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(212, 175, 55, 0.05)';
    const navColor = 'rgba(255,255,255,0.7)';
    const btnBg = 'rgba(255,255,255,0.05)';
    const btnBorder = '1px solid rgba(255,255,255,0.1)';
    const btnColor = c.textPrimary;
    const menuBg = '#1a1a1a';
    const menuBorder = '1px solid rgba(255,255,255,0.1)';
    const menuItemColor = 'rgba(255,255,255,0.8)';
    const menuItemHover = 'rgba(255,255,255,0.06)';
    const menuIconColor = 'rgba(255,255,255,0.5)';
    const menuDivider = 'rgba(255,255,255,0.08)';

    // ── NO ANIMATION: render static bar immediately ──
    if (!animate) {
        return (
            <Box sx={{
                position: 'fixed', top: 36, left: '50%', transform: 'translateX(-50%)',
                width: { xs: '95%', sm: '85%', md: '80%', lg: '65%' }, maxWidth: '1200px',
                height: TOPBAR_HEIGHT, zIndex: 100, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', px: { xs: 2, md: 3, lg: 5 },
                background: barBg,
                backdropFilter: 'blur(24px)',
                borderRadius: '50px', border: barBorder,
                boxShadow: barShadow,
                transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
            }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ cursor: 'pointer', minWidth: 'fit-content' }} onClick={() => router.push('/dashboard')}>
                    <Box sx={{ width: 10, height: 10, bgcolor: GOLD, borderRadius: '50%', boxShadow: `0 0 10px ${GOLD}` }} />
                    <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 800, color: c.textPrimary, letterSpacing: '-0.02em', display: { xs: 'none', sm: 'block' }, whiteSpace: 'nowrap' }}>DEV COLAB</Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 800, color: c.textPrimary, letterSpacing: '-0.02em', display: { xs: 'block', sm: 'none' } }}>DC</Typography>
                </Stack>
                <Stack direction="row" spacing={{ xs: 2, md: 3, lg: 4 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
                    {navItems.map((item: any) => {
                        const isHovered = hoveredPath === item.path;
                        return (
                            <Box key={item.path}
                                onMouseEnter={() => setHoveredPath(item.path)}
                                onMouseLeave={() => setHoveredPath(null)}
                                onClick={() => router.push(item.path)}
                                sx={{ position: 'relative', cursor: 'pointer', py: 1 }}
                            >
                                <Typography variant="body2" sx={{
                                    fontFamily: 'Space Grotesk', fontWeight: 600,
                                    color: isHovered ? GOLD : navColor,
                                    textShadow: isHovered ? `0 0 15px ${GOLD}` : 'none',
                                    transition: 'all 0.3s ease', letterSpacing: '0.05em',
                                    textTransform: 'uppercase', fontSize: { xs: '0.75rem', md: '0.85rem' }, whiteSpace: 'nowrap',
                                }}>{item.label}</Typography>
                                {isHovered && (
                                    <motion.div layoutId="nav-underline" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: GOLD, boxShadow: `0 0 10px ${GOLD}` }} />
                                )}
                            </Box>
                        );
                    })}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 'fit-content' }}>
                    <Button onClick={() => router.push('/projects/create')} startIcon={<Add />}
                        sx={{
                            bgcolor: btnBg, color: btnColor, borderRadius: '50px',
                            px: { xs: 2, md: 3 }, py: 0.8, minWidth: 'auto', fontFamily: 'Space Grotesk',
                            fontWeight: 600, fontSize: '0.85rem', border: btnBorder,
                            transition: 'all 0.3s', whiteSpace: 'nowrap',
                            '&:hover': { bgcolor: GOLD, color: 'black', borderColor: GOLD },
                        }}>
                        <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' } }}>New Project</Box>
                        <Box component="span" sx={{ display: { xs: 'inline', lg: 'none' } }}>New</Box>
                    </Button>
                    <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget)} sx={{ color: btnColor, '&:hover': { color: GOLD } }}>
                        <Person />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{
                            sx: {
                                bgcolor: menuBg, border: menuBorder,
                                borderRadius: 2, mt: 1, minWidth: 160,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            }
                        }}
                    >
                        <MenuItem onClick={() => { setMenuAnchor(null); router.push('/profile'); }}
                            sx={{ color: menuItemColor, '&:hover': { bgcolor: menuItemHover } }}>
                            <ListItemIcon><Person sx={{ color: menuIconColor }} /></ListItemIcon>
                            <ListItemText>Profile</ListItemText>
                        </MenuItem>
                        <MuiDivider sx={{ borderColor: menuDivider }} />
                        <MenuItem onClick={handleLogout}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                            <ListItemIcon><Logout sx={{ color: '#ef4444' }} /></ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </Stack>
            </Box>
        );
    }

    // ── WITH ANIMATION ──
    return (
        <Box sx={{
            position: 'fixed',
            top: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '95%', sm: '85%', md: '80%', lg: '65%' },
            maxWidth: '1200px',
            height: TOPBAR_HEIGHT,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
        }}>
            {/* 1) Golden dot — appears first, fades when bar starts */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1.5, 1, 1, 0],
                    opacity: [0, 1, 1, 1, 0],
                }}
                transition={{
                    duration: 1.5,
                    times: [0, 0.2, 0.3, 0.7, 1.0],
                    ease: 'easeInOut',
                }}
                style={{
                    position: 'absolute',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: GOLD,
                    boxShadow: `0 0 25px ${GOLD}, 0 0 50px ${GOLD}60`,
                    zIndex: 120,
                }}
            />

            {/* 2) Bar — expands from center after dot */}
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{
                    scaleX: { delay: 1.0, duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                    opacity: { delay: 1.0, duration: 0.3 },
                }}
                onAnimationComplete={() => {
                    const el = document.getElementById('topbar-wrapper');
                    if (el) el.style.pointerEvents = 'auto';
                }}
                style={{
                    width: '100%',
                    height: TOPBAR_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: barBg,
                    backdropFilter: 'blur(24px)',
                    borderRadius: '50px',
                    border: barBorder,
                    boxShadow: barShadow,
                    transformOrigin: 'center center',
                    overflow: 'hidden',
                }}
                id="topbar-wrapper"
            >
                {/* 3) Content — fades in after bar expansion */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2, duration: 0.8, ease: 'easeOut' }}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 20px',
                    }}
                >
                    {/* Logo */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ cursor: 'pointer', minWidth: 'fit-content' }} onClick={() => router.push('/dashboard')}>
                        <Box
                            sx={{
                                width: 10, height: 10,
                                bgcolor: GOLD, borderRadius: '50%',
                                boxShadow: `0 0 10px ${GOLD}`,
                            }}
                        />
                        <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 800, color: c.textPrimary, letterSpacing: '-0.02em', display: { xs: 'none', sm: 'block' }, whiteSpace: 'nowrap' }}>
                            DEV COLAB
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk', fontWeight: 800, color: c.textPrimary, letterSpacing: '-0.02em', display: { xs: 'block', sm: 'none' } }}>
                            DC
                        </Typography>
                    </Stack>

                    {/* Nav Links — staggered fade in */}
                    <Stack direction="row" spacing={{ xs: 2, md: 3, lg: 4 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
                        {navItems.map((item, i) => {
                            const isHovered = hoveredPath === item.path;
                            return (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2.3 + i * 0.1, duration: 0.5 }}
                                >
                                    <Box
                                        onMouseEnter={() => setHoveredPath(item.path)}
                                        onMouseLeave={() => setHoveredPath(null)}
                                        onClick={() => router.push(item.path)}
                                        sx={{ position: 'relative', cursor: 'pointer', py: 1 }}
                                    >
                                        <Typography variant="body2" sx={{
                                            fontFamily: 'Space Grotesk', fontWeight: 600,
                                            color: isHovered ? GOLD : navColor,
                                            textShadow: isHovered ? `0 0 15px ${GOLD}` : 'none',
                                            transition: 'all 0.3s ease',
                                            letterSpacing: '0.05em', textTransform: 'uppercase',
                                            fontSize: { xs: '0.75rem', md: '0.85rem' }, whiteSpace: 'nowrap',
                                        }}>
                                            {item.label}
                                        </Typography>
                                        {isHovered && (
                                            <motion.div
                                                layoutId="nav-underline"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                style={{
                                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                                    height: '2px', backgroundColor: GOLD,
                                                    boxShadow: `0 0 10px ${GOLD}`,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </motion.div>
                            );
                        })}
                    </Stack>

                    {/* Right Actions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.8, duration: 0.5 }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 'fit-content' }}>
                            <Button
                                onClick={() => router.push('/projects/create')}
                                startIcon={<Add />}
                                sx={{
                                    bgcolor: btnBg, color: btnColor,
                                    borderRadius: '50px', px: { xs: 2, md: 3 }, py: 0.8,
                                    minWidth: 'auto', fontFamily: 'Space Grotesk',
                                    fontWeight: 600, fontSize: '0.85rem',
                                    border: btnBorder,
                                    transition: 'all 0.3s', whiteSpace: 'nowrap',
                                    '&:hover': { bgcolor: GOLD, color: 'black', borderColor: GOLD },
                                }}
                            >
                                <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' } }}>New Project</Box>
                                <Box component="span" sx={{ display: { xs: 'inline', lg: 'none' } }}>New</Box>
                            </Button>
                            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: btnColor, '&:hover': { color: GOLD } }}>
                                <Person />
                            </IconButton>
                            <Menu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={() => setMenuAnchor(null)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                PaperProps={{
                                    sx: {
                                        bgcolor: menuBg, border: menuBorder,
                                        borderRadius: 2, mt: 1, minWidth: 160,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                    }
                                }}
                            >
                                <MenuItem onClick={() => { setMenuAnchor(null); router.push('/profile'); }}
                                    sx={{ color: menuItemColor, '&:hover': { bgcolor: menuItemHover } }}>
                                    <ListItemIcon><Person sx={{ color: menuIconColor }} /></ListItemIcon>
                                    <ListItemText>Profile</ListItemText>
                                </MenuItem>
                                <MuiDivider sx={{ borderColor: menuDivider }} />
                                <MenuItem onClick={handleLogout}
                                    sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                                    <ListItemIcon><Logout sx={{ color: '#ef4444' }} /></ListItemIcon>
                                    <ListItemText>Logout</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Stack>
                    </motion.div>
                </motion.div>
            </motion.div>
        </Box>
    );
};
