import ConversationItem from "@/Components/App/ConversationItem";
import TextInput from "@/Components/TextInput";
import { useEventBus } from "@/EventBus";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selected_conversation;
    const { on } = useEventBus();

    const [sortedConversations, setSortedConversations] = useState([]);
    const [localConversations, setLocalConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const onSearch = (e) => {
        const search = e.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    };

    const lastActiveTime = (user) => {
        axios
            .post(route("user.lastActiveTime", user))
            .then((res) => {
                console.log(res.data.success);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const isUserOnline = (user_id) => onlineUsers[user_id];

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        setSortedConversations(localConversations.sort());
    }, [localConversations]);

    useEffect(() => {
        Echo.join("online")
            .here((users) => {
                const online_users = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );
                setOnlineUsers((pre) => {
                    return { ...pre, ...online_users };
                });
            })
            .joining((user) => {
                setOnlineUsers((pre) => {
                    const preOnlineUser = { ...pre };
                    preOnlineUser[user.id] = user;
                    return preOnlineUser;
                });
            })
            .leaving((user) => {
                setOnlineUsers((pre) => {
                    const preOnlineUser = { ...pre };
                    delete preOnlineUser[user.id];
                    return preOnlineUser;
                });
                lastActiveTime(user);
            })
            .error((err) => {
                console.log(err);
            });

        return () => {
            Echo.leave("online");
        };
    }, []);

    return (
        <div className="flex-1 w-full flex h-[calc(100vh-64.67px)]">
            <div
                className={`transition-all w-full sm:w-[220px] md:w-[300px] bg-slate-800 flex flex-col overflow-hidden ${
                    selectedConversation ? "-ml-[100%] sm:ml-0" : ""
                }`}
            >
                <div className="p-3">
                    <TextInput
                        onKeyUp={onSearch}
                        placeholder="Filter users and groups"
                        className="w-full"
                    />
                </div>
                <div className="flex-1 shadow-md shadow-gray-600 overflow-auto">
                    {sortedConversations &&
                        sortedConversations.map((conversation) => (
                            <ConversationItem
                                key={`${
                                    conversation.is_group ? "group_" : "user_"
                                }${conversation.id}`}
                                conversation={conversation}
                                online={!!isUserOnline(conversation.id)}
                                selectedConversation={selectedConversation}
                            />
                        ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default ChatLayout;
