import Sidebar from "@/components/Dashboard/Sidebar/Sidebar";
import "./layout.scss";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="Dashboard_Layout">
      <Sidebar />
      {children}
    </div>
  );
}
