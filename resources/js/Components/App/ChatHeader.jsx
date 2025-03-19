import React, { useEffect, useRef, useState } from "react";
import TextInput from "../TextInput";
import SideBar from "@/Pages/Profile/SideBar";
import {
    Bars3Icon,
    BellAlertIcon,
    MagnifyingGlassIcon,
    UserMinusIcon,
    UserPlusIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import { useEventBus } from "@/EventBus";
import { usePage } from "@inertiajs/react";

const ChatHeader = ({
    sidebar_button,
    edit_status,
    mustVerifyEmail,
    onSearch = () => {},
    toggleShowAllUsers = () => {},
    conversations,
}) => {
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [pendingConversations, setPendingConversations] = useState([]);
    const searchRef = useRef(null);
    const { on } = useEventBus();
    const user = usePage().props.auth.user;

    useEffect(() => {
        const offConversationRequest = on(
            "conversation.request",
            handleConversationRequest
        );

        return () => {
            offConversationRequest();
        };
    }, [on]);

    const handleConversationRequest = ({ conversation }) => {
        setPendingConversations((pre) =>
            pre.some((con) => con.conversation_id === conversation.id)
                ? pre
                : [...pre, conversation]
        );
    };

    useEffect(() => {
        setPendingConversations(
            conversations
                .filter((con) => con.pending)
                .filter((con) => con.id == user.id)
        );
    }, [conversations]);

    const handleShowAllUsers = () => {
        toggleShowAllUsers();
        setShowAllUsers(!showAllUsers);
    };

    const handleOnSearchBtn = () => {
        if (searchRef.current) {
            searchRef.current.value = "";
            if (searchRef.current.onKeyUp) {
                searchRef.current.onKeyUp({
                    key: "",
                    target: searchRef.current,
                });
            }
        }
        setShowSearchBar(false);
    };

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
                    />
                </div>
            </div>
            {showSearchBar && (
                <label className="w-full">
                    <TextInput
                        ref={searchRef}
                        onKeyUp={onSearch}
                        placeholder="Search"
                        className="w-full rounded-[10rem] h-10"
                    />
                    <XMarkIcon
                        className="size-4 absolute top-6 left-[16.5rem] cursor-pointer"
                        onClick={handleOnSearchBtn}
                    />
                </label>
            )}
            <div className="flex gap-2 items-center">
                {!showSearchBar && (
                    <MagnifyingGlassIcon
                        className="size-6 cursor-pointer"
                        onClick={() => setShowSearchBar(true)}
                    />
                )}
                {!showSearchBar && (
                    <>
                        {showAllUsers && (
                            <UserMinusIcon
                                onClick={handleShowAllUsers}
                                className="size-6 cursor-pointer"
                            />
                        )}
                        {!showAllUsers && (
                            <UserPlusIcon
                                onClick={handleShowAllUsers}
                                className="size-6 cursor-pointer"
                            />
                        )}
                    </>
                )}
                {!showSearchBar && (
                    <div className="indicator">
                        <BellAlertIcon
                            className={`size-6 cursor-pointer ${
                                pendingConversations.length > 0
                                    ? " text-primary"
                                    : ""
                            }`}
                        />
                        {pendingConversations.length > 0 && (
                            <span className="badge badge-xs badge-primary indicator-item">
                                {pendingConversations.length}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHeader;
