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

// Helper function to ensure image URLs are absolute
const ensureAbsoluteImageUrls = (motorcycle: Motorcycle): Motorcycle => {
  const result = { ...motorcycle };
  
  if (result.image_path && !result.image_path.startsWith('http')) {
    // Clean the path and use serve-image.php
    const cleanPath = result.image_path.replace(/^(public\/|storage\/)*/, '');
    result.image_path = `${API_URL}/serve-image.php?path=${encodeURIComponent(cleanPath)}`;
  }
  
  if (result.specification_image_path && !result.specification_image_path.startsWith('http')) {
    // Clean the path and use serve-image.php
    const cleanPath = result.specification_image_path.replace(/^(public\/|storage\/)*/, '');
    result.specification_image_path = `${API_URL}/serve-image.php?path=${encodeURIComponent(cleanPath)}`;
  }
  
  return result;
};

export const getMotorcycles = async (): Promise<Motorcycle[]> => {
  const response = await api.get('/motorcycles');
  return response.data.map(ensureAbsoluteImageUrls);
};

export const getMotorcycle = async (id: string | number): Promise<Motorcycle> => {
  const response = await api.get(`/motorcycles/${id}`);
  return ensureAbsoluteImageUrls(response.data);
};

export const addMotorcycle = async (formData: FormData): Promise<Motorcycle> => {
  const response = await api.post('/motorcycles', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return ensureAbsoluteImageUrls(response.data);
};

// For updates, we need to use POST with _method: 'PUT' if sending FormData
export const updateMotorcycle = async (id: string | number, formData: FormData): Promise<Motorcycle> => {
  formData.append('_method', 'PUT'); // Laravel workaround for FormData with PUT
  const response = await api.post(`/motorcycles/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return ensureAbsoluteImageUrls(response.data);
};

export const deleteMotorcycle = async (id: string | number): Promise<void> => {
  await api.delete(`/motorcycles/${id}`);
}; 