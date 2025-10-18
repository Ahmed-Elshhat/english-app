import Link from "next/link";
import { AxiosServer } from "@/Api/axiosServer";
import { PLAYLISTS } from "@/Api/Api";
import { PlaylistSchema } from "@/Types/app";
import PlaylistCards from "@/components/PlaylistsCards/PlaylistsCards";
import "./series.scss";

// Page for displaying "Series" playlists
async function SeriesPlaylistsPage() {
  // Array to store playlists fetched from the server
  const playlists: PlaylistSchema[] = [];
  // Number of remaining pages for infinite scroll
  let remainingPages: number = 0;

  
  try {
    const axios = await AxiosServer();
    // Fetch random playlists from the server (3 playlists per request)
    const res = await axios.post(
      `${PLAYLISTS}/random?playlistsType=series&playlistsSize=3`
    );

    if (res.status === 200) {
      const data = res.data;
      // Store the fetched playlists in the array
      playlists.push(...data.playlists);
      // Save the number of remaining pages to use later in infinite scroll
      remainingPages = data.remainingPages;
    }
  } catch (err) {
    // Log any errors that occur during fetching for debugging
    console.log(err);
  }

  return (
    <div className="Series_Playlists">
      {/* Filter buttons to switch between Series and Movies playlists */}
      <div className="filtration">
        <Link href="/playlists/series">
          <button>Series</button>
        </Link>
        <Link href="/playlists/movies">
          <button>Movies</button>
        </Link>
      </div>

      {/* 
        PlaylistCards component displays the playlists as cards.
        Props:
          - playlistsList: the playlists to display
          - remainingPages: how many pages are left for infinite scroll
          - playlistsType: type of playlists ("series" in this case)
      */}
      <PlaylistCards
        playlistsList={playlists}
        remainingPages={remainingPages}
        playlistsType={"series"}
      />
    </div>
  );
}

export default SeriesPlaylistsPage;
