"use client";
import Link from "next/link";
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";
import { useEffect, useRef, useState } from "react";
import { USERS } from "@/Api/Api";
import { useParams } from "next/navigation";
import { UserSchema } from "@/Types/app";
import { AxiosError } from "axios";
import { AxiosClient } from "@/Api/axiosClient";
import "./showUserDetails.scss";
import { FaUser } from "react-icons/fa";
import { BiSolidErrorCircle } from "react-icons/bi";

function ShowEpisodeDetailsPage() {
  const { id } = useParams();
  const [user, setUser] = useState<UserSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const stopLoading = useRef(0);
  const axios = AxiosClient();

  useEffect(() => {
    setLoading(true);
    const fetchEpisode = async () => {
      try {
        const res = await axios.get(`${USERS}/${id}`);
        if (res.status === 200) {
          const data = res.data;
          setUser(data.data);
          if (stopLoading.current === 0) {
            toast.success("Data fetched successfully");
            stopLoading.current = 1;
          }
        }
      } catch (err) {
        // Handle Axios error properly
        const error = err as AxiosError<{ message?: string }>;
        const message =
          error.response?.data?.message ||
          (typeof error.response?.data === "string"
            ? error.response.data
            : "") ||
          error.message ||
          "Something went wrong while fetching users";
        setError(message);
        setUser(null);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [id]);

  function formatDate(dateValue?: string | Date | null): string {
    if (!dateValue) return "Not Available";

    // Convert to Date object if it's a string
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;

    if (isNaN(date.getTime())) return "Invalid Date";

    // Format the date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="error-container">
        <h2>
          <BiSolidErrorCircle /> Failed to load user data
        </h2>
        <p>{error}</p>
        <Link href="/dashboard/users" className="back-btn">
          Back to Users List
        </Link>
      </div>
    );
  }

  return (
    <div className="show-user">
      <h2>
        <FaUser /> User Details
      </h2>

      <table className="user-table" style={{ textAlign: "left" }}>
        {user != null ? (
          <>
            <thead>
              <tr>
                <th>Field</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span>ID</span>
                </td>
                <td data-label="ID">{user._id}</td>
              </tr>

              <tr>
                <td>
                  <span>Name</span>
                </td>
                <td data-label="Name">{user.name}</td>
              </tr>

              <tr>
                <td>
                  <span>Email</span>
                </td>
                <td data-label="Email">{user.email}</td>
              </tr>

              <tr>
                <td>
                  <span>Role</span>
                </td>
                <td data-label="Role">{user.role}</td>
              </tr>

              <tr>
                <td>
                  <span>Current Plan</span>
                </td>
                <td data-label="Current Plan">{user.currentPlan}</td>
              </tr>

              <tr>
                <td>
                  <span>Plan Purchased At</span>
                </td>
                <td data-label="Plan Purchased At">
                  {formatDate(user.planPurchasedAt)}
                </td>
              </tr>

              <tr>
                <td>
                  <span>Plan Expires At</span>
                </td>

                <td data-label="Plan Expires At">
                  {formatDate(user.planExpiresAt)}
                </td>
              </tr>

              <tr>
                <td>
                  <span>Points</span>
                </td>
                <td data-label="Points">
                  {user.role === "user" ? user.points ?? 0 : "Not Available"}
                </td>
              </tr>

              <tr>
                <td>
                  <span>Active</span>
                </td>
                <td data-label="Active">{user.active ? "true" : "false"}</td>
              </tr>

              <tr>
                <td>
                  <span>createdAt</span>
                </td>
                <td data-label="createdAt">{formatDate(user.createdAt)}</td>
              </tr>

              <tr>
                <td>
                  <span>updatedAt</span>
                </td>
                <td data-label="updatedAt">{formatDate(user.updatedAt)}</td>
              </tr>
            </tbody>
          </>
        ) : (
          <tbody>
            <tr>
              <td colSpan={2}>Failed to fetch data</td>
            </tr>
          </tbody>
        )}
      </table>

      {user != null && (
        <Link
          href={`/dashboard/users/update/${user._id}`}
          className="update_btn"
        >
          <FaUser /> Update User
        </Link>
      )}
    </div>
  );
}

export default ShowEpisodeDetailsPage;
