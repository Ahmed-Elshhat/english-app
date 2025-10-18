"use client";
import toast from "react-hot-toast";
import { toast as nToast } from "react-toastify";
import Loading from "@/components/Loading/Loading";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserSchema } from "@/Types/app";
import { AxiosClient } from "@/Api/axiosClient";
import { AxiosError } from "axios";
import { USERS } from "@/Api/Api";
import { FaUserEdit } from "react-icons/fa";
import "./updateUser.scss";
import Link from "next/link";
import { BiSolidErrorCircle } from "react-icons/bi";
import Swal from "sweetalert2";

function UpdateUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const axios = AxiosClient();

  const [form, setForm] = useState({
    name: "",
    points: 0 as number | string,
    currentPlan: "free",
    planPurchasedAt: "",
    planExpiresAt: "",
  });

  const [user, setUser] = useState<UserSchema | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState({
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [flag, setFlag] = useState<boolean>(false);
  const stopLoading = useRef(0);

  // Run validation on form changes
  useEffect(() => {
    const changedFields = getChangedFields();

    if (flag) {
      if (Object.keys(changedFields).length === 0) {
        setGeneralError("No changes detected in the user data.");
      } else {
        setGeneralError("");
      }
    }
    validate();
  }, [form]);

  // Helper function to format datetime for input[type="datetime-local"]
  const formatDateTimeLocal = (
    dateValue: string | Date | null | undefined
  ): string => {
    if (!dateValue) return "";

    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;

    // Format to YYYY-MM-DDTHH:mm:ss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // ================= FETCH USER =================
  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${USERS}/${id}`);
        if (res.status === 200) {
          const data: UserSchema = res.data.data;
          if (data.role === "admin") {
            setFetchError({
              title: "Editing Not Allowed",
              message: `You cannot edit this user because they have an admin role.`,
            });
            if (stopLoading.current === 0) {
              toast.error("Editing Not Allowed");
              stopLoading.current = 1;
            }
            return;
          }
          setUser(data);
          setForm({
            name: data.name || "",
            points: data.points || 0,
            currentPlan: data.currentPlan || "free",
            planPurchasedAt: formatDateTimeLocal(data.planPurchasedAt),
            planExpiresAt: formatDateTimeLocal(data.planExpiresAt),
          });

          if (stopLoading.current === 0) {
            toast.success("User data loaded successfully");
            stopLoading.current = 1;
          }
        }
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch user data";
        toast.error(message);
        setFetchError({
          title: "Failed to load user data",
          message,
        });
        setGeneralError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (form.currentPlan !== "free") {
      if (!form.planPurchasedAt)
        newErrors.planPurchasedAt = "Plan start date and time is required";
      if (!form.planExpiresAt)
        newErrors.planExpiresAt = "Plan end date and time is required";

      // Validate that end date is after start date
      if (form.planPurchasedAt && form.planExpiresAt) {
        const startDate = new Date(form.planPurchasedAt);
        const endDate = new Date(form.planExpiresAt);

        if (endDate <= startDate) {
          newErrors.planExpiresAt = "End date must be after start date";
        }
      }
    }

    if (
      form.points === null ||
      form.points === undefined ||
      form.points === ""
    ) {
      newErrors.points = "Points are required";
    } else if (!Number.isInteger(Number(form.points))) {
      newErrors.points = "Points must be an integer";
    } else if (Number(form.points) < 0) {
      newErrors.points = "Points cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= INPUT HANDLERS =================
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
    } else if (name === "currentPlan") {
      // If plan changes to 'free', clear the date fields
      if (value === "free") {
        setForm((prev) => ({
          ...prev,
          currentPlan: value,
          planPurchasedAt: "",
          planExpiresAt: "",
        }));
        // Clear any date errors
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.planPurchasedAt;
          delete newErrors.planExpiresAt;
          return newErrors;
        });
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ================= CHECK CHANGES =================
  const getChangedFields = () => {
    if (!user) return {};

    const changed: Partial<typeof form> = {};

    // Compare numeric and string fields
    if (form.points !== user.points) changed.points = form.points;
    if (form.currentPlan !== user.currentPlan)
      changed.currentPlan = form.currentPlan;

    const userPlanPurchasedAt = formatDateTimeLocal(user.planPurchasedAt);
    const userPlanExpiresAt = formatDateTimeLocal(user.planExpiresAt);

    // Handle dates only if plan is NOT "free"
    if (form.currentPlan !== "free") {
      if (
        form.planPurchasedAt !== userPlanPurchasedAt &&
        form.planPurchasedAt
      ) {
        changed.planPurchasedAt = new Date(form.planPurchasedAt).toISOString();
      }
      if (form.planExpiresAt !== userPlanExpiresAt && form.planExpiresAt) {
        changed.planExpiresAt = new Date(form.planExpiresAt).toISOString();
      }
    }

    return changed;
  };

  const popup = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You’re about to update this user’s data.",
      icon: "warning",
      background: "#0f172a", // نفس لون الخلفية
      color: "#e2e8f0", // لون النص الفاتح
      showCancelButton: true,
      confirmButtonText: "Yes, update it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "custom-popup",
        confirmButton: "custom-confirm-btn",
        cancelButton: "custom-cancel-btn",
        title: "custom-title",
        htmlContainer: "custom-text",
      },
    });

    return result.isConfirmed;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlag(true);
    setGeneralError(null);

    if (!validate()) return;

    const changedFields = getChangedFields();

    if (Object.keys(changedFields).length === 0) {
      setGeneralError("No changes detected in the user data.");
      return;
    }

    if (!(await popup())) return;
    try {
      setLoading(true);
      const res = await axios.put(`${USERS}/${id}`, changedFields, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 200) {
        if (stopLoading.current === 1) {
          toast.success("User updated successfully");
          stopLoading.current = 2;
        }
        setLoading(false);

        const result = await Swal.fire({
          title: "Updated!",
          text: "User data has been updated successfully.",
          icon: "success",
          background: "#0f172a",
          color: "#e2e8f0",
          customClass: {
            popup: "custom-popup",
            confirmButton: "custom-confirm-btn",
            title: "custom-title",
            htmlContainer: "custom-text",
          },
          confirmButtonText: "OK",
          timer: 3000,
        });

        // لما المستخدم يضغط OK أو يقفل الـ alert
        if (result.isConfirmed || result.isDismissed) {
          router.push("/dashboard/users");
        }
      }
    } catch (error) {
      const err = error as AxiosError<{
        errors?: { path: string; msg: string }[];
        message?: string;
      }>;

      if (err.response?.data?.errors) {
        // Backend validation errors
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
        // General error from server
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
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (fetchError.message) {
    return (
      <div className="error-container">
        <h2>
          <BiSolidErrorCircle />
          {fetchError.title}
        </h2>
        <p>{fetchError.message}</p>
        <Link href="/dashboard/users" className="back-btn">
          Back to Users List
        </Link>
      </div>
    );
  }

  return (
    <div className="update-user">
      <div className="form-container">
        <h2>
          Update User <FaUserEdit />
        </h2>

        {user && (
          <form onSubmit={handleSubmit}>
            {/* Name (read-only) */}
            <div className="form-group">
              <label htmlFor="name">User Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                readOnly
                className="readonly"
              />
            </div>

            {/* Points */}
            <div className="form-group">
              <label htmlFor="points">Points</label>
              <input
                type="text"
                id="points"
                name="points"
                value={form.points}
                onChange={handleChange}
                placeholder="Enter points"
              />
              {errors.points && flag && (
                <p className="error">{errors.points}</p>
              )}
            </div>

            {/* Current Plan */}
            <div className="form-group">
              <label htmlFor="currentPlan">Current Plan</label>
              <select
                id="currentPlan"
                name="currentPlan"
                value={form.currentPlan}
                onChange={handleChange}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="premium_plus">Premium Plus</option>
              </select>
              {errors.currentPlan && flag && (
                <p className="error">{errors.currentPlan}</p>
              )}
            </div>

            {/* Plan Dates with Time */}
            {form.currentPlan !== "free" && (
              <>
                <div className="form-group">
                  <label htmlFor="planPurchasedAt">
                    Plan Start Date & Time
                    <span className="helper-text">
                      {" "}
                      (Year-Month-Day Hour:Minute:Second)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    id="planPurchasedAt"
                    name="planPurchasedAt"
                    value={form.planPurchasedAt}
                    onChange={handleChange}
                    step="1"
                  />
                  {errors.planPurchasedAt && flag && (
                    <p className="error">{errors.planPurchasedAt}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="planExpiresAt">
                    Plan End Date & Time
                    <span className="helper-text">
                      {" "}
                      (Year-Month-Day Hour:Minute:Second)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    id="planExpiresAt"
                    name="planExpiresAt"
                    value={form.planExpiresAt}
                    onChange={handleChange}
                    step="1"
                  />
                  {errors.planExpiresAt && flag && (
                    <p className="error">{errors.planExpiresAt}</p>
                  )}
                </div>
              </>
            )}

            {generalError && (
              <p className="error general-error">{generalError}</p>
            )}

            {/* Submit */}
            <button type="submit" className="submit-btn">
              Update User
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UpdateUserPage;
