import ChatHeader from "@/Components/App/ChatHeader";
import ConversationContextMenu from "@/Components/App/ConversationContextMenu";
import ConversationItem from "@/Components/App/ConversationItem";
import { useEventBus } from "@/EventBus";
import { ArrowLeftIcon, Bars3Icon } from "@heroicons/react/20/solid";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";

const initialContextMenu = {
    show: false,
    x: 0,
    y: 0,
};

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const all_conversations = page.props.all_conversations;
    const selectedConversation = page.props.selected_conversation;
    const edit_status = page.props.status;
    const mustVerifyEmail = page.props.mustVerifyEmail;
    const { on, emit } = useEventBus();
    const user = usePage().props.auth.user;

    const [sortedConversations, setSortedConversations] = useState([]);
    const [localConversations, setLocalConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [conversationContextMenu, setConversationContextMenu] =
        useState(initialContextMenu);
    const [showArchived, setShowArchived] = useState(false);
    const [statusUpdated, setStatusUpdated] = useState(false);
    const [showAllUsers, setShowAllUsers] = useState(false);

    const sidebar_button = document.getElementById("my-drawer");

    // conversation block socket

    useEffect(() => {
        conversations.forEach((conversation) => {
            if (conversation.is_conversation) {
                let channel = `conversation.${conversation.conversation_id}`;

                Echo.private(channel)
                    .error((err) => console.log(err))
                    .listen("ConversationStatusSockets", (e) => {
                        if (e.status === "block")
                            emit("conversation.block", e.conversation);
                    });
            }
        });

        return () => {
            conversations.forEach((conversation) => {
                if (conversation.is_conversation) {
                    let channel = `conversation.${conversation.conversation_id}`;
                    Echo.leave(channel);
                }
            });
        };
    }, [conversations]);

    const onSearch = (e) => {
        const search = e.target.value.toLowerCase();
        setLocalConversations(
            (showAllUsers ? all_conversations : conversations).filter(
                ({ name }) => name.toLowerCase().includes(search)
            )
        );
    };

    const lastActiveTime = (user) => {
        axios
            .post(route("user.lastActiveTime", user))
            .then((res) => {
                emit("offline.user", res.data.user);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const isUserOnline = (user_id) => onlineUsers[user_id];

    useEffect(() => {
        emit("online_user", onlineUsers);
    }, [isUserOnline, onlineUsers]);

    const newMessageSend = (message) => {
        setLocalConversations((oldUser) => {
            return oldUser.map((u) => {
                if (
                    message.receiver_id &&
                    !u.is_group &&
                    (u.id == message.sender_id || u.id == message.receiver_id)
                ) {
                    u.last_message_date = message.created_at;
                    u.last_message = message.message;
                    return u;
                }

                if (
                    message.group_id &&
                    u.is_group &&
                    u.id == message.group_id
                ) {
                    u.last_message_date = message.created_at;
                    u.last_message = message.message;
                    return u;
                }
                return u;
            });
        });
    };

    const messageDeleted = ({ preMessage }) => {
        if (!preMessage) return;
        newMessageSend(preMessage);
    };

    const handle_archived_show = () => {
        setLocalConversations(conversations.filter((con) => !con.reject));
        setShowAllUsers(false);
        setShowArchived(true);
        if (sidebar_button) sidebar_button.checked = !sidebar_button.checked;
    };

    const handleBlockConversation = (block_conversation) => {
        setLocalConversations((pre) =>
            pre.map((con) => {
                if (
                    !con.is_group &&
                    con.conversation_id === block_conversation.id
                ) {
                    return {
                        ...con,
                        block: block_conversation.block,
                        blocked_by: block_conversation.blocked_by,
                    };
                }
                return con;
            })
        );
    };

    const handleConversationRequest = () => {};
    const handleConversationRequestSent = () => {};

    useEffect(() => {
        const offMessageSend = on("newMessage.send", newMessageSend);
        const offMessageDelete = on("newMessage.delete", messageDeleted);
        const offArchivedShow = on("archived.show", handle_archived_show);
        const offConversationBlock = on(
            "conversation.block",
            handleBlockConversation
        );

        const offConversationRequest = on(
            "conversation.request",
            handleConversationRequest
        );
        const offConversationRequestSent = on(
            "conversation.requestSent",
            handleConversationRequestSent
        );

        return () => {
            offMessageSend();
            offMessageDelete();
            offArchivedShow();
            offConversationBlock();
            offConversationRequest();
            offConversationRequestSent();
        };
    }, [on]);

    const toggleShowAllUsers = () => {
        setShowAllUsers(!showAllUsers);
    };

    useEffect(() => {
        if (showAllUsers) {
            setLocalConversations(all_conversations);
        } else {
            setLocalConversations(conversations.filter((con) => con.accept));
        }
    }, [conversations, all_conversations, showAllUsers]);

    useEffect(() => {
        setSortedConversations(
            !showAllUsers
                ? localConversations
                      .sort((a, b) => {
                          if (a.last_message_date && b.last_message_date) {
                              return b.last_message_date.localeCompare(
                                  a.last_message_date
                              );
                          } else if (a.last_message_date) {
                              return -1;
                          } else if (b.last_message_date) {
                              return 1;
                          } else {
                              return 0;
                          }
                      })
                      .sort((a, b) => {
                          if (a.pin && b.pin) {
                              return b.status_at.localeCompare(a.status_at);
                          } else if (a.pin) {
                              return -1;
                          } else if (b.pin) {
                              return 1;
                          } else {
                              return 0;
                          }
                      })
                      .sort((a, b) => {
                          if (a.block && b.block) {
                              return b.status_at.localeCompare(a.status_at);
                          } else if (a.block) {
                              return 1;
                          } else if (b.block) {
                              return -1;
                          } else {
                              return 0;
                          }
                      })
                      .filter((con) =>
                          showArchived ? con.archived : !con.archived
                      )
                : localConversations
        );
        if (showArchived) setStatusUpdated(true);
    }, [localConversations, showArchived]);

    // Online/Offline functionalities
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
                lastActiveTime(user);
                setOnlineUsers((pre) => {
                    const preOnlineUser = { ...pre };
                    delete preOnlineUser[user.id];
                    return preOnlineUser;
                });
            })
            .error((err) => {
                console.log(err);
            });

        return () => {
            Echo.leave("online");
        };
    }, []);

    const handleContextMenu = (e, conversation) => {
        e.preventDefault();
        const { pageX, pageY } = e;
        setConversationContextMenu({
            show: true,
            x: pageX,
            y: pageY,
            conversation,
        });
    };

    // context menu status

    const handleStatus = (status) => {
        const conversation = conversationContextMenu.conversation;
        const isGroup = conversation.is_group;
        const newGroupId = isGroup ? conversation.id : null;
        const newConversationId = isGroup ? null : conversation.conversation_id;

        const formData = new FormData();

        formData.append("user_id", user.id);
        formData.append("status", status);
        if (newConversationId)
            formData.append("conversation_id", newConversationId);
        if (newGroupId) formData.append("group_id", newGroupId);

        axios
            .post(route("user_conversation.status"), formData)
            .then((res) => {
                handleStatusResponse(res, conversation);
            })
            .catch((err) => console.log(err));
        setConversationContextMenu(initialContextMenu);
    };

    const handleStatusResponse = (res, conversation) => {
        const response = res.data.status;
        const status_key = Object.keys(response)[0];
        setLocalConversations((pre) =>
            pre.map((con) => {
                if (
                    conversation.is_group &&
                    con.id === conversation.id &&
                    con.is_group
                ) {
                    return { ...con, [status_key]: response[status_key] };
                } else if (
                    !conversation.is_group &&
                    con.id === conversation.id &&
                    !con.is_group
                ) {
                    return { ...con, [status_key]: response[status_key] };
                }
                return con;
            })
        );
    };

    useEffect(() => {
        if (statusUpdated && showArchived && sortedConversations.length === 0)
            setShowArchived(false);
        setStatusUpdated(false);
    }, [showArchived, sortedConversations, statusUpdated]);
    //end

    return (
        <div className="flex-1 w-[100vw] flex h-screen">
            <div
                className={`transition-all rounded-e-lg w-full sm:w-[220px] lg:[330px] md:w-[300px] bg-inherit z-10 shadow-[5px_0px_5px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden ${
                    selectedConversation ? "-ml-[100%] sm:ml-0" : ""
                }`}
            >
                {!showArchived && (
                    <ChatHeader
                        sidebar_button={sidebar_button}
                        edit_status={edit_status}
                        mustVerifyEmail={mustVerifyEmail}
                        onSearch={onSearch}
                        toggleShowAllUsers={toggleShowAllUsers}
                        conversations={conversations}
                    />
                )}
                {showArchived && (
                    <div className="p-2 flex gap-4 items-center justify-start shadow-black/60 z-10 shadow-md h-[64px]">
                        <button
                            onClick={() => setShowArchived(false)}
                            className="cursor-pointer"
                        >
                            <ArrowLeftIcon className="size-7" />
                        </button>
                        <span className="font-bold text-lg">
                            Archived Chats
                        </span>
                    </div>
                )}
                <div
                    className="flex-1 shadow-md mt-1 overflow-auto"
                    style={{
                        scrollbarWidth: "none",
                    }}
                >
                    {sortedConversations &&
                        sortedConversations.map((conversation) => (
                            <ConversationItem
                                handleContextMenu={handleContextMenu}
                                key={`${
                                    conversation.is_group ? "group_" : "user_"
                                }${conversation.id}`}
                                conversation={conversation}
                                online={!!isUserOnline(conversation.id)}
                                selectedConversation={selectedConversation}
                                showAllUsers={showAllUsers}
                            />
                        ))}
                </div>
            </div>
            <ConversationContextMenu
                x={conversationContextMenu.x}
                y={conversationContextMenu.y}
                show={conversationContextMenu.show}
                conversation={conversationContextMenu.conversation}
                close={() => setConversationContextMenu(initialContextMenu)}
                handleStatus={handleStatus}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default ChatLayout;
