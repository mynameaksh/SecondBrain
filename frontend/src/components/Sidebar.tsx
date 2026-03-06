import { TwitterIcon } from "../icons/TwitterIcon";
import { YouTubeIcon } from "../icons/YoutubeIcon";
import SidebarItem from "./SidebarItem";

export type ContentFilter = "all" | "twitter" | "youtube";

interface SidebarProps {
  filter: ContentFilter;
  setFilter: (filter: ContentFilter) => void;
  username: string;
  onLogout: () => void;
}

function Sidebar({ filter, setFilter, username, onLogout }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-gray-200 bg-white px-5 py-5">
      <div className="mb-1 text-2xl font-semibold text-[#4f469c]">Second Brain</div>
      <div className="mb-6 text-sm text-gray-500">@{username}</div>

      <div className="space-y-2">
        <SidebarItem
          text="All"
          active={filter === "all"}
          onClick={() => setFilter("all")}
          icon={<span className="text-sm font-semibold">#</span>}
        />
        <SidebarItem
          text="Twitter"
          active={filter === "twitter"}
          onClick={() => setFilter("twitter")}
          icon={<TwitterIcon />}
        />
        <SidebarItem
          text="YouTube"
          active={filter === "youtube"}
          onClick={() => setFilter("youtube")}
          icon={<YouTubeIcon />}
        />
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-8 w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
