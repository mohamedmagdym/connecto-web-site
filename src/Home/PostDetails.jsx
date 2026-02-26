import axios from "axios";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PostSkeleton from "../PostSkeleton";

export default function PostDetails() {
  const { id } = useParams();

  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("tokenType");

  /* =========================
     Fetch Post
  ========================== */
  const fetchPost = async () => {
    const res = await axios.get(
      `https://route-posts.routemisr.com/posts/${id}`,
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      },
    );

    return res.data.data.post;
  };

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: fetchPost,
    enabled: !!id,
  });

  /* =========================
     Fetch Comments
  ========================== */
  const fetchComments = async () => {
    const res = await axios.get(
      `https://route-posts.routemisr.com/posts/${id}/comments`,
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      },
    );

    return res.data.data.comments;
  };

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: fetchComments,
    enabled: !!id,
  });

  /* =========================
     Loading State
  ========================== */
  if (postLoading)
    return (
      <div className="max-w-2xl mx-auto mt-24 space-y-6">
        <PostSkeleton />
      </div>
    );

  if (postError)
    return <div className="text-center mt-24">Error loading post</div>;

  /* =========================
     UI
  ========================== */
  return (
    <div className="max-w-2xl mx-auto mt-24 space-y-6">
      {/* ================= Post Card ================= */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <img
            src={post.user?.photo}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold dark:text-white">{post.user?.name}</h3>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Body */}
        <p className="text-gray-700 dark:text-gray-300">{post.body}</p>

        {/* Image */}
        {post.image && (
          <img
            src={post.image}
            alt=""
            className="w-full rounded-xl max-h-[500px] object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex justify-between text-sm text-gray-500 pt-2 border-t dark:border-gray-700">
          <span>👍 {post.likesCount} Likes</span>
          <span>💬 {post.commentsCount} Comments</span>
          <span>🔁 {post.sharesCount} Shares</span>
        </div>
      </div>

      {/* ================= Comments Section ================= */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg dark:text-white">
          Comments ({post.commentsCount})
        </h4>

        {commentsLoading ? (
          <>
            <PostSkeleton />
          </>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={comment.commentCreator?.photo}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-sm dark:text-white">
                  {comment.commentCreator?.name}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No comments yet</p>
        )}
      </div>
    </div>
  );
}
