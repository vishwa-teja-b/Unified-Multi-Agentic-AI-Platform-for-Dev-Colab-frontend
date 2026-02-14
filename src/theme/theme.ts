import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2F2F33',
            light: '#4A4A4F',
            dark: '#1F1F22',
            contrastText: '#F5F6F7',
        },
        secondary: {
            main: '#F5F6F7',
            light: '#FFFFFF',
            dark: '#E5E6E7',
            contrastText: '#2F2F33',
        },
        background: {
            default: '#F5F6F7',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#2F2F33',
            secondary: 'rgba(47, 47, 51, 0.7)',
            disabled: 'rgba(47, 47, 51, 0.38)',
        },
        divider: 'rgba(47, 47, 51, 0.12)',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '3.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#2F2F33',
        },
        h2: {
            fontSize: '2.75rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#2F2F33',
        },
        h3: {
            fontSize: '2.25rem',
            fontWeight: 600,
            color: '#2F2F33',
        },
        h4: {
            fontSize: '1.75rem',
            fontWeight: 500,
            color: '#2F2F33',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.7,
            color: '#2F2F33',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: 'rgba(47, 47, 51, 0.7)',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0px 2px 8px rgba(47, 47, 51, 0.04)',
        '0px 4px 12px rgba(47, 47, 51, 0.06)',
        '0px 6px 16px rgba(47, 47, 51, 0.08)',
        '0px 8px 24px rgba(47, 47, 51, 0.1)',
        '0px 12px 32px rgba(47, 47, 51, 0.12)',
        'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'
        // Filled remaining shadows with 'none' as placeholders since full 25 shadow array is required if overriding
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: '0.9375rem',
                },
                contained: {
                    backgroundColor: '#2F2F33',
                    color: '#F5F6F7',
                    boxShadow: 'none',
                    '&:hover': {
                        backgroundColor: '#1F1F22',
                        boxShadow: '0px 4px 12px rgba(47, 47, 51, 0.15)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(47, 47, 51, 0.23)',
                    color: '#2F2F33',
                    '&:hover': {
                        borderColor: '#2F2F33',
                        backgroundColor: 'rgba(47, 47, 51, 0.04)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    boxShadow: '0px 2px 8px rgba(47, 47, 51, 0.04)',
                    border: '1px solid rgba(47, 47, 51, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0px 8px 24px rgba(47, 47, 51, 0.1)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    color: '#2F2F33',
                    boxShadow: '0px 1px 3px rgba(47, 47, 51, 0.06)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        '& fieldset': {
                            borderColor: 'rgba(47, 47, 51, 0.23)',
                        },
                        '&:hover fieldset': {
                            borderColor: '#2F2F33',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#2F2F33',
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                },
                filled: {
                    backgroundColor: '#2F2F33',
                    color: '#F5F6F7',
                },
                outlined: {
                    borderColor: 'rgba(47, 47, 51, 0.23)',
                    color: '#2F2F33',
                },
            },
        },
    },
});

export default theme;
