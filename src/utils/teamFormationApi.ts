import api from './api';

// Types for Team Formation API
export interface TeamFormationRequest {
    project_id: string;
    project_title: string;
    required_skills: string[];
    team_size: number;
    timeline: string;
}

export interface CandidateRecommendation {
    role: string;
    name: string;
    username: string;                // user's @username
    email: string;
    skills: string;
    similarity_score: number;       // 0-1 from vector search
    availability_hours: number;
    timezone: string;
    timezone_diff?: number;         // hours difference from owner
    timezone_score?: number;        // 0-1 compatibility score
    match_score: number;            // 0-100 from LLM evaluation
    reasoning: string;              // LLM explanation of why candidate is a good fit
}

export interface TeamFormationResponse {
    recommendations: CandidateRecommendation[];
    error: string | null;
}

export const teamFormationApi = {
    /**
     * Call the team formation agent to find recommended teammates
     */
    findTeammates: async (data: TeamFormationRequest): Promise<TeamFormationResponse> => {
        const response = await api.post<TeamFormationResponse>('/api/agents/team-formation', data);
        return response.data;
    },
};

export default teamFormationApi;
