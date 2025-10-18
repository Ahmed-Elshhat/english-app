"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { AxiosError } from "axios";
import "./addEpisode.scss";
import Loading from "@/components/Loading/Loading";
import { EPISODES, PLAYLISTS } from "@/Api/Api";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { AxiosClient } from "@/Api/axiosClient";

function AddEpisodePage() {
  const [form, setForm] = useState({
    title: "",
    playlistId: "",
    seasonNumber: 0,
    episodeNumber: 0,
  });

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

    // title
    if (!form.title) {
      newErrors.title = "The episode title is required";
    } else if (form.title.length < 3) {
      newErrors.title = "The episode title too short, min 3 chars";
    } else if (form.title.length > 70) {
      newErrors.title = "The episode title too long, max 70 chars";
    }

    // playlistId → لازم يكون MongoId
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!form.playlistId) {
      newErrors.playlistId = "The playlist ID is required";
    } else if (!mongoIdRegex.test(form.playlistId)) {
      newErrors.playlistId = "Invalid playlist ID format";
    }

    // seasonNumber
    if (form.seasonNumber == null || isNaN(form.seasonNumber)) {
      newErrors.seasonNumber = "Season number is required and must be a number";
    } else if (form.seasonNumber < 1) {
      newErrors.seasonNumber = "Season number must be greater than 0";
    }

    // episodeNumber
    if (form.episodeNumber == null || isNaN(form.episodeNumber)) {
      newErrors.episodeNumber =
        "Episode number is required and must be a number";
    } else if (form.episodeNumber < 1) {
      newErrors.episodeNumber = "Episode number must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // // ========== INPUT HANDLERS ==========
  // const handleChange = (
  //   e: React.ChangeEvent<
  //     HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  //   >
  // ) => {
  //   const { name, value } = e.target;
  //   setForm((prev) => ({ ...prev, [name]: value }));
  // };

  // ========== INPUT HANDLERS ==========
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // handle numbers (seasonNumber & episodeNumber)
    if (name === "seasonNumber" || name === "episodeNumber") {
      // مسموح أرقام فقط
      if (!/^\d*$/.test(value)) return; // يمنع إدخال أي حاجة غير أرقام
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseInt(value),
      }));
    }
    // handle playlistId validation (must be valid MongoId format)
    else if (name === "playlistId") {
      setForm((prev) => ({ ...prev, [name]: value.trim() }));
    }
    // handle other fields
    else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlag(true);
    setGeneralError(null);

    const isValid = validate();
    if (!isValid) return;

    setLoading(true);

    const data = {
      title: form.title,
      playlistId: form.playlistId,
      seasonNumber: form.seasonNumber,
      episodeNumber: form.episodeNumber,
    };

    try {
      const res = await axios.post(`${EPISODES}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        router.push("/dashboard/episodes");
      }

      // reset
      setForm({
        title: "",
        playlistId: "",
        seasonNumber: 0,
        episodeNumber: 0,
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
      <div className="add-playlist">
        <div className="form-container">
          <h2>
            Add Playlist
            <MdOutlinePlaylistAdd />
          </h2>
          <form onSubmit={handleSubmit}>
            {/* title */}
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter playlist title"
              />
              {errors.title && flag && <p className="error">{errors.title}</p>}
            </div>

            {/* playlist Id */}
            <div className="form-group">
              <label htmlFor="playlistId">Playlist ID</label>
              <input
                type="text"
                id="playlistId"
                name="playlistId"
                value={form.playlistId}
                onChange={handleChange}
                placeholder="Enter playlist ID"
              />
              {errors.playlistId && flag && (
                <p className="error">{errors.playlistId}</p>
              )}
            </div>

            {/* season number */}
            <div className="form-group">
              <label htmlFor="seasonNumber">Season Number</label>
              <input
                type="text"
                id="seasonNumber"
                name="seasonNumber"
                value={form.seasonNumber}
                onChange={handleChange}
                placeholder="Enter season number"
              />
              {errors.seasonNumber && flag && (
                <p className="error">{errors.seasonNumber}</p>
              )}
            </div>

            {/* episode number */}
            <div className="form-group">
              <label htmlFor="episodeNumber">Episode Number</label>
              <input
                type="text"
                id="episodeNumber"
                name="episodeNumber"
                value={form.episodeNumber}
                onChange={handleChange}
                placeholder="Enter episode number"
              />
              {errors.episodeNumber && flag && (
                <p className="error">{errors.episodeNumber}</p>
              )}
            </div>

            {/* general error */}
            {generalError && (
              <p className="error general-error">{generalError}</p>
            )}

            {/* submit */}
            <button type="submit" className="submit-btn">
              Add Playlist
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddEpisodePage;
