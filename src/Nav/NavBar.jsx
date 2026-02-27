import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
        {/* Logo */}
        <NavLink
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
        >
          Connecto
        </NavLink>

        {token ? (
          <>
            {/* Middle Links */}
            <div className="flex items-center gap-6 capitalize font-medium">
              <NavLink
                to="/"
                className="text-gray-700   hover:bg-gradient-to-r  hover:from-cyan-600 hover:to-blue-600 hover:text-white p-3 rounded-2xl transition"
              >
                Home
              </NavLink>
              <NavLink
                to="/profile"
                className="text-gray-700   hover:bg-gradient-to-r  from-cyan-600 to-blue-600 hover:text-white p-3 rounded-2xl transition"
              >
                view Profile
              </NavLink>
              <NavLink
                to="/notfications"
                className="text-gray-700   hover:bg-gradient-to-r  from-cyan-600 to-blue-600 hover:text-white p-3 rounded-2xl transition"
              >
                Notfications
              </NavLink>
            </div>

            {/* Right Section */}
            <div className="relative" ref={dropdownRef}>
              <img
                src={user?.photo}
                alt="profile"
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full border-2 border-cyan-500 object-cover cursor-pointer hover:scale-105 transition"
              />

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 transition-all duration-300 ${
                  open
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-2 invisible"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user?.photo}
                    alt="profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {user?.name}
                    </h4>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{user?.email}</p>

                <div className="flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="w-full py-2 rounded-lg border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition text-center"
                  >
                    edit your profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2 rounded-lg text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex gap-4">
            <NavLink
              to="/login"
              className="px-5 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition"
            >
              Login
            </NavLink>

            <NavLink
              to="/signup"
              className="px-5 py-2 text-white rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 transition"
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
