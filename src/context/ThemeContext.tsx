'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleColorMode: () => { },
});

export const useThemeContext = () => useContext(ThemeContext);

// Implementation of Emotion Cache for Next.js App Router
export default function ThemeContextprovider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>('light');

    // Load from local storage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode') as ThemeMode;
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setMode(systemPrefersDark ? 'dark' : 'light');
        }
    }, []);

    const colorMode = useMemo(
        () => ({
            mode,
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('themeMode', newMode);
                    return newMode;
                });
            },
        }),
        [mode]
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light Mode (Pearl White & Charcoal)
                            primary: { main: '#2F2F33' }, // Charcoal Stone
                            secondary: { main: '#F5F6F7' }, // Pearl White
                            background: { default: '#F5F6F7', paper: '#FFFFFF' },
                            text: { primary: '#2F2F33', secondary: 'rgba(47, 47, 51, 0.7)' },
                            divider: 'rgba(47, 47, 51, 0.12)',
                        }
                        : {
                            // Dark Mode (Charcoal Stone & Pearl White)
                            primary: { main: '#F5F6F7' },
                            secondary: { main: '#2F2F33' },
                            background: { default: '#2F2F33', paper: '#3A3A3F' }, // Charcoal Stone & slightly lighter
                            text: { primary: '#F5F6F7', secondary: 'rgba(245, 246, 247, 0.7)' },
                            divider: 'rgba(245, 246, 247, 0.1)',
                        }),
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
                    h2: { fontSize: '2.75rem', fontWeight: 600, letterSpacing: '-0.01em' },
                    h3: { fontSize: '2.25rem', fontWeight: 600 },
                    h4: { fontSize: '1.75rem', fontWeight: 500 },
                    body1: { fontSize: '1rem', lineHeight: 1.7 },
                    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
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
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0px 4px 12px rgba(47, 47, 51, 0.15)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 16,
                                boxShadow: mode === 'light' ? '0px 2px 8px rgba(47, 47, 51, 0.04)' : 'none',
                                border: mode === 'light' ? '1px solid rgba(47, 47, 51, 0.08)' : '1px solid rgba(245, 246, 247, 0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    boxShadow: mode === 'light' ? '0px 8px 24px rgba(47, 47, 51, 0.1)' : 'none',
                                    transform: 'translateY(-2px)',
                                },
                            },
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#FFFFFF' : '#3A3A3F',
                                color: mode === 'light' ? '#2F2F33' : '#F5F6F7',
                                boxShadow: '0px 1px 3px rgba(47, 47, 51, 0.06)',
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: mode === 'light' ? '#FFFFFF' : '#2F2F33',
                                    borderRadius: 8,
                                    '& fieldset': {
                                        borderColor: mode === 'light' ? 'rgba(47, 47, 51, 0.23)' : 'rgba(245, 246, 247, 0.23)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: mode === 'light' ? '#2F2F33' : '#F5F6F7',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: mode === 'light' ? '#2F2F33' : '#F5F6F7',
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
                                backgroundColor: mode === 'light' ? '#2F2F33' : '#F5F6F7',
                                color: mode === 'light' ? '#F5F6F7' : '#2F2F33',
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    // Emotion Cache Logic
    const [{ cache, flush }] = useState(() => {
        const cache = createCache({ key: 'css-global' }); // Ensure unique key
        cache.compat = true;
        const prevInsert = cache.insert;
        let inserted: string[] = [];
        cache.insert = (...args) => {
            const serialized = args[1];
            if (cache.inserted[serialized.name] === undefined) {
                inserted.push(serialized.name);
            }
            return prevInsert(...args);
        };
        const flush = () => {
            const prevInserted = inserted;
            inserted = [];
            return prevInserted;
        };
        return { cache, flush };
    });

    useServerInsertedHTML(() => {
        const names = flush();
        if (names.length === 0) {
            return null;
        }
        let styles = '';
        for (const name of names) {
            styles += cache.inserted[name];
        }
        return (
            <style
                key={Math.random()}
                data-emotion={`${cache.key} ${names.join(' ')}`}
                dangerouslySetInnerHTML={{
                    __html: styles,
                }}
            />
        );
    });

    return (
        <CacheProvider value={cache}>
            <ThemeContext.Provider value={colorMode}>
                <MuiThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}
                </MuiThemeProvider>
            </ThemeContext.Provider>
        </CacheProvider>
    );
}
