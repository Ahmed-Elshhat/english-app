"use client";
import { useEffect, useState } from "react";
import { SignupFormState } from "../../Types/app";
import axios from "axios";
import { BASE_URL, SIGNUP } from "../../Api/Api";
import Link from "next/link";
import Cookie from "cookie-universal";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./signup.scss";

function Signup() {
  const [form, setForm] = useState<SignupFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const cookies = Cookie();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ msg: string; path?: string }[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (isSubmitted) {
      validateForm();
    }
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: { msg: string; path?: string }[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com)$/;

    // التحقق من الاسم
    if (!form.name.trim()) {
      newErrors.push({ msg: "Name is required", path: "name" });
    } else if (form.name.length < 3) {
      newErrors.push({
        msg: "Name must be at least 3 characters",
        path: "name",
      });
    }

    // التحقق من البريد الإلكتروني
    if (!form.email.trim()) {
      newErrors.push({ msg: "Email is required", path: "email" });
    } else if (!emailRegex.test(form.email)) {
      newErrors.push({
        msg: "Invalid email format (user@example.com)",
        path: "email",
      });
    }

    // التحقق من كلمة المرور
    if (!form.password.trim()) {
      newErrors.push({ msg: "Password is required", path: "password" });
    } else if (form.password.length < 6) {
      newErrors.push({
        msg: "Password must be at least 6 characters",
        path: "password",
      });
    }

    // التحقق من تأكيد كلمة المرور
    if (!form.confirmPassword.trim()) {
      newErrors.push({
        msg: "Confirm Password is required",
        path: "confirmPassword",
      });
    } else if (form.confirmPassword.length < 6) {
      newErrors.push({
        msg: "Confirm Password must be at least 6 characters",
        path: "confirmPassword",
      });
    } else if (form.confirmPassword !== form.password) {
      newErrors.push({
        msg: "Confirm Password must match Password",
        path: "confirmPassword",
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitted(true);

    if (!validateForm()) return;

    try {
      const res = await axios.post(`${BASE_URL}${SIGNUP}`, form);
      if (res.status === 201) {
        const token = res.data.token;
        cookies.set("ECT", token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 90,
          secure: false,
          sameSite: "lax",
        });
        window.location.href = "/";
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data?.message) {
          setErrors([{ msg: err.response.data.message }]);
        } else if (err.response.data?.errors) {
          setErrors(
            err.response.data.errors.map(
              (error: { msg: string; path: string }) => ({
                msg: error.msg,
                path: error.path,
              })
            )
          );
        }
      } else {
        console.error("Unexpected error:", err);
        setErrors([
          { msg: "An unexpected error occurred. Please try again later." },
        ]);
      }
    }
  };
  return (
    <div className="Signup">
      <div className="signup-box">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit}>
          <div className="name">
            <label htmlFor="name">Username</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.some((error) => error.path === "name" && isSubmitted) && (
              <p className="error-text">
                <span className="error-star">*</span>{" "}
                {errors.find((error) => error.path === "name")?.msg}
              </p>
            )}
          </div>

          <div className="email">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.some((error) => error.path === "email" && isSubmitted) && (
              <p className="error-text">
                <span className="error-star">*</span>{" "}
                {errors.find((error) => error.path === "email")?.msg}
              </p>
            )}
          </div>

          <div className="password">
            <label htmlFor="password">Password</label>
            <div className="cover">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />

              <button type="button" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.some(
              (error) => error.path === "password" && isSubmitted
            ) && (
              <p className="error-text">
                <span className="error-star">*</span>{" "}
                {errors.find((error) => error.path === "password")?.msg}
              </p>
            )}
          </div>

          <div className="confirmPassword">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="cover">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Enter confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />

              <button type="button" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.some(
              (error) => error.path === "confirmPassword" && isSubmitted
            ) && (
              <p className="error-text">
                <span className="error-star">*</span>{" "}
                {errors.find((error) => error.path === "confirmPassword")?.msg}
              </p>
            )}
          </div>

          {errors.some((error) => !error.path && isSubmitted) && (
            <div className="error-box">
              {errors
                .filter((error) => !error.path)
                .map((error, index) => (
                  <p key={index} className="error-text">
                    <span className="error-star">*</span> {error.msg}
                  </p>
                ))}
            </div>
          )}

          <button className="signup-btn">signup</button>

          <div className="or-divider">
            <div className="line"></div>
            <span>Or</span>
          </div>

          <a href={`${BASE_URL}/auth/google`} className="signup-google-btn">
            <FaGoogle />
            Signup with Google
          </a>

          <div className="login-section">
            <p>have an account?</p>
            <Link href="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
