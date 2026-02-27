import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import PostSkeleton from "../PostSkeleton";

/* TimeAgo */
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
    if (interval >= 1)
      return interval === 1 ? `1 ${key} ago` : `${interval} ${key}s ago`;
  }
  return "Just now";
}

const fetchUserPosts = async (userId) => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("tokenType");

  const res = await axios.get(
    `https://route-posts.routemisr.com/users/${userId}/posts`,
    { headers: { Authorization: `${tokenType} ${token}` } },
  );

  console.log("✅ PostUser Posts API response:", res.data);
  return res.data?.data?.posts || res.data?.data || [];
};

export default function PostUser() {
  const { userId } = useParams();

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
        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-800">User Posts</h2>
          <p className="text-xs text-gray-500">UserId: {userId}</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <PostSkeleton key={i} />
              ))}
          </div>
        ) : posts?.length ? (
          posts.map((post) => (
            <div
              key={post._id || post.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 via-white to-white border-b border-gray-100">
                <img
                  src={post.user?.photo}
                  alt={post.user?.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {post.user?.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    @{post.user?.username} • {timeAgo(post.createdAt)} •{" "}
                    {post.privacy}
                  </p>
                </div>
              </div>

              {post.body && (
                <div className="px-4 py-4 bg-gray-50 border-l-4 border-blue-400">
                  <p className="text-gray-700 whitespace-pre-line">
                    {post.body}
                  </p>
                </div>
              )}

              {post.image && (
                <div className="overflow-hidden bg-black/5">
                  <img
                    src={post.image}
                    alt="post"
                    className="w-full max-h-[400px] object-contain"
                  />
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500 px-4 py-2 border-t bg-gray-50">
                <span>❤️ {post.likesCount}</span>
                <div className="flex gap-4">
                  <span>{post.commentsCount} Comments</span>
                  <span>{post.sharesCount} Shares</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm p-4">
            <p className="text-sm text-gray-600">No posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
