import Image from "next/image";
import { RiPlayList2Fill } from "react-icons/ri";
import "./series.scss";
import Link from "next/link";

function SeriesPlaylistsPage() {
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
      <div className="cards">
        <Link href="/seasons&episodes">
          <div className="card">
            <div className="image">
              <Image
                src="/images/series_playlist_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
              <span>10 videos</span>
              <RiPlayList2Fill />
            </div>
            <div className="content">
              <h2>Difference between I wish and I hope</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Deserunt, doloremque.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/seasons&episodes">
          <div className="card">
            <div className="image">
              <Image
                src="/images/series_playlist_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
              <span>10 videos</span>
              <RiPlayList2Fill />
            </div>
            <div className="content">
              <h2>Difference between I wish and I hope</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Deserunt, doloremque.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/seasons&episodes">
          <div className="card">
            <div className="image">
              <Image
                src="/images/series_playlist_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
              <span>10 videos</span>
              <RiPlayList2Fill />
            </div>
            <div className="content">
              <h2>Difference between I wish and I hope</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Deserunt, doloremque.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/seasons&episodes">
          <div className="card">
            <div className="image">
              <Image
                src="/images/series_playlist_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
              <span>10 videos</span>
              <RiPlayList2Fill />
            </div>
            <div className="content">
              <h2>Difference between I wish and I hope</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Deserunt, doloremque.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/seasons&episodes">
          <div className="card">
            <div className="image">
              <Image
                src="/images/series_playlist_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
              <span>10 videos</span>
              <RiPlayList2Fill />
            </div>
            <div className="content">
              <h2>Difference between I wish and I hope</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Deserunt, doloremque.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default SeriesPlaylistsPage;
