import apiClient from "api/client";
import { API_ENDPOINTS } from "api/endpoints";

const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(API_ENDPOINTS.UPLOAD_IMAGE.IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // Expected { url, publicId }
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(API_ENDPOINTS.UPLOAD_IMAGE.AVATAR, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(API_ENDPOINTS.UPLOAD_IMAGE.DOCUMENT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};

export default uploadService;
