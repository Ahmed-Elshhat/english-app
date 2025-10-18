"use client";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import Cookie from "cookie-universal";
import { SignupFormState } from "../../../Types/app";
import { BASE_URL, SIGNUP } from "../../../Api/Api";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./signup.scss";

function Signup() {
  // State to store form input values for signup
  const [form, setForm] = useState<SignupFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Cookie instance used to store the authentication token after signup
  const cookies = Cookie();

  // State to toggle password visibility between text and hidden
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // State to store all validation or server-side error messages
  const [errors, setErrors] = useState<{ msg: string; path?: string }[]>([]);

  // State to track if the form has been submitted (to revalidate dynamically)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Whenever the form changes and has been submitted before, re-run validation
  useEffect(() => {
    if (isSubmitted) {
      validateForm();
    }
  }, [form]);

  // Update form state whenever an input value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validate form fields before submitting
  const validateForm = () => {
    const newErrors: { msg: string; path?: string }[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com)$/;

    // Validate name field
    if (!form.name.trim()) {
      newErrors.push({ msg: "Name is required", path: "name" });
    } else if (form.name.length < 3) {
      newErrors.push({
        msg: "Name must be at least 3 characters",
        path: "name",
      });
    }

    // Validate email field
    if (!form.email.trim()) {
      newErrors.push({ msg: "Email is required", path: "email" });
    } else if (!emailRegex.test(form.email)) {
      newErrors.push({
        msg: "Invalid email format (user@example.com)",
        path: "email",
      });
    }

    // Validate password field
    if (!form.password.trim()) {
      newErrors.push({ msg: "Password is required", path: "password" });
    } else if (form.password.length < 6) {
      newErrors.push({
        msg: "Password must be at least 6 characters",
        path: "password",
      });
    }

    // Validate confirm password field
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

    // Update error state
    setErrors(newErrors);

    // Return true if no errors exist
    return newErrors.length === 0;
  };

  // Toggle visibility of password fields
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle signup form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default page reload
    setErrors([]); // Clear previous errors
    setIsSubmitted(true); // Mark form as submitted

    // Stop submission if form is invalid
    if (!validateForm()) return;

    try {
      // Send signup request to backend API
      const res = await axios.post(`${BASE_URL}${SIGNUP}`, form);

      // If successful signup (status 201)
      if (res.status === 201) {
        const token = res.data.token;

        // Save the token in cookies for authentication
        cookies.set("ARL", token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 90, // 90 days
          secure: false,
          sameSite: "lax",
        });

        // Show success toast notification
        toast.success("Account created successfully! Welcome aboard.");

        // Redirect user to main page after successful signup
        window.location.href = "/playlists/series";
      }
    } catch (err) {
      // Handle any Axios or server errors gracefully
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data?.message) {
          // Single error message from backend
          setErrors([{ msg: err.response.data.message }]);
        } else if (err.response.data?.errors) {
          // Multiple validation errors from backend
          setErrors(
            err.response.data.errors.map(
              (error: { msg: string; path: string }) => ({
                msg: error.msg,
                path: error.path,
              })
            )
          );
        } else if (err.response.data) {
          setErrors([{ msg: err.response.data }]);
        }
      } else {
        // Handle unexpected or unknown errors
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
          {/* name */}
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

          {/* email */}
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

          {/* password */}
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

          {/* confirm password */}
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

          {/* general errors */}
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

          {/* signup button */}
          <button className="signup-btn">signup</button>

          <div className="or-divider">
            <div className="line"></div>
            <span>Or</span>
          </div>

          {/* signup with google button */}
          <a href={`${BASE_URL}/auth/google`} className="signup-google-btn">
            <FaGoogle />
            Signup with Google
          </a>

          <div className="login-section">
            <p>have an account?</p>
            <Link href="/auth/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
