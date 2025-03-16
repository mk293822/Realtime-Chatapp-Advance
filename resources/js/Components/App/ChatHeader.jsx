import React, { useState } from "react";
import TextInput from "../TextInput";
import SideBar from "@/Pages/Profile/SideBar";
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    UserPlusIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";

const ChatHeader = ({
    sidebar_button,
    edit_status,
    mustVerifyEmail,
    localConversations,
    onSearch = () => {},
}) => {
    const [showSearchBar, setShowSearchBar] = useState(false);

    return (
        <div className="flex gap-0 p-2  shadow-black/60 z-10 shadow-md h-[64px] justify-between items-center">
            <div className="drawer max-w-12">
                <input
                    id="my-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                />
                <div className="drawer-content w-20">
                    {/* Page content here */}
                    <label
                        htmlFor="my-drawer"
                        className="bg-transparent border-none outline-none cursor-pointer drawer-button"
                    >
                        <Bars3Icon className="size-8" />
                    </label>
                </div>
                <div className="drawer-side ">
                    <label
                        htmlFor="my-drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    {/* Sidebar content here */}
                    <SideBar
                        sidebar_button={sidebar_button}
                        status={edit_status}
                        mustVerifyEmail={mustVerifyEmail}
                        conversations={localConversations}
                    />
                </div>
            </div>
            {showSearchBar && (
                <label className="w-full">
                    <TextInput
                        onKeyUp={onSearch}
                        placeholder="Search"
                        className="w-full rounded-[10rem] h-10"
                    />
                    <XMarkIcon
                        className="size-4 absolute top-6 left-[16.5rem] cursor-pointer"
                        onClick={() => setShowSearchBar(false)}
                    />
                </label>
            )}
            <div className="flex gap-2">
                {!showSearchBar && (
                    <MagnifyingGlassIcon
                        className="size-6 cursor-pointer"
                        onClick={() => setShowSearchBar(true)}
                    />
                )}
                {!showSearchBar && (
                    <UserPlusIcon className="size-6 cursor-pointer" />
                )}
            </div>
        </div>
    );
};

export default ChatHeader;
