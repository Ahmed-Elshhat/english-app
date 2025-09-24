import Link from "next/link";
import Image from "next/image";
import { RiPlayList2Fill } from "react-icons/ri";
import { Axios } from "@/Api/axios";
import { PLAYLISTS } from "@/Api/Api";
import { PlaylistSchema } from "@/Types/app";
import PlaylistCards from "@/components/PlaylistsCards/PlaylistsCards";
import "./movies.scss";

async function MoviesPlaylistsPage() {
  const playlists: PlaylistSchema[] = [];
  let remainingPages: number = 0;

  try {
    const res = await Axios.post(
      `${PLAYLISTS}/random?playlistsType=movie&playlistsSize=3`
    );
    if (res.status === 200) {
      const data = res.data;
      playlists.push(...data.playlists);
      remainingPages = data.remainingPages;
    }
  } catch (err) {
    console.log(err);
  }
  return (
    <div className="Movies_Playlists">
      <div className="filtration">
        <Link href="/playlists/series">
          <button>Series</button>
        </Link>
        <Link href="/playlists/movies">
          <button>Movies</button>
        </Link>
      </div>
      <PlaylistCards
        playlistsList={playlists}
        remainingPages={remainingPages}
        playlistsType={"movie"}
      />
    </div>
  );
}

export default MoviesPlaylistsPage;
