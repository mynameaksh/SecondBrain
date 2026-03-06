import { TwitterIcon } from "../icons/TwitterIcon"
import { YouTubeIcon } from "../icons/YoutubeIcon"
import SidebarItem from "./SidebarItem"

function Sidebar() {
    return (
        <div className='h-screen bg-white border-r w-72 fixed left-0 top-0 pl-6'>
            <div className="flex text-2xl mt-2">Brainly</div>
            <div className="pt-4 ">
                <SidebarItem text="Twitter" icon={<TwitterIcon />} />
                <SidebarItem text="Youtube" icon={<YouTubeIcon />} />
            </div>
        </div>
    )
}

export default Sidebar