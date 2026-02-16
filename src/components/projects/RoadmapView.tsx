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
    List as ListIcon
} from '@mui/icons-material';
import { Sprint, Task } from '@/utils/projectApi';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapViewProps {
    roadmap: Sprint[];
    extractedFeatures: string[];
    onTaskMove?: (taskId: string, newStatus: string) => void;
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

const TaskCard = ({ task, onTaskMove, draggedTaskId, onDragStart }: {
    task: Task;
    onTaskMove?: (taskId: string, newStatus: string) => void;
    draggedTaskId: string | null;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
}) => (
    <MotionPaper
        layout
        draggable={!!onTaskMove}
        onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, task.id)}
        elevation={0}
        sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mb: 1.5,
            cursor: onTaskMove ? 'grab' : 'default',
            '&:active': { cursor: onTaskMove ? 'grabbing' : 'default' },
            opacity: draggedTaskId === task.id ? 0.5 : 1
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

export default function RoadmapView({ roadmap, extractedFeatures, onTaskMove }: RoadmapViewProps) {
    const [selectedSprintIndex, setSelectedSprintIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const currentSprint = roadmap[selectedSprintIndex];

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedTaskId(taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId && onTaskMove) {
            onTaskMove(taskId, status);
        }
        setDraggedTaskId(null);
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
                {roadmap.map((sprint, i) => (
                    <Tab
                        key={i}
                        label={`Sprint ${sprint.sprint_number}: ${sprint.name}`}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    />
                ))}
            </Tabs>

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedSprintIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
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
                    {viewMode === 'kanban' ? (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            {['Todo', 'In Progress', 'Done'].map((status) => (
                                <Box
                                    key={status}
                                    sx={{ flex: 1, minWidth: 0 }}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e as unknown as React.DragEvent, status)}
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
                                            ...(draggedTaskId && {
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
                                                        onTaskMove={onTaskMove}
                                                        draggedTaskId={draggedTaskId}
                                                        onDragStart={handleDragStart}
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
                                    onTaskMove={onTaskMove}
                                    draggedTaskId={draggedTaskId}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                        </Stack>
                    )}
                </motion.div>
            </AnimatePresence>
        </Box>
    );
}
