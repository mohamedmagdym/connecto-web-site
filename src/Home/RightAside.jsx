import axios from "axios";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const fetchSuggestions = async (limit = 10) => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("tokenType");

  const res = await axios.get(
    `https://route-posts.routemisr.com/users/suggestions?limit=${limit}`,
    {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    },
  );


  const data = res.data?.data;
  return data?.users || data?.suggestions || data || [];
};

function AvatarFallback({ name }) {
  const initials = (name || "User")
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-semibold">
      {initials}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="min-w-0 space-y-2">
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-8 w-20 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}

export default function RightAside({ limit = 10 }) {
  const [sent, setSent] = useState(() => new Set()); 

  const {
    data: people,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suggestions", limit],
    queryFn: () => fetchSuggestions(limit),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const normalized = useMemo(() => {
    const arr = Array.isArray(people) ? people : [];
    return arr.map((u) => ({
      id: u._id || u.id,
      name: u.name || "Unknown",
      username: u.username ? `@${u.username}` : "@user",
      photo: u.photo || u.profilePhoto || u.avatar || null,
      mutual: u.mutualFriendsCount || u.mutual || 0,
    }));
  }, [people]);

  function handleAdd(id, name) {
    setSent((prev) => {
      const next = new Set(prev);
      const isSent = next.has(id);

      if (isSent) {
        next.delete(id);
        toast.success("Request cancelled");
      } else {
        next.add(id);
        toast.success(`Request sent to ${name}`);
      }
      return next;
    });
  }

  return (
    <aside className="hidden xl:block w-[340px] shrink-0">
      <div className="sticky top-24 space-y-4">
        {/* Card: Suggestions */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-800">People you may know</h3>
            <p className="text-xs text-gray-500">
              Live suggestions (API) • limit: {limit}
            </p>
          </div>

          <div className="p-3 space-y-2">
            {isLoading ? (
              <>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <RowSkeleton key={i} />
                  ))}
              </>
            ) : isError ? (
              <div className="p-3">
                <p className="text-sm text-red-500">
                  {error?.response?.data?.message ||
                    error?.message ||
                    "Failed to load suggestions"}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Retry
                </button>
              </div>
            ) : normalized.length === 0 ? (
              <p className="text-sm text-gray-500 p-3">
                No suggestions right now.
              </p>
            ) : (
              normalized.map((p) => {
                const isSent = sent.has(p.id);

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      {p.photo ? (
                        <img
                          src={p.photo}
                          alt={p.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback name={p.name} />
                      )}

                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {p.username}
                          {p.mutual ? ` • ${p.mutual} mutual` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleAdd(p.id, p.name)}
                      className={
                        "px-3 py-1.5 rounded-xl text-sm font-medium transition border " +
                        (isSent
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                          : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600")
                      }
                      type="button"
                    >
                      {isSent ? "Requested" : "Add"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-3 border-t flex items-center justify-between">
            <button
              className="text-sm text-blue-600 hover:underline"
              type="button"
              onClick={() => toast("Later: Navigate to suggestions page")}
            >
              See more
            </button>

            <button
              className="text-sm text-gray-600 hover:underline"
              type="button"
              onClick={() => refetch()}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Card: Tip */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-sm text-gray-700 font-medium">Tip</p>
          <p className="text-xs text-gray-500 mt-1">
            These suggestions are fetched from the backend. The “Add” button is
            UI-only for now unless you connect a follow/friend API.
          </p>
        </div>
      </div>
    </aside>
  );
}
