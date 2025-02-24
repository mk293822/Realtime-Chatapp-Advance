import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { useEventBus } from "@/EventBus";
import { Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const conversations = usePage().props.conversations;
    const { emit } = useEventBus();

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
        <div className="h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <main>{children}</main>
        </div>
    );
}
