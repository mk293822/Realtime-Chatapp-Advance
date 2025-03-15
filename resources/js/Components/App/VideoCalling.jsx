import {
    PhoneXMarkIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    VideoCameraSlashIcon,
} from "@heroicons/react/20/solid";
import React from "react";

const VideoCalling = ({
    localVideoRef = null,
    remoteVideoRef = null,
    handleEndCall = () => {},
    isMuted,
    setIsMuted = () => {},
}) => {
    return (
        <div className="w-full h-full relative">
            {/* Remote Video */}
            <video
                ref={
                    // remoteVideoRef.current === null
                    //     ? localVideoRef
                    //     :
                    remoteVideoRef
                }
                className="w-full h-full bg-black object-cover"
                autoPlay
                playsInline
                style={{ transform: "rotateY(180deg)" }}
            ></video>

            {/* Local Video (Small Corner) */}
            {remoteVideoRef.current !== null && (
                <video
                    ref={localVideoRef}
                    className="w-40 h-40 fixed top-5 left-5 rounded-md"
                    autoPlay
                    playsInline
                    style={{ transform: "rotateY(180deg)" }}
                ></video>
            )}

            <div className="absolute w-full flex bottom-5 mx-auto items-center justify-center gap-8">
                <div className="flex text-sm flex-col gap-2 items-center justify-center">
                    <button className="bg-blue-500 p-4 text-white rounded-full">
                        <VideoCameraSlashIcon className="size-6" />
                    </button>
                    End Video
                </div>
                <div className="flex text-sm flex-col gap-2 items-center justify-center">
                    <button
                        onClick={handleEndCall}
                        className="bg-red-500 p-4 text-white rounded-full"
                    >
                        <PhoneXMarkIcon className="size-6" />
                    </button>
                    End Call
                </div>
                <div className="flex text-sm flex-col gap-2 items-center justify-center">
                    <button
                        className={
                            "p-4 text-white rounded-full " +
                            (isMuted ? " bg-red-500" : " bg-blue-500")
                        }
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? (
                            <SpeakerXMarkIcon className="size-6" />
                        ) : (
                            <SpeakerWaveIcon className="size-6" />
                        )}
                    </button>
                    {!isMuted ? "Mute" : "UnMuted"}
                </div>
            </div>
        </div>
    );
};

export default VideoCalling;
