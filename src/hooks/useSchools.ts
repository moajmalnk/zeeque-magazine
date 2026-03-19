import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface School {
  id: string;
  username: string;
  email: string;
  school_name: string;
  school_code: string;
  place: string;
  district: string;
  state: string;
  country: string;
  is_active: boolean;
  is_onboarded: boolean;
}

export const useSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      // Fetch all users with role 'SCHOOL'
      // We set a high page_size to get all schools for selection (simple approach for now)
      const response = await api.get<{ results: School[] }>('/users/', {
        params: { role: 'SCHOOL', page_size: 200 }
      });
      return response.data.results || [];
    },
    // Keep data fresh as new schools are added
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
