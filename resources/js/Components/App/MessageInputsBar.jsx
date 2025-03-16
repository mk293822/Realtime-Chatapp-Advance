import {
    CameraIcon,
    FaceSmileIcon,
    HandThumbUpIcon,
    MicrophoneIcon,
    PaperAirplaneIcon,
    PaperClipIcon,
    PhotoIcon,
    XCircleIcon,
} from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";
import MessageInput from "./MessageInput";
import { Popover } from "@headlessui/react";
import EmojiPicker from "emoji-picker-react";
import AudioRecorder from "./AudioRecorder";
import axios from "axios";
import { isAudio, isImage } from "@/helper";
import AttachmentPreview from "./AttachmentPreview";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { useEventBus } from "@/EventBus";

const MessageInputsBar = ({ conversation }) => {
    const [messageSending, setMessageSending] = useState();
    const [inputErrorMessage, setInputErrorMessage] = useState();
    const [newMessage, setNewMessage] = useState("");
    const [chosenFiles, setChosenFiles] = useState([]);
    const [block, setBlock] = useState(false);
    const { on, emit } = useEventBus();

    useEffect(() => {
        setBlock(conversation.block);
    }, [conversation]);

    const onSendClick = () => {
        if (messageSending) return;
        if (newMessage.trim() === "" && chosenFiles.length === 0) {
            setInputErrorMessage(
                "Please provide a message or upload attachment!"
            );
            setTimeout(() => {
                setInputErrorMessage("");
            }, 3000);
            return;
        }

        const formData = new FormData();

        chosenFiles.forEach((file) => {
            formData.append("attachments[]", file.file);
        });

        formData.append("message", newMessage);

        if (conversation.is_group) {
            formData.append("group_id", conversation.id);
        } else if (conversation.is_conversation) {
            formData.append("receiver_id", conversation.id);
            formData.append("conversation_id", conversation.conversation_id);
        } else if (conversation.is_save_conversation) {
            formData.append("save_conversation_id", conversation.id);
        }

        setMessageSending(true);

        axios
            .post(route("message.store"), formData, {})
            .then((res) => {
                emit("newMessage.send", res.data.message);
                setMessageSending(false);
                setNewMessage("");
                setChosenFiles([]);
            })
            .catch((err) => {
                console.log(err);
                setMessageSending(false);
                setNewMessage("");
                setChosenFiles([]);
                setInputErrorMessage(err);
            });
    };

    const onLikeClick = () => {
        let data = {
            message: "👍",
        };
        if (conversation.is_group) {
            data["group_id"] = conversation.id;
        } else if (conversation.is_conversation) {
            data["receiver_id"] = conversation.id;
            data["conversation_id"] = conversation.conversation_id;
        } else if (conversation.is_save_conversation) {
            data["save_conversation_id"] = conversation.id;
        }

        setMessageSending(true);

        axios
            .post(route("message.store"), data, {})
            .then((res) => {
                setMessageSending(false);
                emit("newMessage.send", res.data.message);
            })
            .catch((err) => {
                console.log(err);
                setMessageSending(false);
            });
    };

    const onFileChange = (e) => {
        const files = e.target.files;

        const updatedFiles = [...files].map((file) => {
            return {
                file: file,
                path: URL.createObjectURL(file),
            };
        });

        setChosenFiles((pre) => [...pre, ...updatedFiles]);
    };

    const recordAudioReady = (file, path) => {
        setChosenFiles((pre) => [...pre, { file, path }]);
    };

    useEffect(() => {
        const offConversationBlock = on(
            "conversation.block",
            (block_conversation) => {
                if (block_conversation.id == conversation.conversation_id) {
                    setBlock(block_conversation.block);
                }
            }
        );

        return () => {
            offConversationBlock();
        };
    }, [on]);

    return (
        <>
            {!block && (
                <div className="flex flex-wrap items-center border-t border-slate-700 py-3">
                    <div className="order-2 flex flex-1 xs:flex-none xs:order-1 p-2">
                        <label className="p-1 cursor-pointer text-gray-400 hover:text-gray-300 relative">
                            <PaperClipIcon className="w-6" />
                            <input
                                type="file"
                                multiple
                                onChange={onFileChange}
                                className="hidden"
                            />
                        </label>
                        <label className="p-1 cursor-pointer text-gray-400 hover:text-gray-300 relative">
                            <PhotoIcon className="w-6" />
                            <input
                                type="file"
                                multiple
                                onChange={onFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                        <AudioRecorder fileReady={recordAudioReady} />
                    </div>
                    <div className="order-1 px-3 xs:p-0 min-w-[220px] basis-full xs:basis-0 xs:order-2 flex-1 relative">
                        <div className="flex">
                            <MessageInput
                                value={newMessage}
                                onSend={onSendClick}
                                onChange={(ev) =>
                                    setNewMessage(ev.target.value)
                                }
                            />
                            <button
                                onClick={onSendClick}
                                disabled={messageSending}
                                className="btn btn-info rounded-l-none self-end"
                            >
                                <PaperAirplaneIcon className="w-6" />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </div>
                        {inputErrorMessage && (
                            <p className="text-xs text-red-400">
                                {inputErrorMessage}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {chosenFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className={
                                        `relative flex justify-between cursor-pointer ` +
                                        (!isImage(file.file)
                                            ? " w-[240px]"
                                            : "")
                                    }
                                >
                                    {isImage(file.file) && (
                                        <img
                                            src={file.path}
                                            alt=""
                                            className="w-16 h-16 object-cover"
                                        />
                                    )}
                                    {isAudio(file.file) && (
                                        <CustomAudioPlayer
                                            file={file}
                                            showVolume={false}
                                        />
                                    )}
                                    {!isAudio(file.file) &&
                                        !isImage(file.file) && (
                                            <AttachmentPreview file={file} />
                                        )}
                                    <button
                                        onClick={() => {
                                            setChosenFiles(
                                                chosenFiles.filter(
                                                    (f) =>
                                                        f.file.name !==
                                                        file.file.name
                                                )
                                            );
                                        }}
                                        className="absolute w-6 h-6 rounded-full bg-gray-800 -right-2 -top-2 text-gray-300 hover:text-gray-100 z-10"
                                    >
                                        <XCircleIcon className="w-6" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="order-3 xs:order-3 p-2 flex">
                        <Popover className="relative">
                            <Popover.Button className="p-1 text-gray-400 hover:text-gray-300">
                                <FaceSmileIcon className="w-6 h-6" />
                            </Popover.Button>
                            <Popover.Panel className="absolute z-10 right-0 bottom-full">
                                <EmojiPicker
                                    theme="dark"
                                    onEmojiClick={(ev) =>
                                        setNewMessage(newMessage + ev.emoji)
                                    }
                                ></EmojiPicker>
                            </Popover.Panel>
                        </Popover>
                        <button
                            onClick={onLikeClick}
                            className="p-1 cursor-pointer text-gray-400 hover:text-gray-300"
                        >
                            <HandThumbUpIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
            {block && (
                <div className="flex items-center justify-center h-14 shadow-lg shadow-gray-400">
                    This Conversation is no longer Available!
                </div>
            )}
        </>
    );
};

export default MessageInputsBar;
