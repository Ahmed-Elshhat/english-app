import Image from "next/image";
import { RiPlayList2Fill } from "react-icons/ri";
import "./series.scss";

function SeriesPlaylistsPage() {
  return (
    <div className="Series_Playlists">
      {" "}
      <div className="cards">
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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt,
              doloremque.
            </p>
          </div>
        </div>

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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt,
              doloremque.
            </p>
          </div>
        </div>

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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt,
              doloremque.
            </p>
          </div>
        </div>

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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt,
              doloremque.
            </p>
          </div>
        </div>

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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt,
              doloremque.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeriesPlaylistsPage;
