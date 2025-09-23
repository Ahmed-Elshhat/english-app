"use client";
import Link from "next/link";
import { useMenu } from "@/context/MenuContext";
import { useWindow } from "@/context/windowContext";
// import { useAppSelector } from "@/Redux/app/hooks";
import SidebarLinks from "../NavLink";
import { IoMenu } from "react-icons/io5";
import "./Sidebar.scss";

function SideBar() {
  // const { data } = useAppSelector((state) => state.user);
  const data = {
    role: "admin",
  };
  const links = SidebarLinks();
  const menu = useMenu();
  const windowSize = useWindow();
  const isOpen = menu?.isOpen;

  const isLargeScreen = windowSize?.windowSize && windowSize.windowSize > 839;
  // const isSmallScreen = windowSize?.windowSize && windowSize.windowSize < 839;

  return (
    <div
      className="Sidebar"
      style={{
        width: isOpen && isLargeScreen ? "230px" : "60px",
      }}
    >
      <div className="menu" style={{ justifyContent: !isOpen ? "center" : "" }}>
        <button onClick={() => menu?.setIsOpen(!isOpen)}>
          <IoMenu />
        </button>
      </div>
      <div className="links">
        {links.map(
          (link, key) =>
            link.role.includes(data ? data.role : "") && (
              <Link
                key={key}
                href={link.path}
                title={link.name}
                className="link"
                // end
                style={{
                  justifyContent:
                    isOpen && isLargeScreen ? "flex-start" : "center",
                }}
                // onClick={() => isSmallScreen && menu?.setIsOpen(false)}
              >
                {link.icon}
                <p
                  className="title"
                  style={{
                    display: isOpen && isLargeScreen ? "block" : "none",
                  }}
                >
                  {link.name}
                </p>
              </Link>
            )
        )}
      </div>
    </div>
  );
}

export default SideBar;
