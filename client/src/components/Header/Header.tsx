import Link from "next/link";
import "./Header.scss";
import Image from "next/image";
import { IoSettings } from "react-icons/io5";
import { MdDashboardCustomize } from "react-icons/md";

function Header() {
  return (
    <header className="Header">
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

      <div className="center">
        <nav>
          <div className="links">
            <span className="icon">
              <span></span>
              <span></span>
              <span></span>
            </span>

            <ul>
              <li>
                <Link href="/dashboard">
                  <span></span>
                  <MdDashboardCustomize />
                  Dashboard
                  <span></span>
                </Link>
              </li>
              <li>
                <Link href="/playlists/series">
                  playlists
                  <span></span>
                  <span></span>
                </Link>
              </li>

              <li>
                <Link href="/videos">
                  videos
                  <span></span>
                  <span></span>
                </Link>
              </li>

              <li>
                <Link href="/flashCards">
                  Flash cards
                  <span></span>
                  <span></span>
                </Link>
              </li>

              <li>
                <Link href="/quizzes">
                  Quizzes
                  <span></span>
                  <span></span>
                </Link>
              </li>

              <li>
                <Link href="/plans">
                  Plans
                  <span></span>
                  <span></span>
                </Link>
              </li>

              <li>
                <Link href="/history/videos">
                  History
                  <span></span>
                  <span></span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="right_side">
        <nav>
          <div className="links">
            <span className="icon">
              <span></span>
              <span></span>
              <span></span>
            </span>

            <ul>
              <li>
                <Link href="/dashboard">
                  <span></span>
                  <MdDashboardCustomize />
                  Dashboard
                  <span></span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="points">5</div>
      </div>
    </header>
  );
}

export default Header;
