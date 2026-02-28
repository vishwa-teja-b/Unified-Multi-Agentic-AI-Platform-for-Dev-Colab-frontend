'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';

type ThemeMode = 'light' | 'dark';

// ── Semantic Color Tokens ──────────────────────────────────────────────────────
export interface ThemeColors {
    mode: ThemeMode;
    // Backgrounds
    bg: string;
    surface: string;
    surfaceHover: string;
    glassBg: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    // Accent
    gold: string;
    goldMuted: string;
    goldBorder: string;
    goldBg: string;
    // Borders & Dividers
    divider: string;
    border: string;
    borderLight: string;
    // Cards
    cardBg: string;
    cardBorder: string;
    cardHoverBorder: string;
    // Inputs
    inputBg: string;
    inputBorder: string;
    inputFocusBorder: string;
    // Shadows
    shadow: string;
    shadowHover: string;
    // Misc
    overlay: string;
    skeletonBg: string;
}

const DARK_COLORS: ThemeColors = {
    mode: 'dark',
    bg: '#050505',
    surface: 'rgba(255,255,255,0.03)',
    surfaceHover: 'rgba(255,255,255,0.05)',
    glassBg: 'rgba(0,0,0,0.6)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.5)',
    textMuted: 'rgba(255,255,255,0.3)',
    gold: '#D4AF37',
    goldMuted: 'rgba(212,175,55,0.15)',
    goldBorder: 'rgba(212,175,55,0.3)',
    goldBg: 'rgba(212,175,55,0.08)',
    divider: 'rgba(255,255,255,0.1)',
    border: 'rgba(255,255,255,0.06)',
    borderLight: 'rgba(255,255,255,0.03)',
    cardBg: 'rgba(255,255,255,0.02)',
    cardBorder: 'rgba(255,255,255,0.05)',
    cardHoverBorder: 'rgba(212,175,55,0.3)',
    inputBg: 'rgba(255,255,255,0.03)',
    inputBorder: 'rgba(255,255,255,0.1)',
    inputFocusBorder: '#D4AF37',
    shadow: 'none',
    shadowHover: '0 0 30px rgba(212,175,55,0.08)',
    overlay: 'rgba(0,0,0,0.5)',
    skeletonBg: 'rgba(255,255,255,0.05)',
};



// ── Context ────────────────────────────────────────────────────────────────────
interface ThemeContextType {
    mode: ThemeMode;
    colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    colors: DARK_COLORS,
});

export const useThemeContext = () => useContext(ThemeContext);
export const useThemeColors = (): ThemeColors => useContext(ThemeContext).colors;

// ── Provider ───────────────────────────────────────────────────────────────────
export default function ThemeContextProvider({ children }: { children: React.ReactNode }) {
    // Mode is effectively fixed as 'dark'
    const mode: ThemeMode = 'dark';
    const colors = DARK_COLORS;

    // Set data-theme on html element for CSS
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
    }, [mode]);

    const contextValue = useMemo(
        () => ({
            mode,
            colors,
        }),
        [mode, colors]
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: { main: '#D4AF37' },
                    secondary: { main: 'rgba(255,255,255,0.5)' },
                    background: { default: '#050505', paper: '#0A0A0A' },
                    text: { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.5)' },
                    divider: 'rgba(255,255,255,0.1)',
                },
                typography: {
                    fontFamily: '"Space Grotesk", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
                    h2: { fontSize: '2.75rem', fontWeight: 600, letterSpacing: '-0.01em' },
                    h3: { fontSize: '2.25rem', fontWeight: 600 },
                    h4: { fontSize: '1.75rem', fontWeight: 500 },
                    body1: { fontSize: '1rem', lineHeight: 1.7 },
                    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
                },
                shape: { borderRadius: 12 },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                fontWeight: 500,
                                borderRadius: 8,
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    // ── Emotion Cache Logic ────────────────────────────────────────────────────
    const [{ cache, flush }] = useState(() => {
        const cache = createCache({ key: 'css-global' });
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
            <ThemeContext.Provider value={contextValue}>
                <MuiThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}
                </MuiThemeProvider>
            </ThemeContext.Provider>
        </CacheProvider>
    );
}
