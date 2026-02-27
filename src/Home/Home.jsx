import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaRegHeart, FaRegCommentDots, FaShare } from "react-icons/fa";
import PostSkeleton from "../PostSkeleton";
import { Link } from "react-router-dom";
import AddComment from "./AddComment";
import { useState } from "react";
import RightAside from "./RightAside";
import CreatePost from "./CreatePost";
import { toast } from "react-hot-toast";

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
   Fetch Posts
========================= */
const fetchPosts = async () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("tokenType");

  const res = await axios.get("https://route-posts.routemisr.com/posts", {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  });

  return res.data.data.posts;
};

export default function Home() {
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [activePost, setActivePost] = useState(null);

  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* =========================
     Like/Unlike
     API returns: data.liked + data.likesCount
  ========================= */
  const likeMutation = useMutation({
    mutationFn: async ({ postId }) => {
      const token = localStorage.getItem("token");
      const tokenType = localStorage.getItem("tokenType");

      const res = await axios.put(
        `https://route-posts.routemisr.com/posts/${postId}/like`,
        null,
        {
          headers: { Authorization: `${tokenType} ${token}` },
        },
      );

      return res.data; // {success, message, data:{liked, likesCount, post}}
    },

    // ✅ Optimistic
    onMutate: async ({ postId, wasLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previous = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old) => {
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

      queryClient.setQueryData(["posts"], (old) => {
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
    },

    onError: (err, vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["posts"], ctx.previous);

      const msg =
        err?.response?.data?.message || err?.message || "Failed to like post";
      toast.error(msg);

      console.log("❌ Like API error:", err?.response?.data || err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  if (isError)
    return (
      <div className="text-center text-red-500 mt-24 font-medium">
        {error?.message || "Failed to load posts"}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-400 to-slate-800 pt-24 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Feed */}
          <div className="space-y-4 min-w-0">
            {/* Create Post Header */}
            <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm p-4 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-800 truncate">
                  Home Feed
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Create a new post and share it with others
                </p>
              </div>

              <button
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                type="button"
              >
                + Create Post
              </button>
            </div>

            {isLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => <PostSkeleton key={i} />)
              : posts?.map((post) => {
                  const postId = post._id || post.id;

                  const isLikedByMe = !!post.liked;

                  return (
                    <div
                      key={postId}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <Link to={`/post/${post.id}`}>
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
                              @{post.user?.username} • {timeAgo(post.createdAt)}{" "}
                              • {post.privacy}
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

                          {post.commentsCount > 1 && (
                            <p className="text-sm text-blue-600 mt-2 cursor-pointer hover:underline">
                              <Link
                                to={`/post/${post._id}`}
                                className="text-sm text-blue-600 mt-2 cursor-pointer hover:underline"
                              >
                                View all {post.commentsCount} comments
                              </Link>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex border-t bg-white text-gray-600">
                        {/*  Like: قلب يتملى أحمر */}
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
                            setActivePost(post);
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
                  );
                })}
          </div>

          {/* Right Aside */}
          <RightAside  />
        </div>
      </div>

      {/* CreatePost Modal */}
      <CreatePost open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* AddComment Modal */}
      <AddComment
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        postId={activePost?._id || activePost?.id}
        postUserName={activePost?.user?.name}
      />
    </div>
  );
}
