import {
  BackendCollaboration,
  CollaborationCreateRequest,
} from '@/types/collaboration';

export const collaborationService = {
  async getCollaborations(): Promise<BackendCollaboration[]> {
    // return getAllPaginatedResults((params) =>
    //   apiClient.get<PaginatedResponse<BackendCollaboration>>('/collaborations/', { params }));
    throw new Error('عرض الشراكات غير متاح حاليًا.');
  },

  async getCollaboration(id: number): Promise<BackendCollaboration> {
    // return apiClient.get<BackendCollaboration>(`/collaborations/${id}/`);
    throw new Error('عرض بيانات الشراكة غير متاح حاليًا.');
  },

  async createCollaboration(data: CollaborationCreateRequest): Promise<BackendCollaboration> {
    // return apiClient.post<BackendCollaboration>('/collaborations/', data);
    throw new Error('إنشاء الشراكات غير متاح حاليًا.');
  },

  async deleteCollaboration(id: number): Promise<void> {
    // await apiClient.delete<void>(`/collaborations/${id}/`);
    throw new Error('حذف الشراكات غير متاح حاليًا.');
  },
};
