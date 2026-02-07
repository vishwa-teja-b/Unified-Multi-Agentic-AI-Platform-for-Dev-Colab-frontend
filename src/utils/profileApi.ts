import api from './api';

export interface ProfileData {
    id?: string;
    name: string;
    username: string;
    email: string;
    bio: string;
    phone?: string;
    profile_picture?: string;
    city?: string;
    state?: string;
    country?: string;
    timezone: string;
    primary_skills: string[];
    secondary_skills: string[];
    experience_level?: string;
    interests: string[];
    languages: string[];
    availability_hours?: number;
    open_to: string[];
    preferred_role?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
}

export const profileApi = {
    getProfile: async () => {
        try {
            const response = await api.get('/api/profiles/profile');
            return response.data;
        } catch (error) {
            // If 404, it means profile doesn't exist yet
            return null;
        }
    },

    createProfile: async (data: ProfileData) => {
        const response = await api.post('/api/profiles/create-profile', data);
        return response.data;
    },

    updateProfile: async (data: ProfileData) => {
        const response = await api.patch('/api/profiles/profile-update', data);
        return response.data;
    },

    testAuth: async () => {
        const response = await api.get('/api/profiles/test-auth');
        return response.data;
    }
};
