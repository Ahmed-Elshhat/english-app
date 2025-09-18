import Header from "@/components/Header/Header";
import "./layout.scss";

export default function FlashCardsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="Flash_Cards_Layout">
      {" "}
      <Header />
      {children}
    </div>
  );
}
