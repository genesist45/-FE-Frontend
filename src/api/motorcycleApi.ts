import api from './axios';

export interface Motorcycle {
  id: number;
  name: string;
  price: number;
  features?: string;
  description?: string;
  image_path?: string | null;
  specification_image_path?: string | null;
  created_at?: string;
  updated_at?: string;
  // For frontend display, to handle file objects
  image?: File | null;
  specification_image?: File | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getMotorcycles = async (): Promise<Motorcycle[]> => {
  const response = await api.get('/motorcycles');
  return response.data.map((motorcycle: Motorcycle) => ({
    ...motorcycle,
    image_path: motorcycle.image_path ? `${API_URL}/storage/${motorcycle.image_path}` : null,
    specification_image_path: motorcycle.specification_image_path ? `${API_URL}/storage/${motorcycle.specification_image_path}` : null,
  }));
};

export const getMotorcycle = async (id: string | number): Promise<Motorcycle> => {
  const response = await api.get(`/motorcycles/${id}`);
  const motorcycle = response.data;
  return {
    ...motorcycle,
    image_path: motorcycle.image_path ? `${API_URL}/storage/${motorcycle.image_path}` : null,
    specification_image_path: motorcycle.specification_image_path ? `${API_URL}/storage/${motorcycle.specification_image_path}` : null,
  };
};

export const addMotorcycle = async (formData: FormData): Promise<Motorcycle> => {
  const response = await api.post('/motorcycles', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const motorcycle = response.data;
  return {
    ...motorcycle,
    image_path: motorcycle.image_path ? `${API_URL}/storage/${motorcycle.image_path}` : null,
    specification_image_path: motorcycle.specification_image_path ? `${API_URL}/storage/${motorcycle.specification_image_path}` : null,
  };
};

// For updates, we need to use POST with _method: 'PUT' if sending FormData
export const updateMotorcycle = async (id: string | number, formData: FormData): Promise<Motorcycle> => {
  formData.append('_method', 'PUT'); // Laravel workaround for FormData with PUT
  const response = await api.post(`/motorcycles/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const motorcycle = response.data;
   return {
    ...motorcycle,
    image_path: motorcycle.image_path ? `${API_URL}/storage/${motorcycle.image_path}` : null,
    specification_image_path: motorcycle.specification_image_path ? `${API_URL}/storage/${motorcycle.specification_image_path}` : null,
  };
};

export const deleteMotorcycle = async (id: string | number): Promise<void> => {
  await api.delete(`/motorcycles/${id}`);
}; 