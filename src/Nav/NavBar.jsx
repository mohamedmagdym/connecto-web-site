import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
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
    <>
      <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <NavLink
            to="/"
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Connecto
          </NavLink>

          {/* Desktop Links (لو مسجل دخول) */}
          {token && (
            <div className="hidden md:flex items-center gap-6 capitalize font-medium text-sm md:text-base">
              <NavLink
                to="/"
                className="text-white/80 hover:text-white transition"
              >
                Home
              </NavLink>
              <NavLink
                to="/profile"
                className="text-white/80 hover:text-white transition"
              >
                View Profile
              </NavLink>
              <NavLink
                to="/notfications"
                className="text-white/80 hover:text-white transition"
              >
                Notifications
              </NavLink>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {token ? (
              <>
                {/* Profile Desktop */}
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <img
                    src={user?.photo}
                    alt="profile"
                    onClick={() => setOpen(!open)}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-cyan-400 object-cover cursor-pointer hover:scale-105 transition"
                  />

                  {/* Dropdown */}
                  <div
                    className={`absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl p-4 transform transition-all duration-300 ${
                      open
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-4 pointer-events-none"
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
                        <p className="text-xs text-gray-500">
                          @{user?.username}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{user?.email}</p>

                    <div className="flex flex-col gap-2">
                      <Link
                        to="/profile"
                        className="w-full py-2 rounded-lg border border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition text-center"
                      >
                        Edit Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full py-2 rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenu(!mobileMenu)}
                  className="md:hidden text-cyan-400 text-2xl"
                >
                  {mobileMenu ? <FaTimes /> : <FaBars />}
                </button>
              </>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:flex gap-4">
                  <NavLink
                    to="/login"
                    className="px-5 py-2 border border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white transition"
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/signup"
                    className="px-5 py-2 text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
                  >
                    Register
                  </NavLink>
                </div>

                {/* Mobile */}
                <div className="flex md:hidden gap-3">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-sm border border-cyan-400 text-cyan-400 rounded-lg"
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/signup"
                    className="px-4 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600"
                  >
                    Register
                  </NavLink>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Overlay (خاص باليوزر المسجل فقط) */}
      {token && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-500 ${
            mobileMenu ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div
            className={`absolute top-0 right-0 w-72 h-full bg-slate-900 text-white p-6 flex flex-col gap-6 transform transition-transform duration-500 ${
              mobileMenu ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <NavLink to="/" onClick={() => setMobileMenu(false)}>
              Home
            </NavLink>
            <NavLink to="/profile" onClick={() => setMobileMenu(false)}>
              View Profile
            </NavLink>
            <NavLink to="/notfications" onClick={() => setMobileMenu(false)}>
              Notifications
            </NavLink>
            <button onClick={handleLogout} className="text-cyan-400 text-left">
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
