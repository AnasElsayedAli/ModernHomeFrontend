import { SearchParams } from '../pagination';
import {
  CustomDesignImage,
  CustomDesignImageCreate,
  CustomDesignRequest,
  CustomDesignRequestCreate,
} from '@/types/customDesign';

export const customDesignService = {
  async createRequest(data: CustomDesignRequestCreate): Promise<CustomDesignRequest> {
    // return apiClient.post<CustomDesignRequest>('/custom-designs/', data);
    throw new Error('إرسال طلبات التصميم غير متاح حاليًا.');
  },

  async createImage(data: CustomDesignImageCreate): Promise<CustomDesignImage> {
    // return apiClient.post<CustomDesignImage>('/custom-designs/images/', data);
    throw new Error('إرفاق صور الطلبات غير متاح حاليًا.');
  },

  async getRequests(params: SearchParams = {}): Promise<CustomDesignRequest[]> {
    // return getAllPaginatedResults((pageParams) =>
    //   apiClient.get<PaginatedResponse<CustomDesignRequest>>('/custom-designs/', { params: pageParams }), params);
    throw new Error('عرض طلبات التصميم غير متاح حاليًا.');
  },

  async deleteRequest(id: number): Promise<void> {
    // await apiClient.delete<void>(`/custom-designs/${id}/`);
    throw new Error('حذف طلبات التصميم غير متاح حاليًا.');
  },
};