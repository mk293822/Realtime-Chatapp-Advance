import { useEventBus } from "@/EventBus";
import { handleOutsideClick } from "@/helper";
import { Transition } from "@headlessui/react";
import { BookmarkIcon, TrashIcon } from "@heroicons/react/20/solid";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const MessageOptionDropdown = ({ message, close = () => {}, x, y, show }) => {
    const user = usePage().props.auth.user;

    const { emit } = useEventBus();

    const conversation = usePage().props.selected_conversation;

    const currentUser = usePage().props.auth.user;
    const contentRef = useRef(null);
    const [isSave, setIsSave] = useState(false);

    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setPosition({ x, y });
    }, [close]);

    handleOutsideClick(contentRef, close);

    useEffect(() => {
        setIsSave(message.is_saved);
    }, [message]);

    const onMessageDelete = () => {
        axios
            .post(route("message.deleted_for_user", message.id))
            .then((res) => {
                emit("newMessage.delete", {
                    message: res.data.deleted_message,
                    preMessage: res.data.pre_message,
                });
            })
            .catch((error) => {
                console.log(error);
            });
        close();
    };

    const onMessageDeleteForAll = () => {
        axios.delete(route("message.destroy", message.id)).catch((error) => {
            console.log(error);
        });
        close();
    };

    const handleSaveMessage = () => {
        axios
            .post(route("message.save", message.id))
            .then((response) => {
                setIsSave(response.data.saved);
                emit("newMessage.send", response.data.message);
            })
            .catch((error) => {
                console.log(error);
            });
        close();
    };

    const handleUnsaveMessage = () => {
        axios
            .post(route("message.unsave", message.id))
            .then((response) => {
                setIsSave(response.data.saved);
                emit("newMessage.delete", { message: response.data.message });
            })
            .catch((error) => {
                console.log(error);
            });
        close();
    };

    return (
        <>
            <Transition
                ref={contentRef}
                show={show}
                as="div"
                enter="transition transform ease-in-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition transform ease-in-out duration-0"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95 z-[100]"
                className={"absolute z-[100]"}
                style={{
                    top: `${position.y}px`,
                    left: `${
                        currentUser.id == message.sender_id
                            ? position.x - 150
                            : position.x + 50
                    }px`,
                }}
            >
                <div className=" min-w-[180px] p-2 rounded-lg dark:shadow-none dark:text-gray-200 text-gray-800 shadow-gray-400 bg-gray-200 dark:bg-gray-800 shadow-lg">
                    <div className="py-1 flex flex-col space-y-1">
                        {conversation && !conversation.is_save_conversation && (
                            <>
                                <button
                                    onClick={onMessageDelete}
                                    className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md dark:hover:bg-gray-700 cursor-pointer transition-all"
                                >
                                    <span className="mr-2">
                                        <TrashIcon className="size-4" />
                                    </span>
                                    Delete
                                </button>
                                {user.id === message.sender_id && (
                                    <button
                                        onClick={onMessageDeleteForAll}
                                        className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md dark:hover:bg-gray-700 cursor-pointer transition-all"
                                    >
                                        <span className="mr-2">
                                            <TrashIcon className="size-4" />
                                        </span>
                                        Delete For All Users
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            onClick={() =>
                                isSave
                                    ? handleUnsaveMessage()
                                    : handleSaveMessage()
                            }
                            className="flex w-full items-center px-4 py-2 text-sm font-medium rounded-md dark:hover:bg-gray-700 cursor-pointer transition-all"
                        >
                            <span className="mr-2">
                                <BookmarkIcon
                                    className={`size-4 ${
                                        isSave ? "text-yellow-500" : ""
                                    }`}
                                />
                            </span>
                            {isSave ? "Unsave" : "Save"}
                        </button>
                    </div>
                </div>
            </Transition>
        </>
    );
};

export default MessageOptionDropdown;
