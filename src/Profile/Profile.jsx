import React from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <div className="mt-24 w-[50%] mx-auto">
        <div className="flex items-center gap-3 mb-3 justify-center">
          <img
            src={user?.photo}
            alt="profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-800">{user?.name}</h4>
            <p className="text-xs text-gray-500">@{user?.username}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to="/changeprofilephoto"
            className="w-full py-2 rounded-lg border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition text-center"
          >
            change profile photo
          </Link>
          <Link
            to="/changepassword"
            className="w-full py-2 rounded-lg border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition text-center"
          >
            change password
          </Link>
        </div>
      </div>
    </div>
  );
}
