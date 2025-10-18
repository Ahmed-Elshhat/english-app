"use client";
import { useEffect, useState } from "react";
import "./showPlaylistDetails.scss";
import { PlaylistSchema } from "@/Types/app";
import { PLAYLISTS } from "@/Api/Api";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading/Loading";
import Image from "next/image";
import { RiPlayList2Fill } from "react-icons/ri";
import { AxiosClient } from "@/Api/axiosClient";

function ShowPlaylistDetailsPage() {
  const { id } = useParams();
  // const params = useParams();
  // const id = params.id;
  const [playlist, setPlaylist] = useState<PlaylistSchema | null>(null);

  const axios = AxiosClient();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const { data } = await axios.get(`${PLAYLISTS}/${id}`);
        setPlaylist(data.data);
        console.log("Playlist fetched successfully:", data.data);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchPlaylist();
  }, [id]);

  if (!playlist) return <Loading />;

  return (
    <div className="show-playlist">
      <h2>
        Playlist Details <RiPlayList2Fill />
      </h2>
      <table className="playlist-table" style={{ textAlign: "left" }}>
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
            <td data-label="ID">{playlist._id}</td>
          </tr>
          <tr>
            <td>
              <span>Type</span>
            </td>
            <td data-label="Type">{playlist.type}</td>
          </tr>
          <tr>
            <td>
              <span>Title</span>
            </td>
            <td data-label="Title">{playlist.title}</td>
          </tr>
          <tr>
            <td>
              <span>Description</span>
            </td>
            <td data-label="Description">{playlist.description}</td>
          </tr>

          <tr>
            <td>
              <span>Image</span>
            </td>
            <td data-label="Image">
              <Image
                src={playlist.imageUrl}
                alt="playlist image"
                width={150}
                height={150}
                priority
              />
            </td>
          </tr>

          <tr>
            <td>
              <span>Seasons</span>
            </td>
            <td data-label="Seasons">
              {playlist.seasons && playlist.seasons.length > 0 ? (
                <div className="season-container">
                  {playlist.seasons.map((season, index) => (
                    <div className="season-item" key={index}>
                      <span>Season {season.seasonNumber}</span> –{" "}
                      <span>{season.countOfEpisodes} Episodes</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span>No seasons available</span>
              )}
            </td>
          </tr>

          <tr>
            <td>
              <span>createdAt</span>
            </td>
            <td data-label="createdAt">
              {playlist.createdAt
                ? new Date(playlist.createdAt).toLocaleDateString()
                : "Not Available"}
            </td>
          </tr>
          <tr>
            <td>
              <span>updatedAt</span>
            </td>
            <td data-label="updatedAt">
              {playlist.updatedAt
                ? new Date(playlist.updatedAt).toLocaleDateString()
                : "Not Available"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ShowPlaylistDetailsPage;
