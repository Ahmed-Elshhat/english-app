import { FaUser, FaUsers, FaVideo } from "react-icons/fa";
import { IoMdHome } from "react-icons/io";
import {
  RiMovie2Line,
  RiPlayList2Fill,
  RiUserAddFill,
  RiVideoAddLine,
} from "react-icons/ri";
import { MdLiveTv, MdOutlinePlaylistAdd } from "react-icons/md";
import { AiOutlineUsergroupAdd } from "react-icons/ai";

const SidebarLinks = () => {
  const links = [
    {
      name: "Home",
      path: "/playlists/series",
      icon: <IoMdHome />,
      role: ["admin", "employee"],
    },
    {
      name: "Users",
      path: `/dashboard/users`,
      icon: <FaUsers />,
      role: ["admin"],
    },
    {
      name: "Add user",
      path: `/dashboard/users/add`,
      icon: <AiOutlineUsergroupAdd />,
      role: ["admin"],
    },
    {
      name: "Employees",
      path: `/dashboard/employees`,
      icon: <FaUser />,
      role: ["admin"],
    },
    {
      name: "Add employee",
      path: `/dashboard/employees/add`,
      icon: <RiUserAddFill />,
      role: ["admin"],
    },
    {
      name: "Playlists",
      path: `/dashboard/playlists`,
      icon: <RiPlayList2Fill />,
      role: ["admin", "employee"],
    },
    {
      name: "Add playlist",
      path: `/dashboard/playlists/add`,
      icon: <MdOutlinePlaylistAdd />,
      role: ["admin", "employee"],
    },
    {
      name: "Episodes",
      path: `/dashboard/episodes`,
      icon: <MdLiveTv />,
      role: ["admin", "employee"],
    },
    {
      name: "Add episode",
      path: `/dashboard/episodes/add`,
      icon: <RiMovie2Line />,
      role: ["admin", "employee"],
    },
    {
      name: "Videos",
      path: `/dashboard/videos`,
      icon: <FaVideo />,
      role: ["admin", "employee"],
    },
    {
      name: "Add video",
      path: `/dashboard/videos/add`,
      icon: <RiVideoAddLine />,
      role: ["admin", "employee"],
    },
  ];

  return links;
};

export default SidebarLinks;
