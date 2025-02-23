import { isAudio, isImage, isPDF, isPreviewAble, isVideo } from "@/helper";
import {
    ArrowDownTrayIcon,
    PaperClipIcon,
    PlayCircleIcon,
} from "@heroicons/react/20/solid";
import React, { useMemo } from "react";
import CustomAudioPlayer from "./CustomAudioPlayer";

const MessageAttachment = ({ attachments, attachmentClick = () => {} }) => {
    const messageAttachments = useMemo(() => {
        return attachments;
    }, [attachments]);

    return (
        <div className="flex flex-wrap gap-2 p-2">
            {messageAttachments.map((attachment, index) => (
                <div
                    key={attachment.id}
                    className={
                        `group flex flex-col items-center justify-center text-gray-500 relative cursor-pointer ` +
                        (isAudio(attachment)
                            ? "w-84"
                            : "w-32 aspect-square bg-blue-100")
                    }
                    onClick={() =>
                        !isAudio(attachment)
                            ? attachmentClick(attachments, index)
                            : ""
                    }
                >
                    {!isAudio(attachment) && (
                        <a
                            onClick={(ev) => ev.stopPropagation()}
                            download
                            className="z-20 opacity-100 group-hover:opacity-100 transition-all w-8 h-8 flex items-center justify-center text-gray-700 rounded absolute right-0 top-0 cursor-pointer hover:bg-gray-800"
                            href={attachment.path}
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        </a>
                    )}
                    {isImage(attachment) && (
                        <img
                            src={attachment.path}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                        />
                    )}
                    {isAudio(attachment) && (
                        <div className="relative flex justify-center items-center">
                            <audio src={attachment.path} controls></audio>
                        </div>
                    )}
                    {isVideo(attachment) && (
                        <div className="relative flex justify-center items-center">
                            <PlayCircleIcon className="z-20 absolute w-16 h-16 text-white opacity-70" />
                            <div className="absolute left-0 top-0 w-full h-full bg-black/50 z-10"></div>
                            <video src={attachment.path}></video>
                        </div>
                    )}
                    {isPDF(attachment) && (
                        <div className="relative flex justify-center items-center">
                            <div className="absolute left-0 top-0 right-0 bottom-0"></div>
                            <iframe
                                src={attachment.path}
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    )}
                    {!isPreviewAble(attachment) && (
                        <a
                            href={attachment.path}
                            onClick={(ev) => ev.stopPropagation()}
                            download
                            className="flex flex-col justify-center items-center"
                        >
                            <PaperClipIcon className="w-10 h-10 mb-3" />
                            <small>{attachment.name}</small>
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MessageAttachment;
