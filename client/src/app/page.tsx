"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import "./Home.scss";
import { useEffect, useRef, useState } from "react";

function Home() {
  const [width, setWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function sliderWidth() {
      if (carouselRef.current) {
        setWidth(
          carouselRef.current.scrollWidth - carouselRef.current.offsetWidth
        );
      }
    }

    let count = 0;

    if (count !== 1) {
      sliderWidth();
      count = 1;
    }

    window.addEventListener("resize", sliderWidth);

    return () => {
      window.removeEventListener("resize", sliderWidth);
    };
  }, []);

  return (
    <div className="Home">
      <header>
        <div className="top_par">
          <div className="left_side">
            <Link href="/">
              <div className="logo">
                <Image
                  src="/images/logos/logo1.png"
                  alt="logo"
                  width={150} // غيرها حسب الحجم المناسب
                  height={150} // غيرها حسب الحجم المناسب
                  priority // يخلي اللوجو يتحمل بدري (مهم للأداء)
                />
              </div>
              <span className="company_name">Arablish</span>
            </Link>
          </div>

          <div className="right_side">
            <nav>
              <Link href="/login">
                <button className="signin_btn">Sign in</button>
              </Link>
              <Link href="/signup">
                <button className="signup_btn">Sign up</button>
              </Link>
            </nav>
          </div>
        </div>
        <div className="content">
          <h1>Let&apos;s move to the next level</h1>
          <p>
            Master advanced English by watching engaging cartoon videos. Every
            scene comes with side-by-side English and Arabic subtitles, helping
            you learn new words naturally while enjoying the story.
          </p>
          <Link href="/login">
            <button>Let&apos;s learn</button>
          </Link>
        </div>
      </header>

      <div className="section playlist_section">
        <div className="cover">
          <div className="image">
            <Image
              src="/images/section_img.png"
              alt="playlist section image"
              width={150}
              height={150}
              priority
            />
          </div>
        </div>

        <div className="content">
          <h2>Only Real-Life Expressions!</h2>
          <p>Learn useful native speaker expressions through real videos</p>
        </div>
      </div>

      <div className="section video_section">
        <div className="cover">
          <div className="image">
            <Image
              src="/images/section_img.png"
              alt="playlist section image"
              width={150}
              height={150}
              priority
            />
          </div>
        </div>

        <div className="content">
          <h2>Only Real-Life Expressions!</h2>
          <p>Learn useful native speaker expressions through real videos</p>
        </div>
      </div>

      <div className="section flash_card_section">
        <div className="cover">
          <div className="image">
            <Image
              src="/images/section_img.png"
              alt="playlist section image"
              width={150}
              height={150}
              priority
            />
          </div>
        </div>

        <div className="content">
          <h2>Only Real-Life Expressions!</h2>
          <p>Learn useful native speaker expressions through real videos</p>
        </div>
      </div>

      <div className="section vocab_section">
        {" "}
        <div className="cover">
          <div className="image">
            <Image
              src="/images/section_img.png"
              alt="playlist section image"
              width={150}
              height={150}
              priority
            />
          </div>
        </div>
        <div className="content">
          <h2>Only Real-Life Expressions!</h2>
          <p>Learn useful native speaker expressions through real videos</p>
        </div>
      </div>

      <div className="section quizzes_section">
        {" "}
        <div className="cover">
          <div className="image">
            <Image
              src="/images/section_img.png"
              alt="playlist section image"
              width={150}
              height={150}
              priority
            />
          </div>
        </div>
        <div className="content">
          <h2>Only Real-Life Expressions!</h2>
          <p>Learn useful native speaker expressions through real videos</p>
        </div>
      </div>

      <div className="section plans_section">
        {" "}
        <div className="cover">
          <div className="image">
            <Image
              src="/images/section_img.png"
              alt="playlist section image"
              width={150}
              height={150}
              priority
            />
          </div>
        </div>
        <div className="content">
          <h2>Only Real-Life Expressions!</h2>
          <p>Learn useful native speaker expressions through real videos</p>
        </div>
      </div>

      <section className="reviews">
        <h2 data-aos="fade-down">REVIEWS</h2>
        <motion.div
          className="carousel"
          ref={carouselRef}
          whileTap={{ cursor: "grabbing" }}
          data-aos="fade-up"
        >
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            className="inner-carousel"
          >
            <div className="review">
              <header>
                <div className="info">
                  <div className="image">
                    <Image
                      src="/images/userTwo.png"
                      alt="logo"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="name-and-email">
                    <h4 className="name">Ali Ahmed</h4>
                    <span className="email">Al1124@gmail.com</span>
                  </div>
                </div>

                <div className="image">
                  <Image
                    src="/images/quote.png"
                    alt="logo"
                    width={150}
                    height={150}
                    priority
                  />
                </div>
              </header>

              <p className="review-content">
                A freelance site that offers various opportunities in fields of
                work such as design, programming, and telephone, with a secure
                payment system and an easy interface, but it requires excellence
                to manage the fierce competition and bear the bank&apos;s
                currencies.
              </p>
            </div>
            <div className="review">
              <header>
                <div className="info">
                  <div className="image">
                    <Image
                      src="/images/userTwo.png"
                      alt="logo"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="name-and-email">
                    <h4 className="name">Ali Ahmed</h4>
                    <span className="email">Al1124@gmail.com</span>
                  </div>
                </div>

                <div className="image">
                  <Image
                    src="/images/quote.png"
                    alt="logo"
                    width={150}
                    height={150}
                    priority
                  />
                </div>
              </header>

              <p className="review-content">
                A freelance site that offers various opportunities in fields of
                work such as design, programming, and telephone, with a secure
                payment system and an easy interface, but it requires excellence
                to manage the fierce competition and bear the bank&apos;s
                currencies.
              </p>
            </div>
            <div className="review">
              <header>
                <div className="info">
                  <div className="image">
                    <Image
                      src="/images/userTwo.png"
                      alt="logo"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="name-and-email">
                    <h4 className="name">Ali Ahmed</h4>
                    <span className="email">Al1124@gmail.com</span>
                  </div>
                </div>

                <div className="image">
                  <Image
                    src="/images/quote.png"
                    alt="logo"
                    width={150}
                    height={150}
                    priority
                  />
                </div>
              </header>

              <p className="review-content">
                A freelance site that offers various opportunities in fields of
                work such as design, programming, and telephone, with a secure
                payment system and an easy interface, but it requires excellence
                to manage the fierce competition and bear the bank&apos;s
                currencies.
              </p>
            </div>
            <div className="review">
              <header>
                <div className="info">
                  <div className="image">
                    <Image
                      src="/images/userTwo.png"
                      alt="logo"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="name-and-email">
                    <h4 className="name">Ali Ahmed</h4>
                    <span className="email">Al1124@gmail.com</span>
                  </div>
                </div>

                <div className="image">
                  <Image
                    src="/images/quote.png"
                    alt="logo"
                    width={150}
                    height={150}
                    priority
                  />
                </div>
              </header>

              <p className="review-content">
                A freelance site that offers various opportunities in fields of
                work such as design, programming, and telephone, with a secure
                payment system and an easy interface, but it requires excellence
                to manage the fierce competition and bear the bank&apos;s
                currencies.
              </p>
            </div>
            <div className="review">
              <header>
                <div className="info">
                  <div className="image">
                    <Image
                      src="/images/userTwo.png"
                      alt="logo"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="name-and-email">
                    <h4 className="name">Ali Ahmed</h4>
                    <span className="email">Al1124@gmail.com</span>
                  </div>
                </div>

                <div className="image">
                  <Image
                    src="/images/quote.png"
                    alt="logo"
                    width={150}
                    height={150}
                    priority
                  />
                </div>
              </header>

              <p className="review-content">
                A freelance site that offers various opportunities in fields of
                work such as design, programming, and telephone, with a secure
                payment system and an easy interface, but it requires excellence
                to manage the fierce competition and bear the bank&apos;s
                currencies.
              </p>
            </div>
            <div className="review">
              <header>
                <div className="info">
                  <div className="image">
                    <Image
                      src="/images/userTwo.png"
                      alt="logo"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="name-and-email">
                    <h4 className="name">Ali Ahmed</h4>
                    <span className="email">Al1124@gmail.com</span>
                  </div>
                </div>

                <div className="image">
                  <Image
                    src="/images/quote.png"
                    alt="logo"
                    width={150}
                    height={150}
                    priority
                  />
                </div>
              </header>

              <p className="review-content">
                A freelance site that offers various opportunities in fields of
                work such as design, programming, and telephone, with a secure
                payment system and an easy interface, but it requires excellence
                to manage the fierce competition and bear the bank&apos;s
                currencies.
              </p>
            </div>
            <div className="review">
              <header>
                <div className="info">
                  <div className="image">
                    <Image
                      src="/images/userTwo.png"
                      alt="logo"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="name-and-email">
                    <h4 className="name">Ali Ahmed</h4>
                    <span className="email">Al1124@gmail.com</span>
                  </div>
                </div>

                <div className="image">
                  <Image
                    src="/images/quote.png"
                    alt="logo"
                    width={150}
                    height={150}
                    priority
                  />
                </div>
              </header>

              <p className="review-content">
                A freelance site that offers various opportunities in fields of
                work such as design, programming, and telephone, with a secure
                payment system and an easy interface, but it requires excellence
                to manage the fierce competition and bear the bank&apos;s
                currencies.
              </p>
            </div>
            <div className="review">
              <header>
                <div className="info">
                  <div className="image">
                    <Image
                      src="/images/userTwo.png"
                      alt="logo"
                      width={150}
                      height={150}
                      priority
                    />
                  </div>
                  <div className="name-and-email">
                    <h4 className="name">Ali Ahmed</h4>
                    <span className="email">Al1124@gmail.com</span>
                  </div>
                </div>

                <div className="image">
                  <Image
                    src="/images/quote.png"
                    alt="logo"
                    width={150}
                    height={150}
                    priority
                  />
                </div>
              </header>

              <p className="review-content">
                A freelance site that offers various opportunities in fields of
                work such as design, programming, and telephone, with a secure
                payment system and an easy interface, but it requires excellence
                to manage the fierce competition and bear the bank&apos;s
                currencies.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;
