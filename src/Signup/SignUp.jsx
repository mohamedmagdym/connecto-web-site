import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* =========================
   Validation Schema
========================= */
const schema = z
  .object({
    name: z
      .string()
      .min(4, "Minimum 4 characters")
      .max(20, "Maximum 20 characters"),

    username: z.string().min(3, "Minimum 3 characters"),

    email: z.string().email("Invalid email"),

    password: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must contain uppercase, lowercase, number & special character",
      ),

    rePassword: z.string(),

    dateOfBirth: z
      .string()
      .min(1, "Date is required")
      .refine((value) => {
        const birth = new Date(value);
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();

        const monthDiff = today.getMonth() - birth.getMonth();
        const dayDiff = today.getDate() - birth.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }

        return age >= 8;
      }, "You must be at least 8 years old"),
    gender: z.enum(["male", "female"], {
      required_error: "Gender is required",
    }),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  /* =========================
     Password Strength Logic
  ========================= */
  const passwordValue = watch("password");

  React.useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (passwordValue.length >= 8) strength++;
    if (/[A-Z]/.test(passwordValue)) strength++;
    if (/[0-9]/.test(passwordValue)) strength++;
    if (/[#?!@$%^&*-]/.test(passwordValue)) strength++;

    setPasswordStrength(strength);
  }, [passwordValue]);

  /* =========================
     Submit
  ========================= */
  async function getAlldata(formData) {
    try {
      setLoading(true);

      const { data } = await axios.post(
        "https://route-posts.routemisr.com/users/signup",
        formData,
      );

      toast.success(data?.message || "Account created successfully 🎉");
      reset();
      nav("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Email already exists or error occurred",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 pt-24">
      <div className="w-full max-w-md bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl p-8 animate-fade-in">
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 text-center mb-6">
          Create your account
        </h2>

        <form onSubmit={handleSubmit(getAlldata)} className="space-y-4">
          {/* Name */}
          <InputField
            register={register}
            name="name"
            placeholder="Full Name"
            error={errors.name}
          />

          {/* Username */}
          <InputField
            register={register}
            name="username"
            placeholder="Username"
            error={errors.username}
          />

          {/* Email */}
          <InputField
            register={register}
            name="email"
            type="email"
            placeholder="Email Address"
            error={errors.email}
          />

          {/* Password */}
          <PasswordField
            label="Password"
            register={register}
            name="password"
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          {/* Strength Bar */}
          {passwordValue && (
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  passwordStrength <= 1
                    ? "bg-red-500 w-1/4"
                    : passwordStrength === 2
                      ? "bg-yellow-500 w-2/4"
                      : passwordStrength === 3
                        ? "bg-blue-500 w-3/4"
                        : "bg-green-500 w-full"
                }`}
              ></div>
            </div>
          )}

          {/* Confirm Password */}
          <PasswordField
            label="Confirm Password"
            register={register}
            name="rePassword"
            show={showRePassword}
            toggle={() => setShowRePassword(!showRePassword)}
            error={errors.rePassword}
          />

          {/* Date */}
          <InputField
            register={register}
            name="dateOfBirth"
            type="date"
            error={errors.dateOfBirth}
          />

          {/* Gender */}
          <div className="flex gap-6 text-sm text-gray-600">
            {["male", "female"].map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={g}
                  {...register("gender")}
                  className="w-4 h-4 accent-cyan-600"
                />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="text-red-500 text-xs">{errors.gender.message}</p>
          )}

          {/* Submit */}
          <button
            disabled={isLoading}
            type="submit"
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex justify-center items-center ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 active:scale-[.98]"
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   Reusable Input Component
========================= */
function InputField({ register, name, type = "text", placeholder, error }) {
  return (
    <div>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

/* =========================
   Password Component
========================= */
function PasswordField({ register, name, show, toggle, error, label }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        {...register(name)}
        placeholder={label}
        className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition"
      />

      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-600 transition"
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}
