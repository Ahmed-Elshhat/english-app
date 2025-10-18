"use client";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import Cookie from "cookie-universal";
import { LoginFormState } from "../../../Types/app";
import { BASE_URL, LOGIN } from "../../../Api/Api";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./login.scss";

function Login() {
  // State to store form data (email & password)
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  // Cookie instance to manage authentication token
  const cookies = Cookie();

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // State to store form validation or server errors
  const [errors, setErrors] = useState<{ msg: string; path?: string }[]>([]);

  // State to check if the form has been submitted at least once
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Re-validate form whenever input changes after first submission
  useEffect(() => {
    if (isSubmitted) {
      validateForm();
    }
  }, [form]);

  // Handle input change and update corresponding field in state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validate form inputs before submitting
  const validateForm = () => {
    const newErrors: { msg: string; path?: string }[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com)$/;

    // Validate email
    if (!form.email.trim()) {
      newErrors.push({ msg: "Email is required", path: "email" });
    } else if (!emailRegex.test(form.email)) {
      newErrors.push({
        msg: "Invalid email format (user@example.com)",
        path: "email",
      });
    }

    // Validate password
    if (!form.password.trim()) {
      newErrors.push({ msg: "Password is required", path: "password" });
    } else if (form.password.length < 6) {
      newErrors.push({
        msg: "Password must be at least 6 characters",
        path: "password",
      });
    }

    // Update errors state
    setErrors(newErrors);

    // Return true if no validation errors
    return newErrors.length === 0;
  };

  // Toggle password visibility between text and password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission (login)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setErrors([]);
    setIsSubmitted(true);

    // Run validation before sending request
    if (!validateForm()) return;

    try {
      // Send login request to backend
      const res = await axios.post(`${BASE_URL}${LOGIN}`, form);

      if (res.status === 200) {
        // Save token in cookies for authentication
        const token = res.data.token;
        cookies.set("ARL", token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 90, // 90 days
          secure: false,
          sameSite: "lax",
        });

        // Show success toast notification
        toast.success("Login successful! Welcome back.");

        // Redirect to protected route after successful login
        window.location.href = "/playlists/series";
      }
    } catch (err) {
      // Handle Axios and server validation errors
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data?.message) {
          // Single error message from server
          setErrors([{ msg: err.response.data.message }]);
        } else if (err.response.data?.errors) {
          // Multiple validation errors from server
          setErrors(
            err.response.data.errors.map(
              (error: { msg: string; path: string }) => ({
                msg: error.msg,
                path: error.path,
              })
            )
          );
        } else if (err.response.data) {
          // Raw response data as error message
          setErrors([{ msg: err.response.data }]);
        }
      } else {
        // Fallback for unexpected errors
        setErrors([
          { msg: "An unexpected error occurred. Please try again later." },
        ]);
      }
    }
  };

  return (
    <div className="Login">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* email */}
          <div className="email">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
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
            <div className="password-cover">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  right: "10px",
                }}
              >
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

          {/* remember me and forgot password */}
          <div className="remember-me-and-forgot-pass">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>

            <div className="forgot-pass">
              <Link href="/forgot-password">Forgot Password?</Link>
            </div>
          </div>

          {/* login button */}
          <button className="signin-btn">Login</button>

          <div className="or-divider">
            <div className="line"></div>
            <span>Or</span>
          </div>

          {/* login with google button */}
          <a href={`${BASE_URL}/auth/google`} className="signin-google-btn">
            <FaGoogle />
            Login with Google
          </a>

          <div className="signup-section">
            <p>Don&apos;t have an account?</p>
            <Link href="/auth/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
