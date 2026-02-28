import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    IconButton,
    Tabs,
    Tab,
} from '@mui/material';
import {
    AccessTime,
    Person,
    Flag,
    ViewKanban,
    List as ListIcon,
    Lock,
} from '@mui/icons-material';
import { Sprint, Task } from '@/utils/projectApi';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapViewProps {
    roadmap: Sprint[];
    extractedFeatures: string[];
    onTaskMove?: (taskId: string, newStatus: string) => void;
    currentSprintNumber?: number;
}

const MotionPaper = motion(Paper);

const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'default';
    }
};

const TaskCard = ({ task, onTaskMove, draggedTaskId, onDragStart, locked }: {
    task: Task;
    onTaskMove?: (taskId: string, newStatus: string) => void;
    draggedTaskId: string | null;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    locked?: boolean;
}) => (
    <MotionPaper
        layout
        draggable={!!onTaskMove && !locked}
        onDragStart={(e) => !locked && onDragStart(e as unknown as React.DragEvent, task.id)}
        elevation={0}
        sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mb: 1.5,
            cursor: locked ? 'not-allowed' : onTaskMove ? 'grab' : 'default',
            '&:active': { cursor: locked ? 'not-allowed' : onTaskMove ? 'grabbing' : 'default' },
            opacity: locked ? 0.4 : draggedTaskId === task.id ? 0.5 : 1,
            pointerEvents: locked ? 'none' : 'auto',
            filter: locked ? 'grayscale(0.5)' : 'none',
            transition: 'opacity 0.3s, filter 0.3s',
        }}
    >
        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle2" fontWeight="600" sx={{ lineHeight: 1.3 }}>
                    {task.title}
                </Typography>
                <Chip
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority)}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                />
            </Stack>
            {task.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {task.description}
                </Typography>
            )}
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {task.assignee && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {task.assignee}
                        </Typography>
                    </Stack>
                )}
                {task.estimate && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {task.estimate}
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </Stack>
    </MotionPaper>
);

export default function RoadmapView({ roadmap, extractedFeatures, onTaskMove, currentSprintNumber }: RoadmapViewProps) {
    const [selectedSprintIndex, setSelectedSprintIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const currentSprint = roadmap[selectedSprintIndex];

    // Determine highest unlocked sprint based on task completion
    const activeSprintNum = currentSprintNumber ?? 1;

    const getHighestUnlockedSprint = () => {
        let maxUnlocked = activeSprintNum;
        for (let num = activeSprintNum; num <= roadmap.length; num++) {
            const sprintData = roadmap.find(s => s.sprint_number === num);
            if (!sprintData || !sprintData.tasks || sprintData.tasks.length === 0) {
                break;
            }
            const allDone = sprintData.tasks.every(t => t.status.toLowerCase() === 'done');
            if (allDone) {
                maxUnlocked = Math.max(maxUnlocked, num + 1);
            } else {
                break;
            }
        }
        return maxUnlocked;
    };

    const highestUnlockedSprint = getHighestUnlockedSprint();
    const isSprintLocked = currentSprint.sprint_number > highestUnlockedSprint;

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        if (isSprintLocked) return;
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedTaskId(taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (isSprintLocked) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        if (isSprintLocked) return;
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId && onTaskMove) {
            onTaskMove(taskId, status);
        }
        setDraggedTaskId(null);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return '';
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            {/* Sprints Tabs */}
            <Tabs
                value={selectedSprintIndex}
                onChange={(_, v) => setSelectedSprintIndex(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                {roadmap.map((sprint, i) => {
                    const locked = sprint.sprint_number > highestUnlockedSprint;
                    return (
                        <Tab
                            key={i}
                            label={
                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                    {locked && <Lock sx={{ fontSize: 14, opacity: 0.6 }} />}
                                    <span>{`Sprint ${sprint.sprint_number}: ${sprint.name}`}</span>
                                </Stack>
                            }
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                opacity: locked ? 0.5 : 1,
                            }}
                        />
                    );
                })}
            </Tabs>

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedSprintIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Locked Sprint Banner */}
                    {isSprintLocked && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    mb: 3,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(12px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Lock sx={{ fontSize: 28, color: 'rgba(255, 255, 255, 0.4)' }} />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="700" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                        Sprint Locked
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                                        This sprint unlocks on {formatDate(currentSprint.start_date)}.
                                        You can preview the tasks but cannot interact with them until then.
                                    </Typography>
                                </Box>
                            </Paper>
                        </motion.div>
                    )}

                    {/* Sprint Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="h5" fontWeight="700">
                                {currentSprint.name}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                                <Chip icon={<AccessTime />} label={currentSprint.duration} size="small" />
                                <Typography variant="body2" color="text.secondary">
                                    {currentSprint.goals.length} Goals • {currentSprint.tasks.length} Tasks
                                </Typography>
                                {currentSprint.start_date && (
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(currentSprint.start_date)} — {formatDate(currentSprint.end_date)}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                        {/* View Toggle */}
                        <Stack direction="row" spacing={0.5} sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}>
                            <IconButton
                                size="small"
                                color={viewMode === 'kanban' ? 'primary' : 'default'}
                                onClick={() => setViewMode('kanban')}
                            >
                                <ViewKanban fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                color={viewMode === 'list' ? 'primary' : 'default'}
                                onClick={() => setViewMode('list')}
                            >
                                <ListIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Stack>

                    {/* Goals & Features Snippet */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
                        <Box sx={{ flex: 1 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', height: '100%' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Sprint Goals</Typography>
                                <Stack spacing={0.5}>
                                    {currentSprint.goals.map((goal, i) => (
                                        <Stack key={i} direction="row" alignItems="center" spacing={1}>
                                            <Flag sx={{ fontSize: 16, color: 'primary.main' }} />
                                            <Typography variant="body2">{goal}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', height: '100%' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Focus Features</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {currentSprint.features.map((f, i) => (
                                        <Chip
                                            key={i}
                                            label={f}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Paper>
                        </Box>
                    </Stack>

                    {/* Task Board */}
                    <Box sx={{ position: 'relative' }}>
                        {viewMode === 'kanban' ? (
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                {['Todo', 'In Progress', 'Done'].map((status) => (
                                    <Box
                                        key={status}
                                        sx={{ flex: 1, minWidth: 0 }}
                                        onDragOver={!isSprintLocked ? handleDragOver : undefined}
                                        onDrop={!isSprintLocked ? (e) => handleDrop(e as unknown as React.DragEvent, status) : undefined}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                bgcolor: 'action.hover',
                                                borderRadius: 3,
                                                height: '100%',
                                                minHeight: 300,
                                                transition: 'background-color 0.2s',
                                                ...(draggedTaskId && !isSprintLocked && {
                                                    border: '1px dashed',
                                                    borderColor: 'primary.main',
                                                    bgcolor: 'action.selected'
                                                })
                                            }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                                <Box sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: status === 'Done' ? 'success.main' : status === 'In Progress' ? 'warning.main' : 'text.disabled'
                                                }} />
                                                <Typography variant="subtitle1" fontWeight="700" color="text.secondary">
                                                    {status}
                                                </Typography>
                                                <Chip
                                                    label={currentSprint.tasks.filter(t => t.status.toLowerCase() === status.toLowerCase() || (status === 'Todo' ? !['in progress', 'done'].includes(t.status.toLowerCase()) : false)).length}
                                                    size="small"
                                                    sx={{ height: 20, fontWeight: 700 }}
                                                />
                                            </Stack>
                                            <Stack spacing={0}>
                                                {currentSprint.tasks
                                                    .filter(t => {
                                                        const s = t.status.toLowerCase();
                                                        if (status === 'Todo') return !['in progress', 'done'].includes(s);
                                                        return s === status.toLowerCase();
                                                    })
                                                    .map(task => (
                                                        <TaskCard
                                                            key={task.id}
                                                            task={task}
                                                            onTaskMove={isSprintLocked ? undefined : onTaskMove}
                                                            draggedTaskId={draggedTaskId}
                                                            onDragStart={handleDragStart}
                                                            locked={isSprintLocked}
                                                        />
                                                    ))}
                                            </Stack>
                                        </Paper>
                                    </Box>
                                ))}
                            </Stack>
                        ) : (
                            <Stack spacing={2}>
                                {currentSprint.tasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onTaskMove={isSprintLocked ? undefined : onTaskMove}
                                        draggedTaskId={draggedTaskId}
                                        onDragStart={handleDragStart}
                                        locked={isSprintLocked}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Box>
                </motion.div>
            </AnimatePresence>
        </Box>
    );
}
