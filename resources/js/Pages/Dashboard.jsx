import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageInputsBar from "@/Components/App/MessageInputsBar";
import MessageItem from "@/Components/App/MessageItem";
import { useEventBus } from "@/EventBus";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";

function Dashboard({ selected_conversation = null, messages = null }) {
    const { on } = useEventBus();
    const [localMessages, setLocalMessages] = useState([]);
    const loadMoreIntersect = useRef();
    const onAttachmentClick = () => {};

    const newMessageSend = (message) => {
        setLocalMessages((pre) => [...pre, message]);
    };

    useEffect(() => {
        const offMessageSend = on("newMessage.send", newMessageSend);

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
            <ConversationHeader conversation={selected_conversation} />
            <div className="flex-1 overflow-y-auto p-5">
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
