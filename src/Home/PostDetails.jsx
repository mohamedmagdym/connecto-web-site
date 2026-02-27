import axios from "axios";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaRegHeart, FaRegCommentDots, FaShare } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-hot-toast";

import PostSkeleton from "../PostSkeleton";
import CommentSkeleton from "../CommentSkeleton";
import AddComment from "./AddComment";

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
   12h time format
========================= */
function formatTime12(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function PostDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [commentOpen, setCommentOpen] = useState(false);

  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("tokenType");

  /* =========================
     Fetch Post
  ========================== */
  const fetchPost = async () => {
    const res = await axios.get(
      `https://route-posts.routemisr.com/posts/${id}`,
      {
        headers: { Authorization: `${tokenType} ${token}` },
      },
    );

    return res.data.data.post;
  };

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
    error: postErrObj,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: fetchPost,
    enabled: !!id,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* =========================
     Fetch Comments
  ========================== */
  const fetchComments = async () => {
    const res = await axios.get(
      `https://route-posts.routemisr.com/posts/${id}/comments`,
      {
        headers: { Authorization: `${tokenType} ${token}` },
      },
    );

    return res.data.data.comments;
  };

  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsError,
    error: commentsErrObj,
  } = useQuery({
    queryKey: ["comments", id],
    queryFn: fetchComments,
    enabled: !!id,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* =========================
     Like/Unlike (same as Home)
     API returns: data.liked + data.likesCount
  ========================= */
  const likeMutation = useMutation({
    mutationFn: async ({ postId }) => {
      const res = await axios.put(
        `https://route-posts.routemisr.com/posts/${postId}/like`,
        null,
        {
          headers: { Authorization: `${tokenType} ${token}` },
        },
      );
      return res.data;
    },

    onMutate: async ({ postId, wasLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["post", id] });

      const previous = queryClient.getQueryData(["post", id]);

      queryClient.setQueryData(["post", id], (old) => {
        if (!old) return old;

        const nextLiked = !wasLiked;
        const nextCount = nextLiked
          ? (old.likesCount || 0) + 1
          : Math.max(0, (old.likesCount || 0) - 1);

        return { ...old, liked: nextLiked, likesCount: nextCount };
      });

      return { previous, postId };
    },

    onSuccess: (data, vars, ctx) => {
      console.log("✅ Like API response:", data);

      const apiLiked = data?.data?.liked;
      const apiCount = data?.data?.likesCount;

      queryClient.setQueryData(["post", id], (old) => {
        if (!old) return old;

        return {
          ...old,
          liked: typeof apiLiked === "boolean" ? apiLiked : old.liked,
          likesCount: typeof apiCount === "number" ? apiCount : old.likesCount,
        };
      });

      toast.success(apiLiked ? "Liked ✅" : "Unliked ✅");

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    },

    onError: (err, vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["post", id], ctx.previous);

      const msg =
        err?.response?.data?.message || err?.message || "Failed to like post";
      toast.error(msg);

      console.log("❌ Like API error:", err?.response?.data || err);
    },
  });

  /* =========================
     Loading / Error
  ========================== */
  if (postLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-slate-400 to-slate-800 pt-24 pb-10">
        <div className="max-w-2xl mx-auto space-y-6 px-4">
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="text-center mt-24 text-red-500 font-medium">
        {postErrObj?.response?.data?.message ||
          postErrObj?.message ||
          "Error loading post"}
      </div>
    );
  }

  const postId = post?._id || post?.id;
  const isLikedByMe = !!post?.liked;

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-400 to-slate-800 pt-24 pb-10">
      <div className="max-w-2xl mx-auto space-y-6 px-4">
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-800">Post Details</h2>
          <p className="text-xs text-gray-500">
            View the post and its comments
          </p>
        </div>

        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 via-white to-white border-b border-gray-100 group-hover:from-blue-100 transition-all duration-300">
            <img
              src={post.user?.photo}
              alt={post.user?.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md hover:scale-105 transition"
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
          </div>

          {/* Body */}
          {post.body && (
            <div className="px-4 py-4 bg-gray-50 border-l-4 border-blue-400">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {post.body}
              </p>
            </div>
          )}

          {post.image && (
            <div className="overflow-hidden bg-black/5">
              <img
                src={post.image}
                alt="post"
                className="w-full max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          )}

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

              {post.commentsCount > 1 && (
                <p className="text-sm text-blue-600 mt-2 hover:underline">
                  View all {post.commentsCount} comments
                </p>
              )}
            </div>
          )}

          {/* Actions (same as Home) */}
          <div className="flex border-t bg-white text-gray-600">
            {/* Like */}
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

            {/* Comment */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCommentOpen(true);
              }}
              className="flex-1 flex justify-center items-center gap-2 py-3 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
              type="button"
            >
              <FaRegCommentDots /> Comment
            </button>

            {/* Share */}
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

        {/* Add Comment Modal */}
        <AddComment
          open={commentOpen}
          onClose={() => setCommentOpen(false)}
          postId={id}
          postUserName={post?.user?.name}
        />

        {/* Comments Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-white">
            Comments ({post.commentsCount})
          </h4>

          {commentsLoading ? (
            <div className="space-y-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <CommentSkeleton key={i} />
                ))}
            </div>
          ) : commentsError ? (
            <p className="text-red-200 text-sm">
              {commentsErrObj?.response?.data?.message ||
                commentsErrObj?.message ||
                "Failed to load comments"}
            </p>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => {
              const isSelected = selectedCommentId === comment._id;

              return (
                <div
                  key={comment._id}
                  onClick={() => setSelectedCommentId(comment._id)}
                  className={`bg-white/95 p-4 rounded-2xl shadow-sm space-y-3 cursor-pointer transition
                    ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50/70"
                        : "hover:bg-white"
                    }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={comment.commentCreator?.photo}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />

                      <div className="leading-tight">
                        <p className="font-semibold text-sm text-gray-800">
                          {comment.commentCreator?.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          @{comment.commentCreator?.username} •{" "}
                          {timeAgo(comment.createdAt)} •{" "}
                          {formatTime12(comment.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right text-xs text-gray-500">
                      <p>❤️ {comment.likes?.length || 0}</p>
                      <p>↩️ {comment.repliesCount || 0}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {comment.content}
                  </p>

                  {/* Image */}
                  {comment.image && (
                    <img
                      src={comment.image}
                      alt=""
                      className="w-full max-h-[350px] object-cover rounded-xl"
                    />
                  )}

                  {isSelected && (
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Like comment:", comment._id);
                        }}
                      >
                        Like
                      </button>

                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Reply to:", comment._id);
                        }}
                      >
                        Reply
                      </button>

                      <button
                        type="button"
                        className="ml-auto text-sm text-red-500 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCommentId(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-200 text-sm">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
