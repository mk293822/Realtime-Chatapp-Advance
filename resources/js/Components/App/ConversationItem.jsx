import { Link, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import { formatActiveDate } from "@/helper";
import { useEventBus } from "@/EventBus";
import {
    ArrowDownLeftIcon,
    ArrowUpRightIcon,
    MapPinIcon,
    UserMinusIcon,
    UserPlusIcon,
} from "@heroicons/react/20/solid";
import axios from "axios";

const ConversationItem = ({
    conversation,
    selectedConversation = null,
    online = null,
    handleContextMenu = () => {},
    showAllUsers,
}) => {
    let classes = "border-transparent";
    const requested_user = usePage().props.conversations.filter(
        (con) => con.id == conversation.id
    );
    const blocked = conversation.block;
    const [callStatus, setCallStatus] = useState("");
    const currentUser = usePage().props.auth.user;

    const { on } = useEventBus();

    const [offlineDate, setOfflineDate] = useState(null);

    useEffect(() => {
        const offUserOffline = on("offline.user", (user) => {
            if (
                conversation &&
                conversation.is_conversation &&
                user.id === conversation.id
            ) {
                setOfflineDate(user.active);
            }
            return;
        });

        return () => {
            offUserOffline();
        };
    }, [on]);

    useEffect(() => {
        setOfflineDate(conversation.active);
    }, []);

    if (selectedConversation) {
        if (
            !selectedConversation.is_group &&
            !conversation.is_group &&
            selectedConversation.id === conversation.id
        ) {
            classes = "border-blue-500 bg-black/20";
        }
        if (
            selectedConversation.is_group &&
            conversation.is_group &&
            selectedConversation.id === conversation.id
        ) {
            classes = "border-blue-500 bg-black/20";
        }
    }

    useEffect(() => {
        if (conversation.call_message) {
            const call_message = conversation.call_message.data;

            setCallStatus(() => {
                if (call_message.accept) {
                    return `${
                        currentUser.id === conversation.sender_id
                            ? "Outgoing"
                            : "Incoming"
                    } ${call_message.is_video ? "Video" : ""} Call`;
                } else {
                    return currentUser.id === conversation.sender_id
                        ? `Cancelled ${
                              call_message.is_video ? "Video" : ""
                          } Call`
                        : `Missed ${call_message.is_video ? "Video" : ""} Call`;
                }
            });
        }
    }, []);

    const handleFriendRequest = () => {
        axios
            .post(route("conversation.store", conversation.id))
            .then((res) => {})
            .catch((err) => {});
    };

    return (
        <Link
            href={
                conversation.is_group
                    ? route("message.group", conversation)
                    : route("message.conversation", conversation)
            }
            preserveState
            className={
                `conversation-item px-2 transition-all flex items-center gap-2 p-2 ${
                    !showAllUsers && " cursor-pointer hover:bg-black/30"
                } ${blocked ? " opacity-50 " : ""}` + classes
            }
            onClick={(e) => {
                if (showAllUsers) {
                    e.preventDefault();
                }
            }}
            onContextMenu={(e) => handleContextMenu(e, conversation)}
        >
            {conversation.is_conversation && (
                <UserAvatar user={conversation} online={online} />
            )}
            {conversation.is_group && (
                <GroupAvatar avatar={conversation.avatar} />
            )}
            <div
                className={`flex-1 text-xs max-w-full overflow-hidden ${
                    !showAllUsers && conversation.is_conversation && blocked
                        ? " opacity-50"
                        : ""
                }`}
            >
                <div className="flex gap-1 justify-between items-center">
                    <h3 className="text-sm font-semibold overflow-hidden text-nowrap text-ellipsis">
                        {conversation.name}
                    </h3>
                    {showAllUsers && (
                        <div className="flex gap-2 justify-center hover:opacity-80 items-center">
                            {requested_user && (
                                <UserMinusIcon className="size-6" />
                            )}
                            {!requested_user && (
                                <UserPlusIcon
                                    onClick={handleFriendRequest}
                                    className="size-6"
                                />
                            )}
                        </div>
                    )}
                    {!blocked && offlineDate && !online && !showAllUsers && (
                        <span className="text-nowrap">
                            {formatActiveDate(offlineDate)}
                        </span>
                    )}
                </div>
                {!showAllUsers && (
                    <div className="flex items-center justify-between">
                        {!blocked && (
                            <div className="flex gap-2 items-center">
                                {conversation.last_message_attachment && (
                                    <img
                                        src={
                                            conversation.last_message_attachment
                                                .data.path
                                        }
                                        className="w-auto h-5"
                                    />
                                )}
                                {callStatus && (
                                    <div className="flex gap-1 items-center">
                                        {conversation.sender_id ===
                                        currentUser.id ? (
                                            <ArrowUpRightIcon className="size-4" />
                                        ) : (
                                            <ArrowDownLeftIcon className="size-4" />
                                        )}
                                        <p className="text-xs text-gray-500 max-w-[100%] text-nowrap overflow-hidden text-ellipsis">
                                            {callStatus}
                                        </p>
                                    </div>
                                )}
                                {conversation.last_message && (
                                    <p className="text-xs text-gray-500 max-w-[50%] text-nowrap overflow-hidden text-ellipsis">
                                        {conversation.last_message}
                                    </p>
                                )}
                            </div>
                        )}
                        {!blocked && conversation.pin && (
                            <MapPinIcon className="w-[13px] text-blue-600" />
                        )}
                        {blocked && (
                            <p className="text-md text-gray-500 text-nowrap">
                                This user is Blocked
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ConversationItem;
