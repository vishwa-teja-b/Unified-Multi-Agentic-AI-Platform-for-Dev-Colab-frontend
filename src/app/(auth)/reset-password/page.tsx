'use client';

import { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    InputAdornment,
    Stack,
    IconButton
} from '@mui/material';
import { Lock, Key, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ otp: '', password: '', confirm_password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await api.post('/api/auth/reset-password', {
                otp: formData.otp,
                new_password: formData.password
            });

            setSuccess('Password reset successfully! Redirecting...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to reset password. Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    const marqueeVariants = {
        animate: {
            y: [0, -1035],
            transition: {
                y: {
                    repeat: Infinity,
                    repeatType: "loop" as const,
                    duration: 20,
                    ease: "linear" as const,
                },
            },
        },
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#111' }}>

            {/* Left Side - Form */}
            <Box
                component={motion.div}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                sx={{
                    width: { xs: '100%', md: '50%', lg: '40%' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 6,
                    bgcolor: '#000',
                    color: 'white',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <Container maxWidth="xs">
                    {/* Logo Placeholder */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 40, height: 40, bgcolor: 'white', borderRadius: 2 }} />
                        <Typography variant="h5" fontWeight="bold">DevCollab</Typography>
                    </Box>

                    <Button
                        component={Link}
                        href="/forgot-password"
                        startIcon={<ArrowBack />}
                        sx={{ mb: 3, color: 'gray', textTransform: 'none', pl: 0, '&:hover': { color: 'white', bgcolor: 'transparent' } }}
                    >
                        Back
                    </Button>

                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                        Reset Password
                    </Typography>
                    <Typography variant="body1" color="gray" sx={{ mb: 4 }}>
                        Enter the OTP sent to your email and your new password.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            name="otp"
                            placeholder="Enter OTP Code"
                            value={formData.otp}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{
                                mb: 2,
                                bgcolor: '#111',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Key sx={{ color: 'gray' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New Password"
                            value={formData.password}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{
                                mb: 2,
                                bgcolor: '#111',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'gray' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: 'gray' }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            name="confirm_password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm New Password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{
                                mb: 3,
                                bgcolor: '#111',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'gray' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {error && (
                            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}

                        {success && (
                            <Typography color="success.main" variant="body2" sx={{ mb: 2 }}>
                                {success}
                            </Typography>
                        )}

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                bgcolor: 'white',
                                color: 'black',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#ddd' }
                            }}
                        >
                            {loading ? 'Reseting...' : 'Reset Password'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6 }}>
                        <Typography variant="caption" color="gray" display="block" align="center" gutterBottom>
                            Trusted by teams at
                        </Typography>
                        <Stack direction="row" spacing={3} justifyContent="center" sx={{ opacity: 0.5 }}>
                            {/* Placeholders for logos */}
                            <Box sx={{ width: 80, height: 20, bgcolor: 'gray', borderRadius: 1 }} />
                            <Box sx={{ width: 80, height: 20, bgcolor: 'gray', borderRadius: 1 }} />
                            <Box sx={{ width: 80, height: 20, bgcolor: 'gray', borderRadius: 1 }} />
                        </Stack>
                    </Box>

                </Container>
            </Box>

            {/* Right Side - Animated Grid */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: { md: '50%', lg: '60%' },
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: '#0a0a0a'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.5) 100%)',
                        zIndex: 2,
                        pointerEvents: 'none'
                    }}
                />

                {/* Tilting the grid for dynamic effect */}
                <Box
                    sx={{
                        transform: 'rotate(-12deg) scale(1.1) translateX(50px)',
                        display: 'flex',
                        gap: 3,
                        height: '200vh'
                    }}
                >
                    {/* Column 1 - Moving Up */}
                    <motion.div
                        variants={marqueeVariants}
                        animate="animate"
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <MockAppCard key={`col1-${i}`} color={i % 2 === 0 ? '#1E88E5' : '#D32F2F'} />
                        ))}
                        {/* Duplicate for seamless loop */}
                        {[...Array(6)].map((_, i) => (
                            <MockAppCard key={`col1-dup-${i}`} color={i % 2 === 0 ? '#1E88E5' : '#D32F2F'} />
                        ))}
                    </motion.div>

                    {/* Column 2 - Moving Down (Reverse) */}
                    <motion.div
                        animate={{
                            y: [-1035, 0],
                        }}
                        transition={{
                            y: {
                                repeat: Infinity,
                                repeatType: "loop" as const,
                                duration: 25,
                                ease: "linear" as const,
                            },
                        }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '-200px' }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <MockAppCard key={`col2-${i}`} color={i % 2 === 0 ? '#7B1FA2' : '#00796B'} />
                        ))}
                        {[...Array(6)].map((_, i) => (
                            <MockAppCard key={`col2-dup-${i}`} color={i % 2 === 0 ? '#7B1FA2' : '#00796B'} />
                        ))}
                    </motion.div>

                    {/* Column 3 - Moving Up */}
                    <motion.div
                        variants={marqueeVariants}
                        animate="animate"
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <MockAppCard key={`col3-${i}`} color={i % 2 === 0 ? '#FFC107' : '#E64A19'} />
                        ))}
                        {/* Duplicate for seamless loop */}
                        {[...Array(6)].map((_, i) => (
                            <MockAppCard key={`col3-dup-${i}`} color={i % 2 === 0 ? '#FFC107' : '#E64A19'} />
                        ))}
                    </motion.div>

                </Box>
            </Box>
        </Box>
    );
}

// Simple Mock Card Component to replace images
function MockAppCard({ color }: { color: string }) {
    return (
        <Box
            sx={{
                width: 280,
                height: 500,
                bgcolor: '#222',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ width: 40, height: 10, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                <Box sx={{ width: 10, height: 10, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            </Box>

            <Box sx={{ flex: 1, p: 2 }}>
                <Box sx={{ width: '80%', height: 20, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 1 }} />
                <Box sx={{ width: '50%', height: 20, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 4 }} />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ width: '100%', height: 120, bgcolor: color, borderRadius: 2, opacity: 0.8 }} />
                    <Box sx={{ width: '45%', height: 80, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                    <Box sx={{ width: '45%', height: 80, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                </Box>
            </Box>

            <Box sx={{ height: 60, bgcolor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                {[1, 2, 3, 4].map(i => (
                    <Box key={i} sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                ))}
            </Box>
        </Box>
    )
}
