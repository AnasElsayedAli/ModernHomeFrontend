import { apiClient } from '../client';
import { getAllPaginatedResults, PaginatedResponse, SearchParams } from '../pagination';
import {
  CustomDesignImage,
  CustomDesignImageCreate,
  CustomDesignRequest,
  CustomDesignRequestCreate,
} from '@/types/customDesign';

export const customDesignService = {
  async createRequest(data: CustomDesignRequestCreate): Promise<CustomDesignRequest> {
    return apiClient.post<CustomDesignRequest>('/custom-designs/', data);
  },

  async createImage(data: CustomDesignImageCreate): Promise<CustomDesignImage> {
    return apiClient.post<CustomDesignImage>('/custom-designs/images/', data);
  },

  async getRequests(params: SearchParams = {}): Promise<CustomDesignRequest[]> {
    return getAllPaginatedResults((pageParams) =>
      apiClient.get<PaginatedResponse<CustomDesignRequest>>('/custom-designs/', { params: pageParams }), params);
  },

  async deleteRequest(id: number): Promise<void> {
    await apiClient.delete<void>(`/custom-designs/${id}/`);
  },
};