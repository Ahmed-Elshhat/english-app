import Link from "next/link";
import "./unauthorized.scss";

export default function Unauthorized() {
  return (
    <div className="Unauthorized">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="glitch">
        <h1>401</h1>
        <h2>PAGE UNAUTHORIZED</h2>
        <p>Sorry, you don’t have permission to access this page.</p>
        <Link href="/" className="home-btn">
          Take Me Home
        </Link>
      </div>
    </div>
  );
}
