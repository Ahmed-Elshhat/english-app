"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import "./addUser.scss";
import Loading from "@/components/Loading/Loading";
import { USERS } from "@/Api/Api";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AxiosClient } from "@/Api/axiosClient";

function AddUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    points: 5 as number | string,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [flag, setFlag] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const axios = AxiosClient();

  useEffect(() => {
    validate();
  }, [form]);

  // ========== VALIDATIONS ==========
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com)$/;

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format (user@example.com)";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (form.confirmPassword.length < 6) {
      newErrors.confirmPassword =
        "Confirm Password must be at least 6 characters";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Confirm Password must match Password";
    }

    if (
      form.points === null ||
      form.points === undefined ||
      form.points === ""
    ) {
      newErrors.points = "Points are required";
    } else if (!Number.isInteger(form.points)) {
      newErrors.points = "Points must be an integer";
    } else if (typeof form.points === "number" && form.points < 0) {
      newErrors.points = "Points cannot be negative";
    }

    if (!["user", "admin"].includes(form.role)) {
      newErrors.role = "Role must be either 'user' or 'admin'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== INPUT HANDLERS ==========
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "points") {
      // ✅ Allow only digits
      if (/^\d*$/.test(value)) {
        setForm((prev) => ({
          ...prev,
          points: value === "" ? "" : Number(value), // convert to number
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlag(true);
    setGeneralError(null); // نفضيها قبل ما نبدأ

    const isValid = validate();
    if (!isValid) return;

    setLoading(true);

    const data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: string;
      points?: number | string; // 👈 optional
    } = {
      name: form.name,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: form.role,
      points: form.points,
    };

    if (form.role === "admin" && form.points === 0) {
      delete data.points;
      console.log("Hello");
    }

    try {
      const res = await axios.post(`${USERS}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        router.push("/dashboard/users");
      }

      // reset
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        points: 5,
      });
      setErrors({});
      setFlag(false);
    } catch (error) {
      setLoading(false);
      const err = error as AxiosError<{
        errors?: { path: string; msg: string }[];
        message?: string;
      }>;
      console.log(error);

      if (err.response?.data?.errors) {
        // backend validation errors
        const backendErrors: { [key: string]: string } = {};
        err.response.data.errors.forEach((e) => {
          if (!backendErrors[e.path]) {
            backendErrors[e.path] = e.msg;
          }
        });
        setErrors(backendErrors);
      } else if (err.response?.status === 401) {
        // Unauthorized
        setGeneralError("You are not authorized. Please login again.");
        router.push("/login");
      } else if (err.response?.data?.message) {
        // Error عام من السيرفر
        setGeneralError(err.response.data.message);
      } else if (err.response) {
        setGeneralError("Server error occurred. Please try again later.");
      } else if (err.message) {
        setGeneralError(err.message);
      } else if (err.request) {
        setGeneralError("No response from server. Check your connection.");
      } else {
        setGeneralError("Unexpected error occurred.");
      }
    }
  };

  return (
    <>
      {loading && <Loading />}
      <div className="add-user">
        <div className="form-container">
          <h2>
            Add User
            <AiOutlineUsergroupAdd />
          </h2>
          <form onSubmit={handleSubmit}>
            {/* name */}
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter user name"
              />
              {errors.name && flag && <p className="error">{errors.name}</p>}
            </div>

            {/* email */}
            <div className="form-group">
              <label htmlFor="name">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
              {errors.email && flag && <p className="error">{errors.email}</p>}
            </div>

            {/* password */}
            <div className="form-group">
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
              {errors.password && flag && (
                <p className="error">{errors.password}</p>
              )}
            </div>

            {/* confirm password */}
            <div className="form-group">
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
              {errors.confirmPassword && flag && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* points */}
            <div className="form-group">
              <label htmlFor="pints">Points</label>
              <input
                type="text"
                id="points"
                name="points"
                value={form.points}
                onChange={handleChange}
                placeholder="Enter user name"
              />
              {errors.points && flag && (
                <p className="error">{errors.points}</p>
              )}
            </div>

            {/* role */}
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="">Choose role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && flag && <p className="error">{errors.role}</p>}
            </div>

            {/* general error */}
            {generalError && (
              <p className="error general-error">{generalError}</p>
            )}

            {/* submit */}
            <button type="submit" className="submit-btn">
              Add User
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddUserPage;
