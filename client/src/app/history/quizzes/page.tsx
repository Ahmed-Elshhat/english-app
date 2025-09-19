import Header from "@/components/Header/Header";
import React from "react";
import "./quizzes.scss";
import Image from "next/image";
import Link from "next/link";

function HistoryQuizzesPage() {
  return (
    <div className="History_Quizzes">
      <Header />
      <h2>History</h2>
      {/* Navigation */}
      <div className="filtration">
        <Link href="/history/videos">
          <button>Videos</button>
        </Link>
        <Link href="/history/flashCards">
          <button>Flashcards</button>
        </Link>
        <Link href="/history/quizzes">
          <button className="active">Quizzes</button>
        </Link>
      </div>

      {/* Content */}
      <div className="history-content">
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
  );
}

export default HistoryQuizzesPage;
