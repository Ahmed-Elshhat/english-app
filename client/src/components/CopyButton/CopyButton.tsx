import { useState } from "react";
import "./CopyButton.scss";
import { FaCheck } from "react-icons/fa";
import { GoCopy } from "react-icons/go";

function CopyButton({ couponId }: { couponId: string }) {
  const [copied, setCopied] = useState({
    status: false,
    id: "",
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ status: true, id: text });
      setTimeout(() => setCopied({ status: false, id: text }), 1000);
    } catch (err) {
      console.error("فشل النسخ:", err);
    }
  };

  return (
    <button
      onClick={() => copyToClipboard(couponId)}
      className={`copy-btn ${
        copied.status && copied.id === couponId ? "copied" : ""
      }`}
      title={`ID: ${couponId}`}
    >
      {copied.status && copied.id === couponId ? "copied" : "copy"}
      {copied.status && copied.id === couponId ? <FaCheck /> : <GoCopy />}
    </button>
  );
}

export default CopyButton;
