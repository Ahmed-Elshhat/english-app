"use client";
import Link from "next/link";
import Image from "next/image";
import { Axios } from "@/Api/axios";
import { PLAYLISTS } from "@/Api/Api";
import { PlaylistSchema } from "@/Types/app";
import { RiPlayList2Fill } from "react-icons/ri";
import { useCallback, useEffect, useRef, useState } from "react";
import "./PlaylistsCards.scss";

type PlaylistCards = {
  playlistsList: PlaylistSchema[];
  remainingPages: number;
  playlistsType: string;
};

function PlaylistCards({
  playlistsList,
  remainingPages,
  playlistsType,
}: PlaylistCards) {
  const [playlists, setPlaylists] = useState<PlaylistSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const currentRemainingPages = useRef<number>(0);
  const excludeIds = useRef<string[]>([]);

  useEffect(() => {
    setPlaylists(playlistsList);
    currentRemainingPages.current = remainingPages;
    excludeIds.current.push(...playlistsList.map((playlist) => playlist._id));
  }, [playlistsList, remainingPages]);

  const fetchMorePlaylists = useCallback(async () => {
    if (loading || currentRemainingPages.current === 0) return;

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight -
        (window.scrollX <= 710 ? 500 : 300)
    ) {
      setLoading(true);
      try {
        const res = await Axios.post(
          `${PLAYLISTS}/random?playlistsType=${
            playlistsType || "series"
          }&playlistsSize=3`,
          { excludeIds: excludeIds.current },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (res.status === 200) {
          setPlaylists((prev) => {
            const newOnes = res.data.playlists.filter(
              (p: PlaylistSchema) => !prev.some((item) => item._id === p._id)
            );
            return [...prev, ...newOnes];
          });

          excludeIds.current.push(
            ...res.data.playlists.map(
              (playlist: PlaylistSchema) => playlist._id
            )
          );

          currentRemainingPages.current = res.data.remainingPages;
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  }, [loading, playlistsType]);

  useEffect(() => {
    window.addEventListener("scroll", fetchMorePlaylists);
    return () => window.removeEventListener("scroll", fetchMorePlaylists);
  }, [fetchMorePlaylists]);

  return (
    <div className="cards">
      {playlists.map((playlist) => (
        <Link href="/seasons&episodes" key={playlist._id}>
          <div className="card">
            <div className="image">
              <Image
                src={playlist.imageUrl}
                alt="playlist image"
                priority
                fill
                sizes="(max-width: 550px) 140px, 250px"
              />
              <span>{playlist.seasons[0].countOfEpisodes || 0} videos</span>
              <RiPlayList2Fill />
            </div>
            <div className="content">
              <h2>{playlist.title}</h2>
              <p>{playlist.description}</p>
            </div>
          </div>
        </Link>
      ))}
      {loading && <div className="loading"></div>}
    </div>
  );
}

export default PlaylistCards;
