import Link from "next/link";
import { Axios } from "@/Api/axios";
import { PLAYLISTS } from "@/Api/Api";
import { PlaylistSchema } from "@/Types/app";
import PlaylistCards from "@/components/PlaylistsCards/PlaylistsCards";
import "./movies.scss";

// Page component for displaying "Movies" playlists
async function MoviesPlaylistsPage() {
  // Array to store playlists fetched from the server
  const playlists: PlaylistSchema[] = [];
  // Number of remaining pages for infinite scroll
  let remainingPages: number = 0;

  try {
    // Fetch random movie playlists from the server (3 playlists per request)
    const res = await Axios.post(
      `${PLAYLISTS}/random?playlistsType=movie&playlistsSize=3`
    );

    if (res.status === 200) {
      const data = res.data;
      // Store the fetched playlists in the array
      playlists.push(...data.playlists);
      // Store the number of remaining pages for later use in infinite scroll
      remainingPages = data.remainingPages;
    }
  } catch (err) {
    // Log any errors during the fetch for debugging
    console.log(err);
  }

  return (
    <div className="Movies_Playlists">
      {/* 
        Filter buttons to switch between Series and Movies playlists.
        Clicking these buttons navigates to the respective pages.
      */}
      <div className="filtration">
        <Link href="/playlists/series">
          <button>Series</button>
        </Link>
        <Link href="/playlists/movies">
          <button>Movies</button>
        </Link>
      </div>

      {/* 
        PlaylistCards component displays playlists in card format.
        Props:
          - playlistsList: array of playlists to display
          - remainingPages: number of remaining pages for infinite scroll
          - playlistsType: type of playlists ("movie" in this case)
      */}
      <PlaylistCards
        playlistsList={playlists}
        remainingPages={remainingPages}
        playlistsType={"movie"}
      />
    </div>
  );
}

export default MoviesPlaylistsPage;
