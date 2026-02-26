import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* =========================
   Validation Schema
========================= */
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/* =========================
   API Function
========================= */
const loginUser = async (formData) => {
  const { data } = await axios.post(
    "https://route-posts.routemisr.com/users/signin",
    formData,
  );
  return data;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  /* =========================
     Mutation
  ========================= */
  const loginMutation = useMutation({
    mutationFn: loginUser,

    onSuccess: async (data) => {
      toast.success(data?.message || "Logged in successfully ✅");

      if (data?.data?.token) {
        // 🔥 نمسح أي cache قديم (مهم لو كان في user تاني)
        queryClient.clear();

        // 🔐 نخزن التوكن
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("tokenType", data.data.tokenType);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // نعمل prefetch للبيانات المهمة
        await queryClient.invalidateQueries();

        navigate("/");
      }
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  function onSubmit(formData) {
    loginMutation.mutate(formData);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 pt-24">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Welcome back
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              {...register("email")}
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 
                         focus:bg-white focus:border-cyan-500 focus:ring-2 
                         focus:ring-cyan-200 outline-none transition"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 bg-gray-50 
                         focus:bg-white focus:border-cyan-500 focus:ring-2 
                         focus:ring-cyan-200 outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-600 transition"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            disabled={loginMutation.isPending}
            type="submit"
            className={`w-full py-3 rounded-lg font-medium text-white 
              transition-all duration-300 flex justify-center items-center ${
                loginMutation.isPending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 active:scale-[.98]"
              }`}
          >
            {loginMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>

          <p className="text-center text-sm text-gray-500 pt-2">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-cyan-600 hover:text-cyan-700 font-medium transition"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
