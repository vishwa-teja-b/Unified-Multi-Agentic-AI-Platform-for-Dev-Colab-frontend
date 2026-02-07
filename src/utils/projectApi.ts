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
    team_members: any[];
}

export const projectApi = {
    createProject: async (data: ProjectCreateData) => {
        const response = await api.post('/api/projects/create-project', data);
        return response.data;
    },

    getMyProjects: async () => {
        const response = await api.get('/api/projects/my-projects');
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
    }
};
