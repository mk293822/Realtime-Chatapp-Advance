import MessageOptionDropdown from "@/Components/App/MessageOptionDropdown";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { useEventBus } from "@/EventBus";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const initialContextMenu = {
    show: false,
    x: 0,
    y: 0,
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const conversations = usePage().props.conversations;
    const { emit, on } = useEventBus();
    const [contextMenu, setContextMenu] = useState(initialContextMenu);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const offContextMenu = on("contextMenu", (context) => {
            setMessage(context.message);
            setContextMenu({ show: true, x: context.x, y: context.y });
        });
        return () => {
            offContextMenu();
        };
    }, [on]);

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

    return (
        <>
            <div className="h-screen overflow-hidden w-[100vw] bg-white text-gray-800 dark:text-gray-400 dark:bg-gray-900">
                <main>{children}</main>
            </div>
            <MessageOptionDropdown
                close={() => setContextMenu(initialContextMenu)}
                x={contextMenu.x}
                y={contextMenu.y}
                show={contextMenu.show}
                message={message}
            />
        </>
    );
}
