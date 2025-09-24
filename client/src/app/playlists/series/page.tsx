import Link from "next/link";
import { Axios } from "@/Api/axios";
import { PLAYLISTS } from "@/Api/Api";
import { PlaylistSchema } from "@/Types/app";
import "./series.scss";
import PlaylistCards from "@/components/PlaylistsCards/PlaylistsCards";

async function SeriesPlaylistsPage() {
  const playlists: PlaylistSchema[] = [];
  let remainingPages: number = 0;

  try {
    const res = await Axios.post(
      `${PLAYLISTS}/random?playlistsType=series&playlistsSize=3`
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
    <div className="Series_Playlists">
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
        playlistsType={"series"}
      />
    </div>
  );
}

export default SeriesPlaylistsPage;
