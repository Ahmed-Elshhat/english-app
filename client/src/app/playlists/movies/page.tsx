import Image from "next/image";
import { RiPlayList2Fill } from "react-icons/ri";
import "./movies.scss";

function MoviesPlaylistsPage() {
  return (
    <div className="Movies_Playlists">
      <div className="cards">
        <div className="card">
          <div className="image">
            <Image
              src="/images/movies_playlist_img.jpeg"
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
              src="/images/movies_playlist_img.jpeg"
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
              src="/images/movies_playlist_img.jpeg"
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
              src="/images/movies_playlist_img.jpeg"
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
              src="/images/movies_playlist_img.jpeg"
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

export default MoviesPlaylistsPage;
