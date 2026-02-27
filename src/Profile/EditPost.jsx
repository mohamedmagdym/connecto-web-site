import { useEffect, useState } from "react";

export default function EditPost({ open, onClose, post, onSave, isLoading }) {
  const [body, setBody] = useState("");

  useEffect(() => {
    if (open && post?.body) {
      setBody(post.body);
    }
  }, [open, post]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="font-semibold text-lg">Edit Post</h3>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(body)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
