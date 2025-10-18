"use client";
import Image from "next/image";
import "./watch.scss";
import Header from "@/components/Header/Header";
import { RiRepeat2Line } from "react-icons/ri";
import { IoPause } from "react-icons/io5";
import Link from "next/link";
import { MdPlayDisabled } from "react-icons/md";
import { useEffect, useRef, useState } from "react";

interface Cue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

function WatchPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [subtitlesEn, setSubtitlesEn] = useState<Cue[]>([
    {
      id: "1",
      startTime: 0,
      endTime: 4000,
      text: "Hello, how are you?",
    },
    {
      id: "2",
      startTime: 4000,
      endTime: 7000,
      text: "I'm fine, thank you.",
    },
    {
      id: "3",
      startTime: 7000,
      endTime: 10000,
      text: "Welcome to our English learning app.",
    },
  ]);
  const [subtitlesAr, setSubtitlesAr] = useState<Cue[]>([
    {
      id: "1",
      startTime: 0,
      endTime: 4000,
      text: "مرحباً، كيف حالك؟",
    },
    {
      id: "2",
      startTime: 4000,
      endTime: 7000,
      text: "أنا بخير، شكراً لك.",
    },
    {
      id: "3",
      startTime: 7000,
      endTime: 10000,
      text: "أهلاً بك في تطبيق تعلم الإنجليزية.",
    },
  ]);
  const [currentTextEn, setCurrentTextEn] = useState("");
  const [currentTextAr, setCurrentTextAr] = useState("");
  const [visibleEn, setVisibleEn] = useState(false);
  const [visibleAr, setVisibleAr] = useState(false);

  useEffect(() => {
    let animationFrameId: number;

    const updateSubtitles = () => {
      if (!videoRef.current) {
        animationFrameId = requestAnimationFrame(updateSubtitles);
        return;
      }

      const currentTime = videoRef.current.currentTime * 1000;

      const en = subtitlesEn.find(
        (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
      );
      const ar = subtitlesAr.find(
        (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
      );

      if (en?.text !== currentTextEn) {
        setVisibleEn(false);
        setTimeout(() => {
          setCurrentTextEn(en ? en.text : "");
          setVisibleEn(!!en);
        }, 150); // زمن خفيف للـ fade-out قبل إدخال النص الجديد
      }

      if (ar?.text !== currentTextAr) {
        setVisibleAr(false);
        setTimeout(() => {
          setCurrentTextAr(ar ? ar.text : "");
          setVisibleAr(!!ar);
        }, 150);
      }

      animationFrameId = requestAnimationFrame(updateSubtitles);
    };

    animationFrameId = requestAnimationFrame(updateSubtitles);

    return () => cancelAnimationFrame(animationFrameId);
  }, [subtitlesEn, subtitlesAr, currentTextEn, currentTextAr]);

  return (
    <div className="Watch">
      <Header />
      <div className="container">
        {/* Main Content */}
        <div className="main-content">
          {/* Subtitles */}
          <div className="subtitles">
            <div className="block_video">
              <MdPlayDisabled />
              <h3>
                Content limited to subscribers. Subscribe to arablish to access
                video
              </h3>
              <Link href="/plans">
                <button>Go to subscribe</button>
              </Link>
            </div>
            {/* Video Player */}
            <div className="video-player">
              <video ref={videoRef} controls poster="/images/poster.png">
                <source src="/videos/video2.mp4" type="video/mp4" />
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
            <p className="en" /*  style={{ opacity: visibleEn ? "1" : "0" }} */>
              {/* But now <span className="highlight">I&apos;m out of time</span>. */}
              {currentTextEn}
            </p>
            <p className="ar" /*  style={{ opacity: visibleAr ? "1" : "0" }} */>
              {/* ولكن الآن <span className="highlight">لقد نفد وقتي</span>. */}
              {currentTextAr}
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

// useEffect(() => {
//   const interval = setInterval(() => {
//     if (!videoRef.current) return;
//     const currentTime = videoRef.current.currentTime * 1000;

//     const en = subtitlesEn.find(
//       (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
//     );
//     const ar = subtitlesAr.find(
//       (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
//     );

//     setCurrentTextEn(en ? en.text : "");
//     setCurrentTextAr(ar ? ar.text : "");
//   }, 300); // يحدث كل 0.3 ثانية

//   return () => clearInterval(interval);
// }, [subtitlesEn, subtitlesAr]);
