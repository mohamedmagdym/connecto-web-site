import React from "react";
import { FaFacebookF, FaTwitter, FaGithub, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-10 border-b border-white/10 pb-10">
          {/* Logo + Description */}
          <div>
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              conecto
            </h2>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Connect, share, and explore moments with your friends. Built with
              modern technologies for a smooth social experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {["Home", "Profile", "Explore", "Settings"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="hover:text-cyan-400 transition duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {[FaFacebookF, FaTwitter, FaGithub, FaLinkedinIn].map(
                (Icon, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 flex items-center justify-center rounded-full 
                               bg-white/5 backdrop-blur-md border border-white/10
                               hover:bg-cyan-500 hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    <Icon size={16} />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center text-xs text-gray-500 pt-6">
          © {new Date().getFullYear()} SocialApp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
