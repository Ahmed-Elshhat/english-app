import Header from "@/components/Header/Header";
import React from "react";
import "./videos.scss";
import Image from "next/image";
import Link from "next/link";

function HistoryVideosPage() {
  return (
    <div className="History_Videos">
      <Header />
      <h2>History</h2>
      {/* Navigation */}
      <div className="filtration">
        <Link href="/history/videos">
          <button className="active">Videos</button>
        </Link>
        <Link href="/history/flashCards">
          <button>Flash cards</button>
        </Link>
        <Link href="/history/quizzes">
          <button>Quizzes</button>
        </Link>
      </div>

      {/* Content */}
      <div className="history-content">
        <div className="cards">
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
          <Link href="/watch/1">
            <div className="card">
              <div className="image">
                <Image
                  src="/images/poster.png"
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
    </div>
  );
}

export default HistoryVideosPage;
