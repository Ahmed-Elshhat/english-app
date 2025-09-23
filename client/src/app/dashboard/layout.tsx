import Sidebar from "@/components/Dashboard/Sidebar/Sidebar";
import "./dashboard.scss";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="Dashboard">
      <Sidebar />
      {children}
    </div>
  );
}
