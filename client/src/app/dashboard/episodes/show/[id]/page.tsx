"use client";
import { useEffect, useState } from "react";
import { EpisodeSchema } from "@/Types/app";
import { Axios } from "@/Api/axios";
import { EPISODES } from "@/Api/Api";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading/Loading";
import "./showEpisodeDetails.scss";
import { MdLiveTv } from "react-icons/md";

function ShowEpisodeDetailsPage() {
  const { id } = useParams();
  const [episode, setEpisode] = useState<EpisodeSchema | null>(null);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const { data } = await Axios.get(`${EPISODES}/${id}`);
        setEpisode(data.data);
        console.log("Episode fetched successfully:", data.data);
      } catch (error) {
        console.error("Error fetching Episode:", error);
      }
    };

    fetchEpisode();
  }, [id]);

  if (!episode) return <Loading />;

  return (
    <div className="show-episode">
      <h2>
        Episode Details <MdLiveTv />
      </h2>
      <table className="episode-table" style={{ textAlign: "left" }}>
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
            <td data-label="ID">{episode._id}</td>
          </tr>

          <tr>
            <td>
              <span>Playlist ID</span>
            </td>
            <td data-label="Title">{episode.playlistId}</td>
          </tr>

          <tr>
            <td>
              <span>Title</span>
            </td>
            <td data-label="Title">{episode.title}</td>
          </tr>

          <tr>
            <td>
              <span>Season Number</span>
            </td>
            <td data-label="Season Number">{episode.seasonNumber}</td>
          </tr>

          <tr>
            <td>
              <span>Episode Number</span>
            </td>
            <td data-label="Episode Number">{episode.episodeNumber}</td>
          </tr>

          <tr>
            <td>
              <span>Duration</span>
            </td>
            <td data-label="Duration">{episode.duration}</td>
          </tr>

          <tr>
            <td>
              <span>createdAt</span>
            </td>
            <td data-label="createdAt">
              {episode.createdAt
                ? new Date(episode.createdAt).toLocaleDateString()
                : "Not Available"}
            </td>
          </tr>
          <tr>
            <td>
              <span>updatedAt</span>
            </td>
            <td data-label="updatedAt">
              {episode.updatedAt
                ? new Date(episode.updatedAt).toLocaleDateString()
                : "Not Available"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ShowEpisodeDetailsPage;
