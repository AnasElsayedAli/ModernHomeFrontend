import {
  BackendEvent,
  EventCreateRequest,
  EventUpdateRequest,
} from '@/types/event';

export const eventService = {
  async getEvents(): Promise<BackendEvent[]> {
    // return getAllPaginatedResults((params) =>
    //   apiClient.get<PaginatedResponse<BackendEvent>>('/events/', { params }));
    throw new Error('عرض الفعاليات غير متاح حاليًا.');
  },

  async getEvent(id: number): Promise<BackendEvent> {
    // return apiClient.get<BackendEvent>(`/events/${id}/`);
    throw new Error('عرض بيانات الفعالية غير متاح حاليًا.');
  },

  async createEvent(data: EventCreateRequest): Promise<BackendEvent> {
    // return apiClient.post<BackendEvent>('/events/', data);
    throw new Error('إنشاء الفعاليات غير متاح حاليًا.');
  },

  async updateEvent(id: number, data: EventUpdateRequest): Promise<BackendEvent> {
    // return apiClient.patch<BackendEvent>(`/events/${id}/`, data);
    throw new Error('تعديل الفعاليات غير متاح حاليًا.');
  },

  async deleteEvent(id: number): Promise<void> {
    // await apiClient.delete<void>(`/events/${id}/`);
    throw new Error('حذف الفعاليات غير متاح حاليًا.');
  },
};
