import { api } from '../api';

const baseUrl = 'public';

export const publicFileApiRoutes = {
  getPublicFile: (filename: string) => {
    return api.get<Blob>(`${baseUrl}/${encodeURIComponent(filename)}`, {
      responseType: 'blob',
    });
  },
};
