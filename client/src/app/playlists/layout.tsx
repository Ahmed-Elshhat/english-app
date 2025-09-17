import Header from "@/components/Header/Header";
import "./playlists.scss";
import Link from "next/link";

export default function PlaylistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="Playlists">
      <Header />
      <h2>Playlists</h2>
      <div className="filtration">
        <Link href="/playlists/series">
          <button>Series</button>
        </Link>
        <Link href="/playlists/movies">
          <button>Movies</button>
        </Link>
      </div>
      {children}
    </div>
  );
}
