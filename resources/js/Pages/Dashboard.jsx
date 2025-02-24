import AttachmentModal from "@/Components/App/AttachmentModal";
import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageInputsBar from "@/Components/App/MessageInputsBar";
import MessageItem from "@/Components/App/MessageItem";
import { useEventBus } from "@/EventBus";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

function Dashboard({ selected_conversation = null, messages = null }) {
    const { on } = useEventBus();
    const [localMessages, setLocalMessages] = useState([]);
    const loadMoreIntersect = useRef();
    const messageCtrRef = useRef();
    const [attachmentPreview, setAttachmentPreview] = useState({});
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState();

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) return;

        const firstMessage = localMessages[0];

        if (firstMessage) {
            axios
                .get(route("message.loadMoreMessage", firstMessage.id))
                .then(({ data }) => {
                    if (data.data.length === 0) {
                        setNoMoreMessages(true);
                        return;
                    }

                    const scrollHeight = messageCtrRef.current.scrollHeight;
                    const scrollTop = messageCtrRef.current.scrollTop;
                    const clientHeight = messageCtrRef.current.clientHeight;
                    const tmpScrollFromBottom =
                        scrollHeight - scrollTop - clientHeight;
                    setScrollFromBottom(tmpScrollFromBottom);

                    setLocalMessages((pre) => [...data.data.reverse(), ...pre]);
                });
        }
    }, [localMessages, noMoreMessages]);

    useEffect(() => {
        if (messageCtrRef.current && scrollFromBottom !== null) {
            messageCtrRef.current.scrollTop =
                messageCtrRef.current.scrollHeight -
                messageCtrRef.current.offsetHeight -
                scrollFromBottom;
        }

        if (noMoreMessages) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(
                (entry) => {
                    if (entry.isIntersecting) {
                        loadMoreMessages();
                    }
                },
                {
                    rootMargin: "0px 0px 250px 0px",
                }
            );
        });

        setTimeout(() => {
            if (loadMoreIntersect.current) {
                observer.observe(loadMoreIntersect.current);
            }
        }, 100);

        return () => {
            observer.disconnect();
        };
    }, [localMessages]);

    const onAttachmentClick = (attachments, index) => {
        setAttachmentPreview({ attachments, index });
        setShowAttachmentPreview(true);
    };

    const toBottom = () => {
        setTimeout(() => {
            if (messageCtrRef.current) {
                messageCtrRef.current.scrollTop =
                    messageCtrRef.current.scrollHeight;
            }
        }, [10]);
    };

    const newMessageSend = (message) => {
        setLocalMessages((pre) => [...pre, message]);
        toBottom();
    };

    useEffect(() => {
        toBottom();

        const offMessageSend = on("newMessage.send", newMessageSend);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            offMessageSend();
        };
    }, [selected_conversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    if (!selected_conversation) {
        return (
            <div className="flex flex-col gap-6 mx-auto my-auto text-center text-gray-600">
                <span className="font-bold text-2xl">
                    No Conversation Selected
                </span>
                <span>
                    <ChatBubbleLeftEllipsisIcon className="size-20 mx-auto" />
                </span>
            </div>
        );
    }

    return (
        <>
            {messages && (
                <>
                    <ConversationHeader conversation={selected_conversation} />
                    <div
                        className="flex-1 overflow-y-auto p-5"
                        ref={messageCtrRef}
                    >
                        {localMessages.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200">
                                    No messages yet
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className="flex-1 flex flex-col">
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.map((message, index) => (
                                    <MessageItem
                                        key={index}
                                        message={message}
                                        attachmentClick={onAttachmentClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInputsBar conversation={selected_conversation} />
                </>
            )}
            {attachmentPreview.attachments && (
                <AttachmentModal
                    show={showAttachmentPreview}
                    attachments={attachmentPreview.attachments}
                    index={attachmentPreview.index}
                    onClose={() => setShowAttachmentPreview(false)}
                />
            )}
        </>
    );
}

Dashboard.layout = (page) => {
    return (
        <AuthenticatedLayout>
            <ChatLayout children={page}></ChatLayout>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
