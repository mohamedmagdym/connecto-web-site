import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export default function AddComment({ open, onClose, postId, postUserName }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const boxRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function onBackdropClick(e) {
    if (boxRef.current && !boxRef.current.contains(e.target)) onClose?.();
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
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
  }

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const tokenType = localStorage.getItem("tokenType");

      if (!postId) throw new Error("Missing postId");
      if (!content.trim()) throw new Error("Comment content is required");

      const formData = new FormData();
      formData.append("content", content.trim());
      if (image) formData.append("image", image); // ✅ نفس اسم الـ API docs

      const res = await axios.post(
        `https://route-posts.routemisr.com/posts/${postId}/comments`,
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
      toast.success("Comment added ✅");
      setContent("");
      setImage(null);
      onClose?.();

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },

    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to add comment";
      toast.error(msg);
      console.log("Create Comment Error:", err?.response?.data || err);
    },
  });

  if (!open) return null;

  const disabled = !content.trim() || addCommentMutation.isPending;

  return (
    <div
      onMouseDown={onBackdropClick}
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        ref={boxRef}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Add Comment</h3>
            <p className="text-xs text-gray-500">
              Commenting on {postUserName || "this post"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment..."
            className="w-full min-h-[120px] resize-none border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Image */}
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

          {image && (
            <div className="text-xs text-gray-500 flex items-center justify-between">
              <span>
                Selected: <span className="font-medium">{image.name}</span>
              </span>
              <button
                onClick={() => setImage(null)}
                className="text-red-500 hover:underline"
                type="button"
              >
                Remove
              </button>
            </div>
          )}

          {addCommentMutation.isPending && (
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
            onClick={() => addCommentMutation.mutate()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {addCommentMutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
