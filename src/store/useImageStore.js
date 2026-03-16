import { create } from "zustand";
import axios from "axios";

const useImageStore = create((set) => ({
  imageUrl: "",
  loading: false,

  uploadImage: async (file) => {
    set({ loading: true });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
        formData
      );

      set({
        imageUrl: res.data.secure_url,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
}));

export default useImageStore;