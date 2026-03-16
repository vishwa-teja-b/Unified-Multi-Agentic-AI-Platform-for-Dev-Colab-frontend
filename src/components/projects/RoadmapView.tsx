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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    AccessTime,
    Person,
    Flag,
    ViewKanban,
    List as ListIcon,
    Lock,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreHoriz,
} from '@mui/icons-material';
import { Sprint, Task, projectApi } from '@/utils/projectApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from '@/context/ThemeContext';

interface RoadmapViewProps {
    projectId: string;
    roadmap: Sprint[];
    extractedFeatures: string[];
    onTaskMove?: (taskId: string, newStatus: string) => void;
    onRoadmapUpdate?: () => void;
    currentSprintNumber?: number;
    isOwner?: boolean;
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

const TaskCard = ({ task, onTaskMove, draggedTaskId, onDragStart, locked, onEdit, onDelete, isOwner }: {
    task: Task;
    onTaskMove?: (taskId: string, newStatus: string) => void;
    draggedTaskId: string | null;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    locked?: boolean;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    isOwner?: boolean;
}) => (
    <MotionPaper
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
            position: 'relative',
            cursor: locked ? 'not-allowed' : onTaskMove ? 'grab' : 'default',
            '&:active': { cursor: locked ? 'not-allowed' : onTaskMove ? 'grabbing' : 'default' },
            opacity: locked ? 0.4 : draggedTaskId === task.id ? 0.5 : 1,
            pointerEvents: locked ? 'none' : 'auto',
            filter: locked ? 'grayscale(0.5)' : 'none',
            transition: 'opacity 0.3s, filter 0.3s, transform 0.2s',
            '&:hover': {
                transform: locked ? 'none' : 'translateY(-2px)',
                borderColor: 'primary.main',
                '& .task-actions': { opacity: 1 }
            }
        }}
    >
        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle2" fontWeight="600" sx={{ lineHeight: 1.3, pr: isOwner ? 4 : 0 }}>
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
            
            {isOwner && !locked && (
                <Box className="task-actions" sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    opacity: 0, 
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: 1,
                    boxShadow: 1
                }}>
                    <IconButton size="small" onClick={() => onEdit?.(task)} sx={{ p: 0.5 }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete?.(task.id)} sx={{ p: 0.5, color: 'error.main' }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
            )}

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

export default function RoadmapView({ projectId, roadmap, extractedFeatures, onTaskMove, onRoadmapUpdate, currentSprintNumber, isOwner }: RoadmapViewProps) {
    const c = useThemeColors();
    const GOLD = c.gold;
    const [selectedSprintIndex, setSelectedSprintIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    // Modal state
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [formStatus, setFormStatus] = useState('todo');

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        assignee: '',
        role: '',
        estimate: '',
        priority: 'Medium',
    });

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

    const handleOpenAddTask = (status: string) => {
        setEditingTask(null);
        setFormStatus(status);
        setTaskForm({
            title: '',
            description: '',
            assignee: '',
            role: '',
            estimate: '',
            priority: 'Medium',
        });
        setTaskDialogOpen(true);
    };

    const handleOpenEditTask = (task: Task) => {
        setEditingTask(task);
        setFormStatus(task.status);
        setTaskForm({
            title: task.title,
            description: task.description || '',
            assignee: task.assignee || '',
            role: task.role || '',
            estimate: task.estimate || '',
            priority: task.priority || 'Medium',
        });
        setTaskDialogOpen(true);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await projectApi.deleteTask(projectId, taskId);
            onRoadmapUpdate?.();
        } catch (err) {
            console.error('Failed to delete task', err);
            alert('Failed to delete task');
        }
    };

    const handleSaveTask = async () => {
        if (!taskForm.title.trim()) return;
        setDialogLoading(true);
        try {
            if (editingTask) {
                await projectApi.updateTask({
                    project_id: projectId,
                    task_id: editingTask.id,
                    ...taskForm,
                    status: formStatus
                });
            } else {
                await projectApi.addTask({
                    project_id: projectId,
                    sprint_number: currentSprint.sprint_number,
                    ...taskForm,
                    status: formStatus
                });
            }
            setTaskDialogOpen(false);
            onRoadmapUpdate?.();
        } catch (err) {
            console.error('Failed to save task', err);
            alert('Failed to save task');
        } finally {
            setDialogLoading(false);
        }
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

                                            {isOwner && !isSprintLocked && (
                                                <Button
                                                    fullWidth
                                                    startIcon={<AddIcon />}
                                                    onClick={() => handleOpenAddTask(status)}
                                                    sx={{ 
                                                        mb: 2, 
                                                        textTransform: 'none', 
                                                        color: 'text.secondary',
                                                        border: '1px dashed',
                                                        borderColor: 'divider',
                                                        borderRadius: 2,
                                                        '&:hover': {
                                                            borderColor: 'primary.main',
                                                            bgcolor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    Add Task
                                                </Button>
                                            )}

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
                                                            onEdit={handleOpenEditTask}
                                                            onDelete={handleDeleteTask}
                                                            isOwner={isOwner}
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
                                        onEdit={handleOpenEditTask}
                                        onDelete={handleDeleteTask}
                                        isOwner={isOwner}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Box>

                    {/* Task Dialog */}
                    <Dialog 
                        open={taskDialogOpen} 
                        onClose={() => !dialogLoading && setTaskDialogOpen(false)} 
                        fullWidth 
                        maxWidth="sm"
                        PaperProps={{
                            sx: {
                                borderRadius: 4,
                                bgcolor: 'rgba(10, 10, 10, 0.7)',
                                border: `1px solid ${c.border}`,
                                backdropFilter: 'blur(20px)',
                                color: c.textPrimary,
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
                            }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Space Grotesk', pb: 1 }}>
                            {editingTask ? 'Edit Task' : 'Add New Task'}
                        </DialogTitle>
                        <DialogContent sx={{ borderColor: c.divider }}>
                            <Stack spacing={3} sx={{ mt: 2 }}>
                                <TextField
                                    label="Task Title"
                                    fullWidth
                                    required
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            '& fieldset': { borderColor: c.border },
                                            '&:hover fieldset': { borderColor: GOLD },
                                            '&.Mui-focused fieldset': { borderColor: GOLD },
                                        },
                                        '& .MuiInputLabel-root': { color: c.textSecondary },
                                        '& .MuiInputLabel-root.Mui-focused': { color: GOLD },
                                    }}
                                />
                                <TextField
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            '& fieldset': { borderColor: c.border },
                                            '&:hover fieldset': { borderColor: GOLD },
                                            '&.Mui-focused fieldset': { borderColor: GOLD },
                                        },
                                        '& .MuiInputLabel-root': { color: c.textSecondary },
                                        '& .MuiInputLabel-root.Mui-focused': { color: GOLD },
                                    }}
                                />
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        label="Assignee"
                                        fullWidth
                                        value={taskForm.assignee}
                                        onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                '& fieldset': { borderColor: c.border },
                                                '&:hover fieldset': { borderColor: GOLD },
                                                '&.Mui-focused fieldset': { borderColor: GOLD },
                                            },
                                            '& .MuiInputLabel-root': { color: c.textSecondary },
                                        }}
                                    />
                                    <TextField
                                        label="Role"
                                        fullWidth
                                        value={taskForm.role}
                                        onChange={(e) => setTaskForm({ ...taskForm, role: e.target.value })}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                '& fieldset': { borderColor: c.border },
                                                '&:hover fieldset': { borderColor: GOLD },
                                                '&.Mui-focused fieldset': { borderColor: GOLD },
                                            },
                                            '& .MuiInputLabel-root': { color: c.textSecondary },
                                        }}
                                    />
                                </Stack>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        label="Estimate (e.g. 4h)"
                                        fullWidth
                                        value={taskForm.estimate}
                                        onChange={(e) => setTaskForm({ ...taskForm, estimate: e.target.value })}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                '& fieldset': { borderColor: c.border },
                                                '&:hover fieldset': { borderColor: GOLD },
                                                '&.Mui-focused fieldset': { borderColor: GOLD },
                                            },
                                            '& .MuiInputLabel-root': { color: c.textSecondary },
                                        }}
                                    />
                                    <TextField
                                        select
                                        label="Priority"
                                        fullWidth
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                '& fieldset': { borderColor: c.border },
                                                '&:hover fieldset': { borderColor: GOLD },
                                                '&.Mui-focused fieldset': { borderColor: GOLD },
                                            },
                                            '& .MuiInputLabel-root': { color: c.textSecondary },
                                        }}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    sx: {
                                                        bgcolor: 'rgba(15, 15, 15, 0.95)',
                                                        backdropFilter: 'blur(10px)',
                                                        border: `1px solid ${c.border}`,
                                                        color: '#fff'
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="High">High</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="Low">Low</MenuItem>
                                    </TextField>
                                </Stack>
                                <TextField
                                    select
                                    label="Status"
                                    fullWidth
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            '& fieldset': { borderColor: c.border },
                                            '&:hover fieldset': { borderColor: GOLD },
                                            '&.Mui-focused fieldset': { borderColor: GOLD },
                                        },
                                        '& .MuiInputLabel-root': { color: c.textSecondary },
                                    }}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: 'rgba(15, 15, 15, 0.95)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${c.border}`,
                                                    color: '#fff'
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="todo">Todo</MenuItem>
                                    <MenuItem value="In Progress">In Progress</MenuItem>
                                    <MenuItem value="Done">Done</MenuItem>
                                </TextField>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, px: 4 }}>
                            <Button 
                                onClick={() => setTaskDialogOpen(false)} 
                                disabled={dialogLoading}
                                sx={{ color: c.textSecondary, textTransform: 'none' }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleSaveTask}
                                disabled={dialogLoading || !taskForm.title.trim()}
                                startIcon={dialogLoading && <CircularProgress size={16} color="inherit" />}
                                sx={{
                                    bgcolor: GOLD,
                                    color: 'black',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: 4,
                                    '&:hover': {
                                        bgcolor: '#B8972E',
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'rgba(212, 175, 55, 0.3)',
                                        color: 'rgba(0,0,0,0.3)'
                                    }
                                }}
                            >
                                {editingTask ? 'Update Task' : 'Add Task'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </motion.div>
            </AnimatePresence>
        </Box>
    );
}
