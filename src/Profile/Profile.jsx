import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentDots,
  FaShare,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-hot-toast";
import PostSkeleton from "../PostSkeleton";
import AddComment from "./../Home/AddComment";
import EditPost from "./EditPost";

/* =========================
   Time Ago
========================= */
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (let key in intervals) {
    const interval = Math.floor(seconds / intervals[key]);
    if (interval >= 1) {
      return interval === 1 ? `1 ${key} ago` : `${interval} ${key}s ago`;
    }
  }

  return "Just now";
}

/* =========================
   Fetch User Posts
========================= */
const fetchUserPosts = async (userId) => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("tokenType");

  const res = await axios.get(
    `https://route-posts.routemisr.com/users/${userId}/posts`,
    {
      headers: { Authorization: `${tokenType} ${token}` },
    },
  );

  return res.data?.data?.posts || res.data?.data || [];
};

export default function Profile() {
  const queryClient = useQueryClient();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;

  const [commentOpen, setCommentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activePost, setActivePost] = useState(null);

  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* =========================
     Like/Unlike (SAME AS HOME)
     Optimistic + Sync response
  ========================= */
  const likeMutation = useMutation({
    mutationFn: async ({ postId }) => {
      const token = localStorage.getItem("token");
      const tokenType = localStorage.getItem("tokenType");

      const res = await axios.put(
        `https://route-posts.routemisr.com/posts/${postId}/like`,
        null,
        { headers: { Authorization: `${tokenType} ${token}` } },
      );

      return res.data; // {success, message, data:{liked, likesCount, post}}
    },

    onMutate: async ({ postId, wasLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["userPosts", userId] });

      const previous = queryClient.getQueryData(["userPosts", userId]);

      queryClient.setQueryData(["userPosts", userId], (old) => {
        if (!old) return old;

        return old.map((p) => {
          const pid = p._id || p.id;
          if (pid !== postId) return p;

          const nextLiked = !wasLiked;
          const nextCount = nextLiked
            ? (p.likesCount || 0) + 1
            : Math.max(0, (p.likesCount || 0) - 1);

          return { ...p, liked: nextLiked, likesCount: nextCount };
        });
      });

      return { previous, postId };
    },

    onSuccess: (data, vars, ctx) => {
      console.log("✅ Like API response:", data);

      const apiLiked = data?.data?.liked;
      const apiCount = data?.data?.likesCount;

      queryClient.setQueryData(["userPosts", userId], (old) => {
        if (!old) return old;

        return old.map((p) => {
          const pid = p._id || p.id;
          if (pid !== ctx.postId) return p;

          return {
            ...p,
            liked: typeof apiLiked === "boolean" ? apiLiked : p.liked,
            likesCount: typeof apiCount === "number" ? apiCount : p.likesCount,
          };
        });
      });

      toast.success(apiLiked ? "Liked ✅" : "Unliked ✅");

      // sync global feed if you want
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (err, vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["userPosts", userId], ctx.previous);

      const msg =
        err?.response?.data?.message || err?.message || "Failed to like post";
      toast.error(msg);

      console.log("❌ Like API error:", err?.response?.data || err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
    },
  });

  /* =========================
     Edit Mutation
  ========================= */
  const editMutation = useMutation({
    mutationFn: async ({ postId, body }) => {
      const token = localStorage.getItem("token");
      const tokenType = localStorage.getItem("tokenType");

      const res = await axios.put(
        `https://route-posts.routemisr.com/posts/${postId}`,
        { body },
        { headers: { Authorization: `${tokenType} ${token}` } },
      );

      return res.data;
    },

    onSuccess: () => {
      toast.success("Post updated ✅");
      queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setEditOpen(false);
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update post");
    },
  });

  /* =========================
     Delete Mutation
  ========================= */
  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      const token = localStorage.getItem("token");
      const tokenType = localStorage.getItem("tokenType");

      const res = await axios.delete(
        `https://route-posts.routemisr.com/posts/${postId}`,
        { headers: { Authorization: `${tokenType} ${token}` } },
      );

      console.log("🗑 Delete Response:", res.data);
      return res.data;
    },

    onSuccess: () => {
      toast.success("Post deleted ✅");
      queryClient.invalidateQueries({ queryKey: ["userPosts", userId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setDeleteOpen(false);
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete post");
    },
  });

  if (!userId) {
    return (
      <div className="min-h-screen pt-24 text-center text-red-500 font-medium">
        Missing user data in localStorage.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-24 text-center text-red-500 font-medium">
        {error?.response?.data?.message || error?.message || "Failed to load"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-400 to-slate-800 pt-24 pb-10">
      <div className="max-w-2xl mx-auto space-y-6 px-4">
        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3 justify-center">
            <img
              src={user?.photo}
              alt="profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
            />
            <div>
              <h4 className="font-semibold text-gray-800">{user?.name}</h4>
              <p className="text-xs text-gray-500">@{user?.username}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Link
              to="/changeprofilephoto"
              className="w-full py-2 rounded-xl border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition text-center"
            >
              Change profile photo
            </Link>
            <Link
              to="/changepassword"
              className="w-full py-2 rounded-xl border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition text-center"
            >
              Change password
            </Link>
          </div>
        </div>

        {/* User Posts Header */}
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-800">Your Posts</h2>
          <p className="text-xs text-gray-500">
            Showing posts created by you (API)
          </p>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <PostSkeleton key={i} />
              ))}
          </div>
        ) : posts?.length ? (
          <div className="space-y-4">
            {posts.map((post) => {
              const postId = post._id || post.id;
              const isLikedByMe = !!post.liked;

              return (
                <div
                  key={postId}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* ✅ PostDetails Link (SAME IDEA AS HOME) */}
                  <Link to={`/post/${postId}`}>
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 via-white to-white border-b border-gray-100 group-hover:from-blue-100 transition-all duration-300">
                      <img
                        src={post.user?.photo}
                        alt={post.user?.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                          {post.user?.name}
                        </h3>

                        <p className="text-xs text-gray-400">
                          @{post.user?.username} • {timeAgo(post.createdAt)} •{" "}
                          {post.privacy}
                        </p>
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActivePost(post);
                          setEditOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium 
               bg-blue-50 text-blue-600 rounded-full
               hover:bg-blue-100 hover:text-blue-700
               transition-all duration-200"
                        type="button"
                      >
                        ✏️ Edit
                      </button>

                      {/* Delete Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActivePost(post);
                          setDeleteOpen(true);
                        }}
                        className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                        type="button"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>

                    {/* Body */}
                    {post.body && (
                      <div className="px-4 py-4 bg-gray-50 border-l-4 border-blue-400">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {post.body}
                        </p>
                      </div>
                    )}

                    {/* Image */}
                    {post.image && (
                      <div className="overflow-hidden bg-black/5">
                        <img
                          src={post.image}
                          alt="post"
                          className="w-full max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}
                  </Link>

                  {/* Stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500 px-4 py-2 border-t bg-gray-50">
                    <span className="hover:text-red-500 transition cursor-pointer">
                      ❤️ {post.likesCount}
                    </span>

                    <div className="flex gap-4">
                      <span className="hover:text-blue-600 cursor-pointer transition">
                        {post.commentsCount} Comments
                      </span>
                      <span className="hover:text-blue-600 cursor-pointer transition">
                        {post.sharesCount} Shares
                      </span>
                    </div>
                  </div>

                  {/* Top Comment */}
                  {post.topComment && (
                    <div className="px-4 py-3 border-t bg-gray-100">
                      <div className="flex gap-2 items-start">
                        <img
                          src={post.topComment.commentCreator?.photo}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />

                        <div className="bg-white px-3 py-2 rounded-xl shadow-sm w-full hover:shadow-md transition">
                          <p className="text-sm font-semibold text-gray-800">
                            {post.topComment.commentCreator?.name}
                          </p>

                          <p className="text-sm text-gray-600">
                            {post.topComment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex border-t bg-white text-gray-600">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        likeMutation.mutate({
                          postId,
                          wasLiked: isLikedByMe,
                        });
                      }}
                      className={
                        "flex-1 flex justify-center items-center gap-2 py-3 hover:bg-gray-100 transition-all duration-200 " +
                        (isLikedByMe
                          ? "text-red-500"
                          : "text-gray-600 hover:text-red-500")
                      }
                    >
                      {isLikedByMe ? <FaHeart /> : <FaRegHeart />} Like
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActivePost(post);
                        setCommentOpen(true);
                      }}
                      className="flex-1 flex justify-center items-center gap-2 py-3 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
                      type="button"
                    >
                      <FaRegCommentDots /> Comment
                    </button>

                    <button
                      className="flex-1 flex justify-center items-center gap-2 py-3 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <FaShare /> Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm p-4">
            <p className="text-sm text-gray-600">No posts yet.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">
              Delete this post?
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  deleteMutation.mutate(activePost?._id || activePost?.id)
                }
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                type="button"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AddComment Modal */}
      <AddComment
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        postId={activePost?._id || activePost?.id}
        postUserName={activePost?.user?.name}
      />

      {/* Edit Modal */}
      <EditPost
        open={editOpen}
        onClose={() => setEditOpen(false)}
        post={activePost}
        onSave={(newBody) =>
          editMutation.mutate({
            postId: activePost?._id || activePost?.id,
            body: newBody,
          })
        }
        isLoading={editMutation.isPending}
      />
    </div>
  );
}
