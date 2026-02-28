import api from './api';

export const getChatRooms = async () => {
    const response = await api.get('/api/chat/get-chat-rooms');
    return response.data;
};

export const getTeamChat = async (team_id: string) => {
    const response = await api.post('/api/chat/team-chat', { team_id });
    return response.data;
};

export const createOrGetDirectChat = async (other_user_id: number) => {
    const response = await api.post('/api/chat/new-chat', { other_user_id });
    return response.data;
};

export const searchDevelopersForChat = async (query: string) => {
    const response = await api.get(`/api/chat/search-dev?query=${query}`);
    return response.data;
};

export const getRoomMessages = async (room_id: string) => {
    const response = await api.get(`/api/chat/${room_id}/messages`);
    return response.data;
};

export const sendMessage = async (room_id: string, text: string) => {
    const response = await api.post(`/api/chat/${room_id}/messages`, { text });
    return response.data;
};
