import React, { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import {
    ArrowLeftIcon,
    InformationCircleIcon,
    PhoneIcon,
    VideoCameraIcon,
} from "@heroicons/react/20/solid";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import { useEventBus } from "@/EventBus";
import { checkPermissions, requestMediaAccess } from "@/helper";

const ConversationHeader = ({ conversation }) => {
    const { on, emit } = useEventBus();
    const [onlineUser, setOnlineUsers] = useState(null);

    const handleOnlineUser = (online_users) => {
        if (conversation.is_conversation) {
            const online_user = online_users[conversation.id];
            setOnlineUsers(online_user);
        }
    };

    useEffect(() => {
        const offUserOnline = on("online_user", handleOnlineUser);

        return () => {
            offUserOnline();
        };
    }, [on]);

    const handleVideoCall = async () => {
        const hasPermissions = await checkPermissions(["camera", "microphone"]);

        if (!hasPermissions) {
            const granted = await requestMediaAccess({
                video: true,
                audio: true,
            });
            if (!granted) return;
        }

        emit("call_loading");

        axios
            .post(route("call_request", conversation), {
                type: "call_request",
                payload: "video",
            })
            .catch(console.error);
    };

    const handleAudioCall = async () => {
        const hasPermissions = await checkPermissions(["microphone"]);

        if (!hasPermissions) {
            const granted = await requestMediaAccess({ audio: true });
            if (!granted) return;
        }
        emit("call_loading");

        axios
            .post(route("call_request", conversation), {
                type: "call_request",
                payload: "audio",
            })
            .catch(console.error);
    };

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
                <button onClick={handleAudioCall} className="">
                    <PhoneIcon className="size-6" />
                </button>
                <button onClick={handleVideoCall}>
                    <VideoCameraIcon className="size-6" />
                </button>
                <Link className="">
                    <InformationCircleIcon className="size-6" />
                </Link>
            </div>
        </div>
    );
};

export default ConversationHeader;
