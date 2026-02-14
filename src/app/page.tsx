'use client';

import { Box, Button, Container, Typography, Stack, IconButton, CircularProgress } from '@mui/material';
import { Groups, AutoFixHigh, Bolt, ArrowForward, Brightness4, Brightness7 } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useThemeContext } from '@/context/ThemeContext';
import { useTheme } from '@mui/material/styles';

// --- Minimal Landing Page ---

function NavBar() {
  const { mode, toggleColorMode } = useThemeContext();
  const theme = useTheme();

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
        bgcolor: mode === 'light' ? 'rgba(245, 246, 247, 0.8)' : 'rgba(47, 47, 51, 0.8)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg" sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
          DevCollab
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={toggleColorMode} size="small" sx={{ color: 'text.secondary' }}>
            {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </IconButton>
          <Button
            component={Link}
            href="/login"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': { color: 'text.primary', bgcolor: 'transparent' }
            }}
          >
            Log in
          </Button>
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            disableElevation
            sx={{
              bgcolor: 'text.primary',
              color: 'background.default',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',

              px: 2.5,
              '&:hover': {
                bgcolor: 'text.secondary',
              }
            }}
          >
            Get Started
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

function HeroSection() {
  const { mode } = useThemeContext();
  const theme = useTheme();

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pt: 8,
      pb: 12,
    }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'text.primary',
              mb: 3,
            }}
          >
            Find your team.
            <br />
            <Box
              component="span"
              sx={{
                color: 'text.primary',
              }}
            >
              Build together.
            </Box>
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 480,
              mx: 'auto',
              mb: 5,
              lineHeight: 1.6,
            }}
          >
            AI-powered platform that matches developers with the perfect teammates and generates project roadmaps.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            size="large"
            disableElevation
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: 'text.primary',
              color: 'background.default',
              fontWeight: 600,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              px: 4,
              py: 1.5,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                bgcolor: 'text.primary',
                opacity: 0.9,
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              }
            }}
          >
            Start Building
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
}

const features = [
  {
    icon: <Groups sx={{ fontSize: 28 }} />,
    title: 'Smart Matching',
    description: 'AI analyzes skills and availability to find your ideal teammates.',
  },
  {
    icon: <AutoFixHigh sx={{ fontSize: 28 }} />,
    title: 'AI Planning',
    description: 'Turn ideas into actionable roadmaps with sprints and tasks.',
  },
  {
    icon: <Bolt sx={{ fontSize: 28 }} />,
    title: 'Real-time Collab',
    description: 'Code together, chat, and whiteboard in unified workspaces.',
  },
];

function FeaturesSection() {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '-0.02em',
              color: 'text.primary',
              mb: { xs: 6, md: 10 },
            }}
          >
            Everything you need to ship
          </Typography>
        </motion.div>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="center"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ flex: 1 }}
            >
              <Box
                sx={{
                  p: 4,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  transition: 'box-shadow 0.3s, transform 0.3s',
                  '&:hover': {
                    boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.primary',
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

function CTASection() {
  const { mode } = useThemeContext();

  return (
    <Box sx={{ py: { xs: 12, md: 20 } }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              mb: 2,
            }}
          >
            Ready to build something great?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            Join developers who are finding teams and shipping projects faster.
          </Typography>
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            size="large"
            disableElevation
            sx={{
              bgcolor: 'text.primary',
              color: 'background.default',
              fontWeight: 600,
              borderRadius: 3,
              textTransform: 'none',
              px: 5,
              py: 1.5,
              '&:hover': {
                bgcolor: 'text.primary',
                opacity: 0.9,
              }
            }}
          >
            Get Started Free
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box sx={{ py: 6, borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © 2026 DevCollab. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography
              component={Link}
              href="#"
              variant="body2"
              color="text.secondary"
              sx={{ '&:hover': { color: 'text.primary' } }}
            >
              Privacy
            </Typography>
            <Typography
              component={Link}
              href="#"
              variant="body2"
              color="text.secondary"
              sx={{ '&:hover': { color: 'text.primary' } }}
            >
              Terms
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check for token on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Fallback: If for some reason redirect is slow, we render the landing page, 
  // but practically users won't see this often as checking is fast.
  // Or if we want to completely disable landing page view:
  return null;

  /* 
  // Original Landing Page Content (Commented out as per user request to redirect to login if not authenticated)
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </Box>
  );
  */
}
