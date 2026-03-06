import { type ReactElement } from "react";

interface SidebarItemProps {
  text: string;
  icon: ReactElement;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ text, icon, active = false, onClick }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-left transition-colors ${
        active ? "bg-[#e8e6fb] text-[#4f469c]" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="pr-2">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

export default SidebarItem;
