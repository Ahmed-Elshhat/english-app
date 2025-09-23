import Image from "next/image";
import "./Loading.scss";

function Loading() {
  return (
    <div className="loading-overlay">
      <Image
        src="/images/logos/logo1.png"
        alt="logo"
        width={150}
        height={150}
        priority
      />
      <div className="bars">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

export default Loading;
