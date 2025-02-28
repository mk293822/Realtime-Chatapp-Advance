import { formatMessageDate } from "@/helper";
import { usePage } from "@inertiajs/react";
import React, { useRef, useState } from "react";
import ReactMarkDown from "react-markdown";
import UserAvatar from "./UserAvatar";
import MessageAttachment from "./MessageAttachment";
import { useEventBus } from "@/EventBus";

const MessageItem = ({ message, attachmentClick }) => {
    const currentUser = usePage().props.auth.user;
    const { emit } = useEventBus();

    const date = formatMessageDate(message.created_at);

    const handleContextMenu = (e) => {
        e.preventDefault();
        const { pageX, pageY } = e;
        const context = { message: message, x: pageX, y: pageY, show: true };
        emit("contextMenu", context);
    };

    return (
        <div
            className={
                "chat z-0 " +
                (message.sender_id === currentUser.id
                    ? " chat-end"
                    : " chat-start")
            }
        >
            {<UserAvatar user={message.sender} />}
            <div className="chat-header">
                {message.sender_id !== currentUser.id && message.group_id
                    ? message.sender.name
                    : ""}
                <time className="text-xs opacity-50 ml-2">{date}</time>
            </div>

            <div
                onContextMenu={handleContextMenu}
                className={
                    "chat-bubble relative " +
                    (message.sender_id === currentUser.id
                        ? " chat-bubble-info"
                        : "")
                }
            >
                {message.attachments.length > 0 && (
                    <MessageAttachment
                        attachments={message.attachments}
                        attachmentClick={attachmentClick}
                    />
                )}
                {message.message !== null && (
                    <div className="chat-message">
                        <div className="chat-message-content">
                            <ReactMarkDown>{message.message}</ReactMarkDown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageItem;
