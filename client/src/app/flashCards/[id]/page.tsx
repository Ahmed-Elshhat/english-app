import Image from "next/image";
import "./flashCard.scss";

export default function FlashPage() {
  return (
    <div className="Flash_Page">
      <div className="cover">
        <div className="image_box">
          <Image
            src="/images/quiz_img.jpg"
            alt="video image"
            width={150}
            height={150}
            priority
          />
        </div>
        <div className="content">
          <div className="word_box">
            <h1 className="word">spaced out</h1>
            <span className="type">PHRASAL VERB</span>
          </div>

          <div className="example">
            <strong>Example:</strong> She{" "}
            <span className="highlight">spaced out</span> her study sessions
            over the week to avoid cramming.
          </div>

          <div className="explain">
            <strong>Explain:</strong> To arrange things with a space between
            them
          </div>
        </div>
      </div>
    </div>
  );
}
