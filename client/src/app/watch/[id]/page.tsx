// import "./watch.scss";

// function WatchPage() {
//   return <div className="Watch">WatchPage</div>;
// }

// export default WatchPage;

// WatchPage.jsx
import Image from "next/image";
import "./watch.scss";
import Header from "@/components/Header/Header";
import { RiRepeat2Line } from "react-icons/ri";
import { IoPause } from "react-icons/io5";
import Link from "next/link";

function WatchPage() {
  return (
    <div className="watch-page">
      <Header />
      <div className="container">
        {/* Main Content */}
        <div className="main-content">

          {/* Subtitles */}
          <div className="subtitles">
          {/* Video Player */}
          <div className="video-player">
            <video controls>
              <source src="/videos/video1.mp4" type="video/mp4" />
            </video>
          </div>
            <div className="controls">
              <button title="Speed">1x</button>
              <button title="Repeat sentences">
                <RiRepeat2Line />
              </button>
              <button title="Stop sentences">
                <IoPause /> S.S
              </button>
            </div>
            <p className="en">
              But now <span className="highlight">I&apos;m out of time</span>.
            </p>
            <p className="ar">
              ولكن الآن <span className="highlight">لقد نفد وقتي</span>.
            </p>
          </div>

          {/* Flashcards */}
          <div className="flashcards">
            <h3>Flashcards</h3>
            <div className="cards">
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/flashCards/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/flash_card_img.jpeg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>Difference</h2>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Quizzes */}
          <div className="quizzes">
            <h3>Quizzes</h3>

            <div className="cards">
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>{" "}
              <Link href="/quizzes/1">
                <div className="card">
                  <div className="image">
                    <Image
                      src="/images/quiz_img.jpg"
                      alt="video image"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="content">
                    <h2>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Deserunt, doloremque.
                    </h2>

                    <button>Check</button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="section">
            <div className="image">
              <Image
                src="/images/quiz_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
            </div>
            <div className="text">
              <h4>Episode 1</h4>
              <p>Short description about episode.</p>
            </div>
          </div>

          <div className="section">
            <div className="image">
              <Image
                src="/images/quiz_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
            </div>
            <div className="text">
              <h4>Episode 2</h4>
              <p>Short description about episode.</p>
            </div>
          </div>

          <div className="section">
            <div className="image">
              <Image
                src="/images/quiz_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
            </div>
            <div className="text">
              <h4>Episode 3</h4>
              <p>Short description about episode.</p>
            </div>
          </div>

          <div className="section">
            <div className="image">
              <Image
                src="/images/quiz_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
            </div>
            <div className="text">
              <h4>Episode 3</h4>
              <p>Short description about episode.</p>
            </div>
          </div>

          <div className="section">
            <div className="image">
              <Image
                src="/images/quiz_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
            </div>
            <div className="text">
              <h4>Episode 3</h4>
              <p>Short description about episode.</p>
            </div>
          </div>
          <div className="section">
            <div className="image">
              <Image
                src="/images/quiz_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
            </div>
            <div className="text">
              <h4>Episode 3</h4>
              <p>Short description about episode.</p>
            </div>
          </div>

          <div className="section">
            <div className="image">
              <Image
                src="/images/quiz_img.jpg"
                alt="video image"
                width={150}
                height={150}
                priority
              />
            </div>
            <div className="text">
              <h4>Episode 3</h4>
              <p>Short description about episode.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchPage;
