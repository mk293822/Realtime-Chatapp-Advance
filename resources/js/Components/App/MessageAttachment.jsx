import { isImage } from "@/helper";
import React from "react";

const MessageAttachment = ({ attachments, attachmentClick = () => {} }) => {
    return (
        <div className="flex flex-wrap gap-2 p-2">
            {attachments.map((attachment) => (
                <div
                    key={attachment.id}
                    className="relative w-auto h-24 rounded-lg overflow-hidden shadow-lg cursor-pointer border border-gray-200 hover:shadow-xl transition-all"
                    onClick={() => attachmentClick(attachment)}
                >
                    {isImage(attachment) ? (
                        <img
                            src={attachment.path}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-600">
                            <span className="text-sm">{attachment.name}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MessageAttachment;
