"use client";
import { EPISODES } from "@/Api/Api";
import { Axios } from "@/Api/axios";
import CopyButton from "@/components/CopyButton/CopyButton";
import Loading from "@/components/Loading/Loading";
import { EpisodeSchema } from "@/Types/app";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import "./episodes.scss";

function ShowEpisodesPage() {
  const [episodes, setEpisodes] = useState<EpisodeSchema[]>([]);
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
  const [searchBy, setSearchBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("newest");
  const stopLoading = useRef(0);

  useEffect(() => {
    const getEpisodes = async () => {
      if (stopLoading.current === 0) {
        setLoading({ status: true, type: "normal" });
      }
      const sortOrderQuery =
        sortOrder !== "" &&
        `&sort=${sortOrder === "newest" ? "-" : ""}createdAt`;

      const keyword =
        searchBy !== "" && searchBy === "title" && searchTerm !== ""
          ? `&keyword=${searchTerm}`
          : "";
      const _id =
        searchBy !== "" && searchBy === "id" && searchTerm !== ""
          ? `&_id=${searchTerm}`
          : "";

      try {
        const res = await Axios.get(
          `${EPISODES}?page=1&limit=30${sortOrderQuery}${keyword}${_id}`
        );
        if (res.status === 200) {
          setLoading({ status: false, type: "normal" });
          setEpisodes(res.data.data);
          setPaginationResults(res.data.paginationResults);
          console.log(res.data);
          stopLoading.current = 1;
        }
      } catch (err) {
        setLoading({ status: false, type: "normal" });
        console.log(err);
      }
    };
    getEpisodes();
  }, [searchBy, searchTerm, sortOrder]);

  const fetchMoreEpisodes = useCallback(async () => {
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
          `${EPISODES}?page=${paginationResults.next}&limit=30`
        );
        if (res.status === 200) {
          setLoading({ status: false, type: "bottom" });
          setEpisodes((prev) => [...prev, ...res.data.data]);
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
    window.addEventListener("scroll", fetchMoreEpisodes);
    return () => window.removeEventListener("scroll", fetchMoreEpisodes);
  }, [fetchMoreEpisodes]);

  const handleDelete = async (id: string) => {
    setLoading({ status: true, type: "normal" });
    try {
      const res = await Axios.delete(`${EPISODES}/${id}`);
      if (res.status === 204) {
        setEpisodes(episodes.filter((episode) => episode._id !== id));
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
    <div className="Episodes">
      {loading.status && loading.type === "normal" && <Loading />}
      <div className="episodes-container">
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
            <option value="title">Search by Title</option>
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
                <th>Playlist ID</th>
                <th>Title</th>
                <th>Episode Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {episodes.length > 0 ? (
                episodes.map((episode, index) => (
                  <tr key={`${episode._id}-${index}`}>
                    <td data-label="ID">
                      {" "}
                      <CopyButton couponId={episode._id} />
                    </td>
                    <td data-label="ID">
                      {" "}
                      <CopyButton couponId={episode.playlistId} />
                    </td>
                    <td data-label="Title">{episode.title}</td>

                    <td data-label="Episode Number">{episode.episodeNumber}</td>

                    <td data-label="Actions">
                      <div className="action-buttons">
                        <Link
                          href={`/dashboard/episodes/show/${episode._id}`}
                          className="btn-view-link"
                        >
                          <button className="btn btn-view">
                            <FaEye />
                          </button>
                        </Link>

                        <Link
                          href={`/dashboard/episodes/update/${episode._id}`}
                          className="btn-edit-link"
                        >
                          <button className="btn btn-edit">
                            <MdEditSquare />
                          </button>
                        </Link>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(episode._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-data">
                  <td colSpan={5}>No Episodes Found</td>
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

export default ShowEpisodesPage;
