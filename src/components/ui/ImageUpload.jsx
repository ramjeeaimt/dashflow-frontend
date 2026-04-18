import React, { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import uploadService from "features/upload/uploadService";

const ImageUpload = ({ initialImage, onUploadSuccess, initials = "??", size = "w-24 h-24" }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(initialImage);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await uploadService.uploadAvatar(file);
      setPreview(result.url);
      if (onUploadSuccess) {
        onUploadSuccess(result.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative group ${size}`}>
      <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-md flex items-center justify-center">
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-gray-500 uppercase">{initials}</span>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {!loading && (
        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors border-2 border-white">
          <Camera className="w-4 h-4 text-white" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;
