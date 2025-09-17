import Header from "@/components/Header/Header";
import "./layout.scss";

export default function QuizzesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="Quizzes_Layout">
      {" "}
      <Header />
      {children}
    </div>
  );
}
