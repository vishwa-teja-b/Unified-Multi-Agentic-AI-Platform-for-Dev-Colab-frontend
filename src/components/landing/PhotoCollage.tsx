'use client';

import React from 'react';
import { Box } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';

// Placeholder images (Tech, Collaboration, Future, Crowd)
const IMAGES = [
    // Pair programming / collaborative coding
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400&auto=format&fit=crop',
    // Whiteboard / brainstorming / system design
    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=400&auto=format&fit=crop',
    // Remote collaboration / video calls
    'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616587226960-4a03badbe8bf?q=80&w=400&auto=format&fit=crop',
    // Code on screen / developer workspace
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=400&auto=format&fit=crop',
    // Online meetings / video conferencing
    'https://images.unsplash.com/photo-1587825140708-dfaf18c91893?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=400&auto=format&fit=crop',
    // Team planning / standup meetings
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop',
    // Project management / kanban / sticky notes
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop',
    // Real-time chat / online collaboration
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=400&auto=format&fit=crop',
    // === Second set for infinite scroll ===
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587825140708-dfaf18c91893?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=400&auto=format&fit=crop',
];

// Split images into 6 columns
const COLUMNS = 6;
const IMAGES_PER_COLUMN = Math.ceil(IMAGES.length / COLUMNS);
const COLUMN_DATA = Array.from({ length: COLUMNS }, (_, i) =>
    IMAGES.slice(i * IMAGES_PER_COLUMN, (i + 1) * IMAGES_PER_COLUMN)
);

const MarqueeColumn = ({ images, direction = 'up', duration = 20 }: { images: string[], direction?: 'up' | 'down', duration?: number }) => {
    // Duplicate images for seamless loop
    const repeatedImages = [...images, ...images];

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <motion.div
                animate={{
                    y: direction === 'up' ? ['0%', '-50%'] : ['-50%', '0%'],
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px', // Gap between images
                    width: '100%',
                }}
            >
                {repeatedImages.map((src, i) => (
                    <motion.div
                        key={i}
                        whileHover={{
                            scale: 1.05,
                            zIndex: 10,
                            transition: { duration: 0.2 }
                        }}
                        style={{
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            width: '100%',
                            flexShrink: 0,
                            height: '300px',
                            pointerEvents: 'auto',
                        }}
                    >
                        <Box
                            component="img"
                            src={src}
                            alt={`Collage ${i}`}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'brightness(0.8) contrast(1.2)',
                            }}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </Box>
    );
};

export const PhotoCollage = () => {
    const { scrollY } = useScroll();

    // Parallax effect for container
    const y = useTransform(scrollY, [0, 1000], [0, -200]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);

    return (
        <Box
            sx={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '120%',
                height: '140%',
                overflow: 'hidden',
                perspective: '1000px',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        >
            <motion.div
                style={{
                    y,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    rotateX: 10,
                    rotateY: -10,
                    rotateZ: -5,
                    scale: 1.1,
                }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.8 }}
            >
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                        gap: 2,
                        width: '100%',
                        height: '100%',
                        transform: 'translateX(5%) translateY(5%)',
                    }}
                >
                    {COLUMN_DATA.map((images, i) => (
                        <MarqueeColumn
                            key={i}
                            images={images}
                            direction={i % 2 === 0 ? 'up' : 'down'}
                            duration={25 + i * 2} // Vary duration slightly for organic feel
                        />
                    ))}
                </Box>
            </motion.div>

            {/* Dark Gradient Overlay */}
            <motion.div style={{ opacity }}>
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `
                linear-gradient(
                to bottom,
                rgba(0,0,0,0.7) 0%,
                rgba(0,0,0,0.4) 40%,
                rgba(0,0,0,0.8) 100%
                )
            `,
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                />
            </motion.div>
        </Box>
    );
};
