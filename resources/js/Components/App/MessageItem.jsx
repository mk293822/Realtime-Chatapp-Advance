import { formatMessageDate, formatTime } from "@/helper";
import { usePage } from "@inertiajs/react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkDown from "react-markdown";
import UserAvatar from "./UserAvatar";
import MessageAttachment from "./MessageAttachment";
import { useEventBus } from "@/EventBus";
import {
    ArrowDownLeftIcon,
    ArrowUpRightIcon,
    PhoneIcon,
    VideoCameraIcon,
} from "@heroicons/react/20/solid";

const MessageItem = ({ message, attachmentClick }) => {
    const currentUser = usePage().props.auth.user;
    const { emit } = useEventBus();
    const [callStatus, setCallStatus] = useState("");
    const [period, setPeriod] = useState();

    const handleContextMenu = (e) => {
        e.preventDefault();
        const { pageX, pageY } = e;
        const context = { message: message, x: pageX, y: pageY, show: true };
        emit("contextMenu", context);
    };

    useEffect(() => {
        if (message.call_message) {
            const call_message = message.call_message;

            setCallStatus(() => {
                if (call_message.accept) {
                    setPeriod(formatTime(call_message.period));
                    return `${
                        currentUser.id === message.sender_id
                            ? "Outgoing"
                            : "Incoming"
                    } ${call_message.is_video ? "Video" : ""} Call`;
                } else {
                    return currentUser.id === message.sender_id
                        ? `Cancelled ${
                              call_message.is_video ? "Video" : ""
                          } Call`
                        : `Missed ${call_message.is_video ? "Video" : ""} Call`;
                }
            });
        }
    }, []);

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
                {!message.call_message && message.attachments.length > 0 && (
                    <MessageAttachment
                        attachments={message.attachments}
                        attachmentClick={attachmentClick}
                    />
                )}
                {!message.call_message && message.message !== null && (
                    <div className="chat-message">
                        <div className="chat-message-content">
                            <ReactMarkDown>{message.message}</ReactMarkDown>
                        </div>
                    </div>
                )}
                {message.call_message && (
                    <div className="chat-message flex items-center justify-center mx-auto">
                        <div className="chat-message-content justify-between gap-4 flex items-center">
                            <div className="">
                                <p>{callStatus}</p>
                                <div className="flex text-sm">
                                    {message.sender_id === currentUser.id ? (
                                        <ArrowUpRightIcon className="size-6" />
                                    ) : (
                                        <ArrowDownLeftIcon className="size-6" />
                                    )}
                                    <time>
                                        {formatMessageDate(
                                            message.call_message.created_at
                                        )}
                                    </time>
                                    <time>{period ? `, ${period}` : ""}</time>
                                </div>
                            </div>
                            {message.call_message.is_video ? (
                                <VideoCameraIcon className="size-6" />
                            ) : (
                                <PhoneIcon className="size-6" />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageItem;
