"use client";
import Link from "next/link";
import Image from "next/image";
import { PLAYLISTS } from "@/Api/Api";
import { PlaylistSchema } from "@/Types/app";
import { RiPlayList2Fill } from "react-icons/ri";
import { useCallback, useEffect, useRef, useState } from "react";
import "./PlaylistsCards.scss";
import { AxiosClient } from "@/Api/axiosClient";

// Type definition for the component props
type PlaylistCards = {
  playlistsList: PlaylistSchema[]; // Initial playlists to display
  remainingPages: number; // Number of remaining pages for infinite scroll
  playlistsType: string; // Type of playlists: "series" or "movie"
};

function PlaylistCards({
  playlistsList,
  remainingPages,
  playlistsType,
}: PlaylistCards) {
  // State to store playlists displayed in the UI
  const [playlists, setPlaylists] = useState<PlaylistSchema[]>([]);
  // Loading state for fetching more playlists during infinite scroll
  const [loading, setLoading] = useState<boolean>(false);

  // Ref to keep track of remaining pages without triggering re-renders
  const currentRemainingPages = useRef<number>(0);
  // Ref to track IDs of playlists already fetched to avoid duplicates
  const excludeIds = useRef<string[]>([]);

  // Initialize state and refs when component mounts or props change
  useEffect(() => {
    setPlaylists(playlistsList);
    currentRemainingPages.current = remainingPages;
    excludeIds.current.push(...playlistsList.map((playlist) => playlist._id));
  }, [playlistsList, remainingPages]);

  // Function to fetch more playlists when user scrolls near the bottom
  const fetchMorePlaylists = useCallback(async () => {
    // Stop if already loading or no more pages to fetch
    if (loading || currentRemainingPages.current === 0) return;

    // Check if the user has scrolled near the bottom
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight -
        (window.scrollX <= 710 ? 500 : 300) // Adjust threshold for smaller screens
    ) {
      setLoading(true); // Start loading state
      try {
        const axios = AxiosClient();
        // Make POST request to fetch random playlists
        const res = await axios.post(
          `${PLAYLISTS}/random?playlistsType=${
            playlistsType || "series"
          }&playlistsSize=3`,
          { excludeIds: excludeIds.current }, // Send already fetched IDs to avoid duplicates
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 200) {
          // Update playlists state without duplicates
          setPlaylists((prev) => {
            const newOnes = res.data.playlists.filter(
              (p: PlaylistSchema) => !prev.some((item) => item._id === p._id)
            );
            return [...prev, ...newOnes];
          });

          // Add newly fetched IDs to excludeIds ref
          excludeIds.current.push(
            ...res.data.playlists.map(
              (playlist: PlaylistSchema) => playlist._id
            )
          );

          // Update remaining pages count
          currentRemainingPages.current = res.data.remainingPages;
        }
      } catch (err) {
        console.log(err); // Log any errors for debugging
      } finally {
        setLoading(false); // Stop loading state
      }
    }
  }, [loading, playlistsType]);

  // Attach scroll event listener to fetch more playlists dynamically
  useEffect(() => {
    window.addEventListener("scroll", fetchMorePlaylists);
    return () => window.removeEventListener("scroll", fetchMorePlaylists);
  }, [fetchMorePlaylists]);

  return (
    <div className="cards">
      {/* Map through playlists and display each as a card */}
      {playlists.map((playlist) => (
        <Link
          href={`/seasons&episodes?playlistId=${playlist._id}`}
          key={playlist._id}
        >
          <div className="card">
            <div className="image">
              {/* 
                Playlist image using Next.js Image component
                - `fill` fills the parent container
                - `sizes` helps Next.js optimize image loading
                - `priority` ensures critical images load faster
              */}
              <Image
                src={playlist.imageUrl}
                alt="playlist image"
                priority
                fill
                sizes="(max-width: 550px) 140px, 250px"
              />
              {/* Display number of videos in the playlist */}
              <span>{playlist.seasons[0].countOfEpisodes || 0} videos</span>
              {/* Playlist icon */}
              <RiPlayList2Fill />
            </div>
            <div className="content">
              {/* Playlist title */}
              <h2>{playlist.title}</h2>
              {/* Playlist description */}
              <p>{playlist.description}</p>
            </div>
          </div>
        </Link>
      ))}

      {/* Loading spinner shown when fetching more playlists */}
      {loading && <div className="loading"></div>}
    </div>
  );
}

export default PlaylistCards;
