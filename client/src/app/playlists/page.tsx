import Header from "@/components/Header/Header";
import "./playlists.scss";
import Image from "next/image";
import { RiPlayList2Fill } from "react-icons/ri";

function PlayListPage() {
  return (
    <div className="Playlists">
      <Header />

      <h2>Playlists</h2>

      <div className="cards">
        <div className="card">
          <div className="image">
            <Image
              src="/images/video_img.jpeg"
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
              src="/images/video_img.jpeg"
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
              src="/images/video_img.jpeg"
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
              src="/images/video_img.jpeg"
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
              src="/images/video_img.jpeg"
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

export default PlayListPage;
