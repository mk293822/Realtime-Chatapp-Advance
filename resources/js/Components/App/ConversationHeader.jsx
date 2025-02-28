import React from "react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import {
    ArrowLeftIcon,
    InformationCircleIcon,
    PhoneIcon,
    VideoCameraIcon,
} from "@heroicons/react/20/solid";
import { Link } from "@inertiajs/react";

const ConversationHeader = ({ conversation }) => {
    return (
        <div className="p-4 px-4 flex items-center justify-between shadow-lg shadow-black/60">
            <div className="flex gap-4 justify-center items-center">
                <Link href="/" className="">
                    <ArrowLeftIcon className="size-6" />
                </Link>
                {conversation.is_conversation && (
                    <UserAvatar user={conversation} />
                )}
                {conversation.is_group && <GroupAvatar user={conversation} />}
                <span>{conversation.name}</span>
            </div>
            <div className="flex gap-4 items-center justify-center">
                <Link className="">
                    <PhoneIcon className="size-6" />
                </Link>
                <Link className="">
                    <VideoCameraIcon className="size-6" />
                </Link>
                <Link className="">
                    <InformationCircleIcon className="size-6" />
                </Link>
            </div>
        </div>
    );
};

export default ConversationHeader;
