"use client";
import Link from "next/link";
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";
import CopyButton from "@/components/CopyButton/CopyButton";
import { USERS } from "@/Api/Api";
import { AxiosError } from "axios";
import { UserSchema } from "@/Types/app";
import { MdEditSquare } from "react-icons/md";
import { FaEye, FaTrash, FaUsers } from "react-icons/fa";
import { useCallback, useEffect, useRef, useState } from "react";
import { AxiosClient } from "@/Api/axiosClient";
import { useAppSelector } from "@/Redux/app/hooks";
import "./users.scss";

function UsersPage() {
  // State to store users list
  const [users, setUsers] = useState<UserSchema[]>([]);

  const currentUser = useAppSelector((state) => state.user.data);

  // State to handle pagination data
  const [paginationResults, setPaginationResults] = useState({
    next: 1,
    numberOfPages: 1,
  });

  // State to handle loading state and type ("normal" or "bottom" for infinite scroll)
  const [loading, setLoading] = useState({
    status: true,
    type: "normal",
  });

  // State to store invalid ID error
  const [idError, setIdError] = useState("");

  // State for search term and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("newest");

  // Ref used to prevent showing success toast multiple times
  const stopLoading = useRef(0);
  const axios = AxiosClient();

  // Fetch users when filters or sorting change
  useEffect(() => {
    const getUsers = async () => {
      // Only show loading spinner if it's the first load
      if (stopLoading.current === 0) {
        setLoading({ status: true, type: "normal" });
      }

      // Sorting query (e.g., &sort=-createdAt or &sort=createdAt)
      const sortOrderQuery =
        sortOrder !== "" &&
        `&sort=${sortOrder === "newest" ? "-" : ""}createdAt`;

      // Keyword search (by name)
      const keyword =
        searchBy !== "" && searchBy === "name" && searchTerm !== ""
          ? `&keyword=${searchTerm}`
          : "";

      // Search by MongoDB _id
      const _id =
        searchBy !== "" && searchBy === "id" && searchTerm !== ""
          ? `&_id=${searchTerm}`
          : "";

      try {
        // Fetch data from API
        const res = await axios.get(
          `${USERS}?page=1&limit=30${sortOrderQuery}${keyword}${_id}`
        );

        if (res.status === 200) {
          setLoading({ status: false, type: "normal" });

          // Show toast only on first load
          if (stopLoading.current === 0) {
            toast.success("Data fetched successfully");
          }

          // Update users and pagination data
          setUsers(res.data.data);
          setPaginationResults(res.data.paginationResults);

          // Prevent multiple success toasts
          stopLoading.current = 1;
        }
      } catch (err) {
        setLoading({ status: false, type: "normal" });

        // Handle Axios error properly
        const error = err as AxiosError<{ message?: string }>;
        const message =
          error.response?.data?.message ||
          (typeof error.response?.data === "string"
            ? error.response.data
            : "") ||
          error.message ||
          "Something went wrong while fetching users";

        // Avoid showing duplicate errors for invalid ID
        if (idError === "") {
          toast.error(message);
        }
      }
    };

    getUsers();
  }, [searchBy, searchTerm, sortOrder]);

  // Fetch more users on scroll (infinite scroll)
  const fetchMoreUsers = useCallback(async () => {
    // Stop if already loading or no more pages
    if (
      loading.status ||
      paginationResults.next > paginationResults.numberOfPages ||
      !paginationResults.next
    )
      return;

    // Check if the user reached the bottom of the page
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight -
        (window.scrollX <= 710 ? 500 : 300)
    ) {
      setLoading({ status: true, type: "bottom" });

      try {
        // Fetch next page
        const res = await axios.get(
          `${USERS}?page=${paginationResults.next}&limit=30`
        );

        if (res.status === 200) {
          setLoading({ status: false, type: "bottom" });

          // Append new users to the existing list
          setUsers((prev) => [...prev, ...res.data.data]);

          // Update pagination data
          setPaginationResults(res.data.paginationResults);
        }
      } catch (err) {
        setLoading({ status: false, type: "bottom" });

        // Handle Axios error
        const error = err as AxiosError<{ message?: string }>;
        const message =
          error.response?.data?.message ||
          (typeof error.response?.data === "string"
            ? error.response.data
            : "") ||
          error.message ||
          "Something went wrong while fetching users";

        toast.error(message);
      }
    }
  }, [loading, paginationResults]);

  // Attach infinite scroll event
  useEffect(() => {
    window.addEventListener("scroll", fetchMoreUsers);
    return () => window.removeEventListener("scroll", fetchMoreUsers);
  }, [fetchMoreUsers]);

  // Handle user deletion
  const handleDelete = async (id: string) => {
    setLoading({ status: true, type: "normal" });
    try {
      // Delete user by ID
      const res = await axios.delete(`${USERS}/${id}`);

      if (res.status === 204) {
        // Remove deleted user from list
        setUsers(users.filter((user) => user._id !== id));
        setLoading({ status: false, type: "normal" });
      }
    } catch (err) {
      setLoading({ status: false, type: "normal" });

      // Handle Axios error
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : "") ||
        error.message ||
        "Something went wrong while fetching users";
      toast.error(message);
    }
  };

  // Handle changes in the search input
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Validate MongoDB ObjectId format when searching by ID
    if (searchBy === "id") {
      if (value && !/^[0-9a-fA-F]{24}$/.test(value)) {
        setIdError("Not a valid MongoDB ID");
      } else {
        setIdError("");
      }
    } else {
      setIdError("");
    }
  };

  return (
    <div className="Users">
      {loading.status && loading.type === "normal" && <Loading />}
      <div className="users-container">
        <h2>
          <FaUsers />
          Users
        </h2>
        <div className="filtration">
          {/* Search input */}
          <div className="input_cover">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              className={idError ? "input-error" : ""}
              onChange={handleSearchTermChange}
            />
            {idError && <p className="error-message in">{idError}</p>}
          </div>

          {/* Search type selector */}
          <select
            value={searchBy}
            onChange={(e) => {
              setSearchBy(e.target.value);
              setSearchTerm("");
            }}
          >
            <option value="id">Search by ID</option>
            <option value="name">Search by name</option>
          </select>

          {/* Sort order selector */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </select>
        </div>

        {idError && <p className="error-message out">{idError}</p>}

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>plan</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={`${user._id}-${index}`}>
                    <td data-label="ID">
                      {" "}
                      <CopyButton couponId={user._id} />
                    </td>
                    <td data-label="Name">{user.name}</td>

                    <td data-label="Email">{user.email}</td>

                    <td data-label="Role">{user.role}</td>

                    <td data-label="Plan">{user.currentPlan || "free"}</td>

                    <td data-label="Actions">
                      <div className="action-buttons">
                        <Link
                          href={`/dashboard/users/show/${user._id}`}
                          className="btn-view-link"
                        >
                          <button className="btn btn-view">
                            <FaEye />
                          </button>
                        </Link>

                        <Link
                          href={`/dashboard/users/update/${user._id}`}
                          className="btn-edit-link"
                        >
                          <button className="btn btn-edit">
                            <MdEditSquare />
                          </button>
                        </Link>
                        <button
                          className="btn btn-delete"
                          onClick={() =>
                            currentUser && currentUser.id === user._id
                              ? null
                              : handleDelete(user._id)
                          }
                          style={{
                            color:
                              currentUser && currentUser.id === user._id
                                ? "#f87171be"
                                : "#f92e2eff",
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-data">
                  <td colSpan={6}>No Users Found</td>
                </tr>
              )}

              {loading.status && loading.type === "bottom" && (
                <tr>
                  <td colSpan={5}>
                    <div className="loading-bottom"></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
