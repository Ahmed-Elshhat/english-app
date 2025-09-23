"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios, { AxiosError } from "axios";
import "./addPlaylist.scss";
import Loading from "@/components/Loading/Loading";
import { Axios } from "@/Api/axios";
import { PLAYLISTS } from "@/Api/Api";
import { MdOutlinePlaylistAdd } from "react-icons/md";

function AddPlaylistPage() {
  const [form, setForm] = useState({
    type: "",
    title: "",
    description: "",
    image: null as File | null,
    seasons: [] as { seasonNumber: number /* countOfEpisodes: number */ }[],
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [seasonInputs, setSeasonInputs] = useState({
    seasonNumber: "",
    // countOfEpisodes: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [flag, setFlag] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    validate();
  }, [form]);

  // ========== VALIDATIONS ==========
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // type
    if (!form.type) {
      newErrors.type = "The playlist type is required";
    } else if (!["movie", "series"].includes(form.type)) {
      newErrors.type = "The playlist type must be either 'movie' or 'series'";
    }

    // title
    if (!form.title) {
      newErrors.title = "The playlist title is required";
    } else if (form.title.length < 3) {
      newErrors.title = "The playlist title too short, min 3 chars";
    } else if (form.title.length > 70) {
      newErrors.title = "The playlist title too long, max 70 chars";
    }

    // description
    if (!form.description) {
      newErrors.description = "The playlist description is required";
    } else if (form.description.length < 3) {
      newErrors.description = "The playlist description too short, min 3 chars";
    } else if (form.description.length > 100) {
      newErrors.description =
        "The playlist description too long, max 100 chars";
    }

    // image
    if (!form.image) {
      newErrors.image = "The playlist image is required";
    }

    // seasons
    if (form.seasons.length === 0) {
      newErrors.seasons = "The playlist seasons is required";
    } else {
      const numbers = form.seasons.map((s) => s.seasonNumber);
      const duplicates = numbers.filter(
        (num, index) => numbers.indexOf(num) !== index
      );
      if (duplicates.length > 0) {
        newErrors.seasons = `Duplicate seasonNumber found: ${duplicates.join(
          ", "
        )}`;
      }

      form.seasons.forEach((s, i) => {
        if (!s.seasonNumber) {
          newErrors[
            `seasonNumber_${i}`
          ] = `The season number is required at item ${i + 1}`;
        } else if (s.seasonNumber < 1) {
          newErrors[
            `seasonNumber_${i}`
          ] = `The season number must be a positive integer at item ${i + 1}`;
        }

        // if (s.countOfEpisodes && s.countOfEpisodes < 1) {
        //   newErrors[
        //     `countOfEpisodes_${i}`
        //   ] = `The count of episodes must be a positive integer at item ${
        //     i + 1
        //   }`;
        // }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== INPUT HANDLERS ==========
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setForm({ ...form, image: null });
    setPreviewImage(null);
  };

  const handleSeasonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSeasonInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveSeason = (index: number) => {
    setForm((prev) => ({
      ...prev,
      seasons: prev.seasons.filter((_, i) => i !== index),
    }));
  };

  // ====== ADD OR UPDATE SEASON ======
  const handleAddOrUpdateSeason = () => {
    if (!seasonInputs.seasonNumber) return; // لازم season number

    if (editingIndex !== null) {
      // تحديث
      setForm((prev) => {
        const updated = [...prev.seasons];
        updated[editingIndex] = {
          seasonNumber: Number(seasonInputs.seasonNumber),
          // countOfEpisodes: seasonInputs.countOfEpisodes
          //   ? Number(seasonInputs.countOfEpisodes)
          //   : 0,
        };
        return { ...prev, seasons: updated };
      });
      setEditingIndex(null);
    } else {
      // إضافة جديدة
      setForm((prev) => ({
        ...prev,
        seasons: [
          ...prev.seasons,
          {
            seasonNumber: Number(seasonInputs.seasonNumber),
            // countOfEpisodes: seasonInputs.countOfEpisodes
            //   ? Number(seasonInputs.countOfEpisodes)
            //   : 0,
          },
        ],
      }));
    }

    // reset inputs
    setSeasonInputs({ seasonNumber: "" /* countOfEpisodes: "" */ });
  };

  // ====== EDIT SEASON ======
  const handleEditSeason = (index: number) => {
    const season = form.seasons[index];
    setSeasonInputs({
      seasonNumber: season.seasonNumber.toString(),
      // countOfEpisodes: season.countOfEpisodes
      //   ? season.countOfEpisodes.toString()
      //   : "",
    });
    setEditingIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlag(true);
    setGeneralError(null); // نفضيها قبل ما نبدأ

    const isValid = validate();
    if (!isValid) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("type", form.type);
    formData.append("title", form.title);
    formData.append("description", form.description);

    if (form.image) {
      formData.append("image", form.image);
    }

    if (form.seasons.length > 0) {
      formData.append("seasons", JSON.stringify(form.seasons));
    }

    try {
      const res = await Axios.post(`${PLAYLISTS}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        router.push("/dashboard/playlists");
      }

      // reset
      setForm({
        type: "",
        title: "",
        description: "",
        image: null,
        seasons: [],
      });
      setPreviewImage(null);
      setSeasonInputs({ seasonNumber: "" /*  countOfEpisodes: "" */ });
      setEditingIndex(null);
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
            {/* type */}
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="">Choose type</option>
                <option value="series">Series</option>
                <option value="movie">Movie</option>
              </select>
              {errors.type && flag && <p className="error">{errors.type}</p>}
            </div>

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

            {/* description */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter description"
              ></textarea>
              {errors.description && flag && (
                <p className="error">{errors.description}</p>
              )}
            </div>

            {/* image */}
            <div className="form-group">
              <label htmlFor="image">Image</label>
              <button
                type="button"
                className="upload-btn"
                onClick={() => document.getElementById("image")?.click()}
              >
                Upload Image
              </button>
              <input
                type="file"
                id="image"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={handleRemoveImage}
                  >
                    <IoClose />
                  </button>
                </div>
              )}
              {errors.image && flag && <p className="error">{errors.image}</p>}
            </div>

            {/* seasons */}
            <div className="form-group">
              <label>Seasons</label>
              <div className="season-inputs">
                <input
                  type="number"
                  name="seasonNumber"
                  placeholder="Season Number"
                  value={seasonInputs.seasonNumber}
                  onChange={handleSeasonInputChange}
                />
                {/* <input
                  type="number"
                  name="countOfEpisodes"
                  placeholder="Episodes Count (optional)"
                  value={seasonInputs.countOfEpisodes}
                  onChange={handleSeasonInputChange}
                /> */}
                <button type="button" onClick={handleAddOrUpdateSeason}>
                  {editingIndex !== null ? "Update Season" : "Add Season"}
                </button>
              </div>

              <ul className="seasons-list">
                {form.seasons.map((season, index) => (
                  <li key={index}>
                    Season {season.seasonNumber}
                    {/*  -{" "}
                    {season.countOfEpisodes > 0
                      ? `${season.countOfEpisodes} Episodes`
                      : "Episodes not specified"} */}
                    <div className="btns">
                      <button
                        type="button"
                        onClick={() => handleEditSeason(index)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSeason(index)}
                      >
                        <IoClose />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {errors.seasons && flag && (
                <p className="error">{errors.seasons}</p>
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

export default AddPlaylistPage;
