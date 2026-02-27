import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export default function CreatePost({ open, onClose }) {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const boxRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // cleanup preview url
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onBackdropClick(e) {
    if (boxRef.current && !boxRef.current.contains(e.target)) onClose?.();
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      e.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be less than 4MB");
      e.target.value = "";
      return;
    }

    setImage(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const tokenType = localStorage.getItem("tokenType");

      if (!body.trim() && !image) {
        throw new Error("Write something or upload an image");
      }

      const formData = new FormData();
      if (body.trim()) formData.append("body", body.trim());
      if (image) formData.append("image", image);

      const res = await axios.post(
        "https://route-posts.routemisr.com/posts",
        formData,
        {
          headers: {
            Authorization: `${tokenType} ${token}`,
          },
        },
      );

      return res.data;
    },

    onSuccess: () => {
      toast.success("Post created ✅");
      setBody("");
      setImage(null);
      setPreview(null);
      onClose?.();

      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create post";
      toast.error(msg);
      console.log("Create Post Error:", err?.response?.data || err);
    },
  });

  if (!open) return null;

  const disabled = createPostMutation.isPending || (!body.trim() && !image);

  return (
    <div
      onMouseDown={onBackdropClick}
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        ref={boxRef}
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Create Post</h3>
            <p className="text-xs text-gray-500">
              Share something with your friends
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[120px] resize-none border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-600">
              <span className="mr-2">🖼️</span> Optional image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm"
            />
          </div>

          {preview && (
            <div className="relative overflow-hidden rounded-2xl border">
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-[320px] object-cover"
              />
              <button
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
                className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-white/90 hover:bg-white border text-sm"
                type="button"
              >
                Remove
              </button>
            </div>
          )}

          {createPostMutation.isPending && (
            <p className="text-sm text-gray-500">Posting...</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
            type="button"
          >
            Cancel
          </button>

          <button
            disabled={disabled}
            onClick={() => createPostMutation.mutate()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
