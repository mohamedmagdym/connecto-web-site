import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ChangePassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [shownewPassword, setShownewPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const schema = z.object({
    password: z.string().min(8, "message must be at least 8 chars"),
    newPassword: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must contain uppercase, lowercase, number & special character",
      ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  async function onSubmit(formData) {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const tokenType = localStorage.getItem("tokenType");
      const { data } = await axios.patch(
        "https://route-posts.routemisr.com/users/change-password",
        formData,
        {
          headers: {
            Authorization: `${tokenType} ${token}`,
          },
        },
      );

      toast.success(data?.message || "password changed successfully ✅");
      console.log(data);

      if (data?.data?.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("tokenType", data.data.tokenType);
        navigate("/");
      }

      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 pt-24">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          ChangePassword{" "}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="old password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 
                         focus:bg-white focus:border-cyan-500 focus:ring-2 
                         focus:ring-cyan-200 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                    text-gray-500 hover:text-cyan-600 transition"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* newPassword */}
          <div className="relative">
            <input
              type={shownewPassword ? "text" : "password"}
              {...register("newPassword")}
              placeholder="newPassword"
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 bg-gray-50 
    focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShownewPassword(!shownewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-600 transition"
            >
              {shownewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            disabled={isLoading}
            type="submit"
            className={`w-full py-3 rounded-lg font-medium text-white 
              transition-all duration-300 flex justify-center items-center ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-cyan-600 to-blue-600 hover:opacity-90 active:scale-[.98]"
              }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "change"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
