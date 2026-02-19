import api from './api';

export interface TeamSize {
    min: number;
    max: number;
}

export interface ProjectCreateData {
    title: string;
    category: "Full Stack" | "Frontend" | "Backend" | "Mobile" | "Data Science" | "AI/ML" | "Other";
    description: string;
    features: string[];
    required_skills: string[];
    team_size: TeamSize;
    complexity: "Easy" | "Medium" | "Hard";
    estimated_duration: string;
}

export interface ProjectResponse extends ProjectCreateData {
    id: string;
    auth_user_id: number;
    status: string;
    created_at: string;
    updated_at?: string;
    team_id?: string;
}

// ---- Team Interfaces ----

export interface TeamMember {
    user_id: number;
    username?: string;
    role: string;
    joined_at: string;
}

export interface TeamResponse {
    id: string;
    project_id: string;
    project_title: string;
    project_owner: number;
    team_members: TeamMember[];
    created_at: string;
}

// ---- Invitation / Join Request Interfaces ----

export interface InvitationResponse {
    id: string;
    project_id: string;
    project_title: string;
    sender_id: number;
    receiver_id: number;
    role: string;
    type?: string;          // "JOIN_REQUEST" or undefined (regular invite)
    message?: string;
    status: string;         // PENDING | ACCEPTED | REJECTED
    created_at: string;
    updated_at?: string;
}

// ---- Project Planner Interfaces ----

export interface Task {
    id: string;
    title: string;
    description?: string;
    assignee?: string;
    role?: string;
    estimate?: string;
    priority?: string;
    status: string;
}

export interface Sprint {
    sprint_number: number;
    name: string;
    duration: string;
    goals: string[];
    features: string[];
    tasks: Task[];
}

export interface ProjectPlannerResponse {
    project_id: string;
    roadmap: Sprint[];
    extracted_features: string[];
    error?: string;
}

export interface ProjectPlan {
    project_id: string;
    roadmap: Sprint[];
    created_at: string;
    updated_at?: string;
}

export interface SendInvitationRequest {
    project_id: string;
    sender_id: number;
    receiver_id?: number;
    receiver_username?: string;
    project_title: string;
    role: string;
}

export const projectApi = {
    // ---- Projects CRUD ----

    createProject: async (data: ProjectCreateData) => {
        const response = await api.post('/api/projects/create-project', data);
        return response.data;
    },

    getMyProjects: async () => {
        const response = await api.get('/api/projects/my-projects');
        return response.data;
    },

    getAllProjects: async () => {
        const response = await api.get('/api/projects/all-projects');
        return response.data;
    },

    searchProjects: async (query: string): Promise<ProjectResponse[]> => {
        const response = await api.get('/api/projects/search', { params: { q: query } });
        return response.data;
    },

    getProjectById: async (id: string) => {
        const response = await api.get(`/api/projects/project/${id}`);
        return response.data;
    },

    updateProject: async (id: string, data: Partial<ProjectCreateData>) => {
        const response = await api.patch(`/api/projects/project/${id}`, data);
        return response.data;
    },

    deleteProject: async (id: string) => {
        const response = await api.delete(`/api/projects/project/${id}`);
        return response.data;
    },

    // ---- Invitations ----

    sendInvitation: async (data: SendInvitationRequest) => {
        const response = await api.post('/api/projects/send-invitation', data);
        return response.data;
    },

    getMyInvitations: async (): Promise<InvitationResponse[]> => {
        const response = await api.get('/api/projects/get-my-invitations');
        return response.data;
    },

    updateInvitation: async (data: { invitation_id: string; status: string }) => {
        const response = await api.post('/api/projects/update-invitation', data);
        return response.data;
    },

    // ---- Join Requests ----

    requestToJoin: async (data: { project_id: string; role: string; message?: string }) => {
        const response = await api.post('/api/projects/request-to-join', data);
        return response.data;
    },

    getJoinRequests: async (): Promise<InvitationResponse[]> => {
        const response = await api.get('/api/projects/get-join-requests');
        return response.data;
    },

    respondJoinRequest: async (data: { invitation_id: string; status: string }) => {
        const response = await api.post('/api/projects/respond-join-request', data);
        return response.data;
    },

    // ---- Teams ----

    getMyTeams: async (): Promise<TeamResponse[]> => {
        const response = await api.get('/api/teams/my-teams');
        return response.data;
    },

    getTeamById: async (teamId: string): Promise<TeamResponse> => {
        const response = await api.get(`/api/teams/team/${teamId}`);
        return response.data;
    },

    getTeamByProject: async (projectId: string): Promise<TeamResponse> => {
        const response = await api.get(`/api/teams/project/${projectId}`);
        return response.data;
    },

    // ---- Project Planner ----

    generateRoadmap: async (projectId: string): Promise<ProjectPlannerResponse> => {
        const response = await api.post('/api/agents/project-planner', { project_id: projectId });
        return response.data;
    },

    getProjectPlan: async (projectId: string): Promise<ProjectPlan> => {
        const response = await api.get(`/api/planned-projects/project/${projectId}`);
        return response.data;
    },

    updateTaskStatus: async (data: { project_id: string; task_id: string; status: string }) => {
        const response = await api.patch('/api/planned-projects/tasks', data);
        return response.data;
    },

    // ---- Rooms ----

    createRoom: async (data: { project_id: string; created_by: string }) => {
        const response = await api.post('/api/rooms', data);
        return response.data;
    },

    getRoom: async (projectId: string) => {
        const response = await api.get(`/api/rooms/${projectId}`);
        return response.data;
    },

    getMyRooms: async () => {
        const response = await api.get('/api/rooms');
        return response.data;
    },

    // ---- Workspace Persistence ----

    saveWorkspace: async (projectId: string, data: { fileStructure?: any; drawingData?: any }) => {
        const response = await api.put(`/api/rooms/${projectId}/workspace`, data);
        return response.data;
    },

    getWorkspace: async (projectId: string) => {
        const response = await api.get(`/api/rooms/${projectId}/workspace`);
        return response.data;
    },
};
