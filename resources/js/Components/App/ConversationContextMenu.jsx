import { useEventBus } from "@/EventBus";
import { handleOutsideClick } from "@/helper";
import { Transition } from "@headlessui/react";
import {
    ArchiveBoxIcon,
    BellAlertIcon,
    BellSlashIcon,
    MapPinIcon,
    NoSymbolIcon,
    TrashIcon,
} from "@heroicons/react/20/solid";
import { usePage } from "@inertiajs/react";
import React, { useEffect, useRef, useState } from "react";

const ConversationContextMenu = ({
    x,
    y,
    show,
    close = () => {},
    conversation = null,
    handleStatus = () => {},
}) => {
    const user_id = usePage().props.auth.user.id;
    const contentRef = useRef(null);
    const { emit } = useEventBus();

    const [pinned, setPinned] = useState(false);
    const [archived, setArchived] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        if (conversation) {
            setPinned(conversation.pin);
            setArchived(conversation.archived);
            setMuted(conversation.mute);
            setBlocked(conversation.block);
        }
    }, [conversation]);

    useEffect(() => {
        setPosition({ x, y });
    }, [x, y]);

    const [position, setPosition] = useState({ x: 0, y: 0 });

    handleOutsideClick(contentRef, close);

    const handleBlock = () => {
        axios
            .post(route("conversation.block"), {
                conversation_id: conversation.conversation_id,
            })
            .then((res) => {
                const block_conversation = res.data.conversation;
                emit("conversation.block", block_conversation);
            })
            .catch((err) => console.log(err));
        close();
    };

    return (
        <>
            <Transition
                show={show}
                as="div"
                enter="transition transform ease-in-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition transform ease-in-out duration-0"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
                className={"absolute z-[100]"}
                style={{ top: `${position.y}px`, left: `${position.x}px` }}
            >
                <div
                    ref={contentRef}
                    className=" min-w-[180px] p-2 rounded-lg dark:shadow-none dark:text-gray-200 text-gray-800 shadow-gray-400 bg-gray-200 dark:bg-gray-800 shadow-lg"
                >
                    <div className="py-1">
                        <button
                            onClick={() => handleStatus("pin")}
                            className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md dark:hover:bg-gray-700 cursor-pointer transition-all"
                        >
                            <span className="mr-2">
                                <MapPinIcon className="size-4" />
                            </span>
                            {pinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                            onClick={() => handleStatus("archived")}
                            className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 cursor-pointer transition-all"
                        >
                            <span className="mr-2">
                                <ArchiveBoxIcon className="size-4" />
                            </span>
                            {archived ? "Unarchive" : "Archived"}
                        </button>
                        <button className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 cursor-pointer transition-all">
                            <span className="mr-2">
                                <TrashIcon className="size-4" />
                            </span>
                            Delete
                        </button>
                        {conversation && conversation.block ? (
                            conversation.blocked_by === user_id ? (
                                <button
                                    onClick={handleBlock}
                                    className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 cursor-pointer transition-all"
                                >
                                    <span className="mr-2">
                                        <NoSymbolIcon className="size-4" />
                                    </span>
                                    {blocked ? "Unblock" : "Block"}
                                </button>
                            ) : (
                                ""
                            )
                        ) : (
                            conversation &&
                            !conversation.is_group && (
                                <button
                                    onClick={handleBlock}
                                    className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 cursor-pointer transition-all"
                                >
                                    <span className="mr-2">
                                        <NoSymbolIcon className="size-4" />
                                    </span>
                                    {blocked ? "Unblock" : "Block"}
                                </button>
                            )
                        )}
                        <button
                            onClick={() => handleStatus("mute")}
                            className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 cursor-pointer transition-all"
                        >
                            <span className="mr-2">
                                {muted ? (
                                    <BellAlertIcon className="size-4" />
                                ) : (
                                    <BellSlashIcon className="size-4" />
                                )}
                            </span>
                            {muted ? "Unmute" : "Mute"}
                        </button>
                    </div>
                </div>
            </Transition>
        </>
    );
};

export default ConversationContextMenu;
