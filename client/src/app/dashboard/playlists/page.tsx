"use client";
import { PLAYLISTS } from "@/Api/Api";
import { Axios } from "@/Api/axios";
import CopyButton from "@/components/CopyButton/CopyButton";
import Loading from "@/components/Loading/Loading";
import { PlaylistSchema } from "@/Types/app";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import "./playlists.scss";

function ShowPlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistSchema[]>([]);
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
  const [searchBy, setSearchBy] = useState("titleDesc");
  const [sortOrder, setSortOrder] = useState("newest");
  const [playlistType, setPlaylistType] = useState("");
  const stopLoading = useRef(0);

  useEffect(() => {
    const getPlaylists = async () => {
      if (stopLoading.current === 0) {
        setLoading({ status: true, type: "normal" });
      }
      const playlistTypeQuery =
        playlistType !== "" ? `&type=${playlistType}` : "";
      const sortOrderQuery =
        sortOrder !== "" &&
        `&sort=${sortOrder === "newest" ? "-" : ""}createdAt`;

      const keyword =
        searchBy !== "" && searchBy === "titleDesc" && searchTerm !== ""
          ? `&keyword=${searchTerm}`
          : "";
      const _id =
        searchBy !== "" && searchBy === "id" && searchTerm !== ""
          ? `&_id=${searchTerm}`
          : "";

      try {
        const res = await Axios.get(
          `${PLAYLISTS}?page=1&limit=30${playlistTypeQuery}${sortOrderQuery}${keyword}${_id}`
        );
        if (res.status === 200) {
          setLoading({ status: false, type: "normal" });
          setPlaylists(res.data.data);
          setPaginationResults(res.data.paginationResults);
          console.log(res.data);
          stopLoading.current = 1;
        }
      } catch (err) {
        setLoading({ status: false, type: "normal" });
        console.log(err);
      }
    };
    getPlaylists();
  }, [playlistType, searchBy, searchTerm, sortOrder]);

  const fetchMorePlaylists = useCallback(async () => {
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
          `${PLAYLISTS}?page=${paginationResults.next}&limit=30`
        );
        if (res.status === 200) {
          setLoading({ status: false, type: "bottom" });
          setPlaylists((prev) => [...prev, ...res.data.data]);
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
    window.addEventListener("scroll", fetchMorePlaylists);
    return () => window.removeEventListener("scroll", fetchMorePlaylists);
  }, [fetchMorePlaylists]);

  const handleDelete = async (id: string) => {
    setLoading({ status: true, type: "normal" });
    try {
      const res = await Axios.delete(`${PLAYLISTS}/${id}`);
      if (res.status === 204) {
        setPlaylists(playlists.filter((playlist) => playlist._id !== id));
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
    <div className="Playlists">
      {loading.status && loading.type === "normal" && <Loading />}
      <div className="playlists-container">
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
            <option value="titleDesc">Search by Title & Description</option>
          </select>

          {/* Sort order selector */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </select>

          {/* Playlist type filter */}
          <select
            value={playlistType}
            onChange={(e) => setPlaylistType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="series">Series</option>
            <option value="movie">Movies</option>
          </select>
        </div>

        {idError && <p className="error-message out">{idError}</p>}

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {playlists.length > 0 ? (
                playlists.map((playlist, index) => (
                  <tr key={`${playlist._id}-${index}`}>
                    <td data-label="ID">
                      {" "}
                      <CopyButton couponId={playlist._id} />
                    </td>
                    <td data-label="Type">{playlist.type}</td>

                    <td data-label="Title">{playlist.title}</td>

                    <td data-label="Description">{playlist.description}</td>

                    <td data-label="Actions">
                      <div className="action-buttons">
                        <Link
                          href={`/dashboard/playlists/show/${playlist._id}`}
                          className="btn-view-link"
                        >
                          <button className="btn btn-view">
                            <FaEye />
                          </button>
                        </Link>

                        <Link
                          href={`/dashboard/playlists/update/${playlist._id}`}
                          className="btn-edit-link"
                        >
                          <button className="btn btn-edit">
                            <MdEditSquare />
                          </button>
                        </Link>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(playlist._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-data">
                  <td colSpan={5}>No Playlists Found</td>
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

export default ShowPlaylistsPage;
