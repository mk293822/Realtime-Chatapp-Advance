import { Link, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import { formatActiveDate } from "@/helper";
import { useEventBus } from "@/EventBus";
import { MapPinIcon } from "@heroicons/react/20/solid";

const ConversationItem = ({
    conversation,
    selectedConversation = null,
    online = null,
    handleContextMenu = () => {},
}) => {
    let classes = "border-transparent";
    const blocked = conversation.block;

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

    return (
        <Link
            href={
                conversation.is_group
                    ? route("message.group", conversation)
                    : route("message.conversation", conversation)
            }
            preserveState
            className={
                `conversation-item px-2 transition-all flex items-center gap-2 p-2 cursor-pointer border-1 hover:bg-black/30 ${
                    blocked ? " opacity-50 " : ""
                }` + classes
            }
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
                    conversation.is_conversation && blocked ? " opacity-50" : ""
                }`}
            >
                <div className="flex gap-1 justify-between items-center">
                    <h3 className="text-sm font-semibold overflow-hidden text-nowrap text-ellipsis">
                        {conversation.name}
                    </h3>
                    {!blocked && offlineDate && !online && (
                        <span className="text-nowrap">
                            {formatActiveDate(offlineDate)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    {!blocked && conversation.last_message && (
                        <p className="text-xs text-gray-500 max-w-[95%] text-nowrap overflow-hidden text-ellipsis">
                            {conversation.last_message}
                        </p>
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
            </div>
        </Link>
    );
};

export default ConversationItem;
