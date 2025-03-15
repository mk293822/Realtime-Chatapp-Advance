import IncomingCallModal from "@/Components/App/IncomingCallModal";
import MessageOptionDropdown from "@/Components/App/MessageOptionDropdown";
import { useEventBus } from "@/EventBus";
import { checkPermissions } from "@/helper";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const initialContextMenu = {
    show: false,
    x: 0,
    y: 0,
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const conversations = usePage().props.conversations;

    const { on, emit } = useEventBus();
    const [contextMenu, setContextMenu] = useState(initialContextMenu);
    const [message, setMessage] = useState(null);
    const [isIncoming, setIsIncoming] = useState(false);
    const [caller, setCaller] = useState({});
    const audioRef = useRef(new Audio("/Ringtones/phoneincoming1.mp3"));
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [isCallLoading, setIsCallLoading] = useState(false);

    useEffect(() => {
        conversations.forEach((conversation) => {
            let channel = `message.group.${conversation.id}`;
            if (conversation.is_conversation) {
                channel = `message.conversation.${[user.id, conversation.id]
                    .sort((a, b) => a - b)
                    .join("-")}`;
            }

            Echo.private(channel)
                .error((err) => console.log(err))
                .listen("MessageSend", (e) => {
                    if (e.status === "send") emit("newMessage.send", e.message);
                    if (e.status == "delete")
                        emit("newMessage.delete", {
                            message: e.message,
                            preMessage: e.preMessage,
                        });
                });
        });

        return () => {
            conversations.forEach((conversation) => {
                let channel = `message.group.${conversation.id}`;
                if (conversation.is_conversation) {
                    channel = `message.conversation.${[user.id, conversation.id]
                        .sort((a, b) => a - b)
                        .join("-")}`;
                }

                Echo.leave(channel);
            });
        };
    }, [conversations]);

    useEffect(() => {
        const offContextMenu = on("contextMenu", (context) => {
            setMessage(context.message);
            setContextMenu({ show: true, x: context.x, y: context.y });
        });
        return () => {
            offContextMenu();
        };
    }, [on]);

    // video call

    useEffect(() => {
        const offCallLoading = on("call_loading", () => {
            setIsCallLoading(true);
        });

        return () => {
            offCallLoading();
        };
    }, [on]);

    useEffect(() => {
        conversations.forEach((conversation) => {
            if (conversation.is_conversation) {
                const channel = `private.call.${[conversation.id, user.id]
                    .sort((a, b) => a - b)
                    .join("-")}`;

                Echo.private(channel).listen("WebRTCEvent", async (e) => {
                    switch (e.type) {
                        case "call_request":
                            setIsCallLoading(false);
                            setIsVideoCall(e.payload == "video");
                            setCaller(conversation);
                            if (e.senderId == user.id) {
                                router.visit(
                                    `${route(
                                        "private.callRoom",
                                        conversation
                                    )}?video=${e.payload == "video"}`
                                );
                            } else if (e.receiverId == user.id) {
                                setIsIncoming(true);
                                audioRef.current.pause(); // Pause audio initially
                                audioRef.current.currentTime = 0; // Reset audio to start
                                audioRef.current.play().catch((err) => {}); // Play audio on user interaction
                            }
                            break;

                        case "call_end":
                            setIsIncoming(false);
                            audioRef.current.pause(); // Pause audio initially
                            audioRef.current.currentTime = 0;
                    }
                });
            }
        });

        return () => {
            conversations.forEach((conversation) => {
                if (conversation.is_conversation) {
                    const channel = `private.call.${[conversation.id, user.id]
                        .sort((a, b) => a - b)
                        .join("-")}`;
                    Echo.leave(channel);
                }
            });
        };
    }, [conversations]);

    const handleAccept = () => {
        setIsIncoming(false);
        axios
            .post(route("call_request", caller), {
                type: "call_accept",
            })
            .then(async (res) => {
                const hasPermissions = await checkPermissions([
                    "camera",
                    "microphone",
                ]);

                if (!hasPermissions) {
                    const granted = await requestMediaAccess({
                        video: true,
                        audio: true,
                    });
                    if (!granted) {
                        handleReject();
                        return;
                    }
                }

                router.visit(
                    `${route("private.callRoom", caller)}?video=${isVideoCall}`
                );
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleReject = () => {
        setIsIncoming(false);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        axios
            .post(route("call_request", caller), {
                type: "call_reject",
            })
            .catch((err) => {
                console.log(err);
            });

        const formData = new FormData();
        formData.append("conversation_id", caller.conversation_id);
        formData.append("type", "call_reject");
        formData.append("payload", isVideoCall);
        axios.post(route("message.store"), formData).catch((err) => {
            console.log(err);
        });
    };

    // end video call section

    return (
        <>
            <div className="h-screen overflow-hidden w-[100vw] bg-white text-gray-800 dark:text-gray-400 dark:bg-gray-900">
                <main>{children}</main>
            </div>
            {isCallLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="loading loading-spinner text-primary loading-lg"></div>
                </div>
            )}

            {message && (
                <MessageOptionDropdown
                    close={() => setContextMenu(initialContextMenu)}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    show={contextMenu.show}
                    message={message}
                />
            )}
            {isIncoming && (
                <IncomingCallModal
                    callerName={caller.name}
                    isOpen={isIncoming}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    callerAvatar={caller.avatar}
                />
            )}
        </>
    );
}
