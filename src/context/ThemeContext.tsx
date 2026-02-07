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
                            primary: { main: '#000000' },
                            background: { default: '#FDFCF6', paper: '#ffffff' },
                            text: { primary: '#1A1A1A', secondary: '#666666' },
                        }
                        : {
                            primary: { main: '#ffffff' },
                            background: { default: '#030014', paper: '#0F0B1E' },
                            text: { primary: '#ffffff', secondary: '#A1A1AA' },
                        }),
                },
                typography: {
                    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                textTransform: 'none',
                                fontWeight: 600,
                            },
                        },
                    },
                }
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
