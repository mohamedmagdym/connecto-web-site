import React, { useRef, useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* =========================
   API Function (برا الكومبوننت)
========================= */
const uploadProfilePhoto = async (file) => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("tokenType");

  const formData = new FormData();
  formData.append("photo", file);

  const res = await axios.put(
    "https://route-posts.routemisr.com/users/upload-photo",
    formData,
    {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    },
  );

  return res.data;
};

export default function ChangeProfilePhoto() {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* =========================
     Cleanup Object URL
  ========================= */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* =========================
     Image Validation
  ========================= */
  function handleImageChange(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      toast.error("Image must be less than 4MB");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  /* =========================
     Mutation
  ========================= */
  const uploadMutation = useMutation({
    mutationFn: uploadProfilePhoto,

    onSuccess: () => {
      toast.success("Profile photo updated successfully ✅");

      // تحديث كل بيانات متعلقة باليوزر
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      navigate("/");
    },

    onError: () => {
      toast.error("Upload failed");
    },
  });

  /* =========================
     Upload Handler
  ========================= */
  function handleUpload() {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    uploadMutation.mutate(file);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 pt-24">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Change Profile Photo
        </h2>

        {/* Image Preview */}
        <div
          onClick={() => fileInputRef.current.click()}
          className="relative w-32 h-32 mx-auto rounded-full overflow-hidden 
                     border-4 border-cyan-500 shadow-lg cursor-pointer group"
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-3xl">
              <FaCamera />
            </div>
          )}

          <div
            className="absolute inset-0 bg-black/40 opacity-0 
                       group-hover:opacity-100 transition flex items-center justify-center"
          >
            <FaCamera className="text-white text-xl" />
          </div>
        </div>

        {/* Hidden Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          className={`w-full py-3 rounded-lg font-medium text-white transition ${
            uploadMutation.isPending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90"
          }`}
        >
          {uploadMutation.isPending ? "Uploading..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
