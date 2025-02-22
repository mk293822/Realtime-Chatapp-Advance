import { Link, usePage } from "@inertiajs/react";
import React from "react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import { formatActiveDate } from "@/helper";

const ConversationItem = ({
    conversation,
    selectedConversation = null,
    online = null,
}) => {
    let classes = "border-transparent";
    const blocked = conversation.status === "block";

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
                "conversation-item transition-all flex items-center gap-2 p-2 cursor-pointer border-1 hover:bg-black/30 " +
                classes
            }
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
                    {conversation.active && !online && (
                        <span className="text-nowrap">
                            {formatActiveDate(conversation.active)}
                        </span>
                    )}
                </div>
                {conversation.last_message && (
                    <p className="text-xs text-gray-500 text-nowrap overflow-hidden text-ellipsis">
                        {conversation.last_message}
                    </p>
                )}
            </div>
        </Link>
    );
};

export default ConversationItem;
