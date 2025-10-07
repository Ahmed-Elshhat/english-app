"use client";
import { USERS } from "@/Api/Api";
import { Axios } from "@/Api/axios";
import CopyButton from "@/components/CopyButton/CopyButton";
import Loading from "@/components/Loading/Loading";
import { UserSchema } from "@/Types/app";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import "./users.scss";

function UsersPage() {
  const [users, setUsers] = useState<UserSchema[]>([]);
  const [paginationResults, setPaginationResults] = useState({
    next: 1,
    numberOfPages: 1,
  });
  const [loading, setLoading] = useState({
    status: true,
    type: "normal",
  });
  const [idError, setIdError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("newest");
  const stopLoading = useRef(0);

  useEffect(() => {
    const getUsers = async () => {
      if (stopLoading.current === 0) {
        setLoading({ status: true, type: "normal" });
      }
      const sortOrderQuery =
        sortOrder !== "" &&
        `&sort=${sortOrder === "newest" ? "-" : ""}createdAt`;

      const keyword =
        searchBy !== "" && searchBy === "name" && searchTerm !== ""
          ? `&keyword=${searchTerm}`
          : "";
      const _id =
        searchBy !== "" && searchBy === "id" && searchTerm !== ""
          ? `&_id=${searchTerm}`
          : "";

      try {
        const res = await Axios.get(
          `${USERS}?page=1&limit=30${sortOrderQuery}${keyword}${_id}`
        );
        if (res.status === 200) {
          setLoading({ status: false, type: "normal" });
          setUsers(res.data.data);
          setPaginationResults(res.data.paginationResults);
          console.log(res.data);
          stopLoading.current = 1;
        }
      } catch (err) {
        setLoading({ status: false, type: "normal" });
        console.log(err);
      }
    };
    getUsers();
  }, [searchBy, searchTerm, sortOrder]);

  const fetchMoreUsers = useCallback(async () => {
    if (
      loading.status ||
      paginationResults.next > paginationResults.numberOfPages ||
      !paginationResults.next
    )
      return;

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight -
        (window.scrollX <= 710 ? 500 : 300)
    ) {
      setLoading({ status: true, type: "bottom" });
      try {
        const res = await Axios.get(
          `${USERS}?page=${paginationResults.next}&limit=30`
        );
        if (res.status === 200) {
          setLoading({ status: false, type: "bottom" });
          setUsers((prev) => [...prev, ...res.data.data]);
          setPaginationResults(res.data.paginationResults);
          console.log(res.data);
        }
      } catch (err) {
        setLoading({ status: false, type: "bottom" });
        console.log(err);
      }
    }
  }, [loading, paginationResults]);

  useEffect(() => {
    window.addEventListener("scroll", fetchMoreUsers);
    return () => window.removeEventListener("scroll", fetchMoreUsers);
  }, [fetchMoreUsers]);

  const handleDelete = async (id: string) => {
    setLoading({ status: true, type: "normal" });
    try {
      const res = await Axios.delete(`${USERS}/${id}`);
      if (res.status === 204) {
        setUsers(users.filter((user) => user._id !== id));
        setLoading({ status: false, type: "normal" });
        console.log(res.data);
      }
    } catch (err) {
      setLoading({ status: false, type: "normal" });
      console.error(err);
    }
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // إذا المستخدم مختار البحث بالـ ID
    if (searchBy === "id") {
      // تحقق من صحة الـ MongoID
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
                <th>Points</th>
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

                    <td data-label="Points">{user.points || "Not exist"}</td>

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
                          onClick={() => handleDelete(user._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-data">
                  <td colSpan={5}>No Users Found</td>
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
