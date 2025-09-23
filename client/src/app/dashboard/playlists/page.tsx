"use client"
import { PLAYLISTS } from "@/Api/Api";
import { Axios } from "@/Api/axios";
import CopyButton from "@/components/CopyButton/CopyButton";
import Loading from "@/components/Loading/Loading";
import { PlaylistSchema } from "@/Types/app";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import "./playlists.scss"

function ShowPlaylistsPage() {
  const [paginationResults, setPaginationResults] = useState({
    next: 1,
    numberOfPages: 1,
  });
  const [playlists, setPlaylists] = useState<PlaylistSchema[]>([]);
  const [loading, setLoading] = useState({
    status: true,
    type: "normal",
  });

  useEffect(() => {
    const getPlaylists = async () => {
      setLoading({ status: true, type: "normal" });

      try {
        const res = await Axios.get(`${PLAYLISTS}?page=1&limit=10`);
        if (res.status === 200) {
          setLoading({ status: false, type: "normal" });
          setPlaylists(res.data.data);
          setPaginationResults(res.data.paginationResults);
          console.log(res.data);
        }
      } catch (err) {
        setLoading({ status: false, type: "normal" });
        console.log(err);
      }
    };
    getPlaylists();
  }, []);

  const fetchMoreProducts = useCallback(async () => {
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
          `${PLAYLISTS}?page=${paginationResults.next}&limit=10`
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
    window.addEventListener("scroll", fetchMoreProducts);
    return () => window.removeEventListener("scroll", fetchMoreProducts);
  }, [fetchMoreProducts]);

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

  return (
    <div className="Playlists">
      {loading.status && loading.type === "normal" && <Loading />}
      <div className="playlists-container">
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

                    <td data-label="Description">
                      {playlist.description}
                    </td>

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
