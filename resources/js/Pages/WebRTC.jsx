import {
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
} from "@heroicons/react/20/solid";
import { usePage } from "@inertiajs/react";
import CallRejectedModal from "../Components/CallRejectedModal";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { formatTime } from "@/helper";

const WebRTC = ({ conversation, is_video }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isLarge, setIsLarge] = useState(false);
    const room = conversation.conversation_id;
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const audioRef = useRef(new Audio("/Ringtones/outcalling.mp3"));
    const noAnswerAudioRef = useRef(new Audio("/Ringtones/noanswer-33477.mp3"));
    audioRef.current.loop = true; // Set the ringtone to loop
    const user = usePage().props.auth.user;
    const [isRejected, setIsRejected] = useState(false);
    const [isAccept, setIsAccept] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [timer, setTimer] = useState(0); // Timer state

    useEffect(() => {
        audioRef.current.play();
        if (conversation.is_conversation) {
            const channel = `private.call.${[conversation.id, user.id]
                .sort((a, b) => a - b)
                .join("-")}`;

            Echo.private(channel).listen("WebRTCEvent", async (e) => {
                switch (e.type) {
                    case "call_reject":
                        if (e.receiverId == user.id) {
                            setIsRejected(true);
                            setIsCalling(false);
                            noAnswerAudioRef.current.play();
                            audioRef.current.pause();
                        }
                        break;
                    case "call_end":
                        if (e.receiverId == user.id) {
                            await endCall();
                        }
                        break;
                    case "call_accept":
                        audioRef.current.pause();
                        break;
                    case "video_muted":
                        if (e.receiverId == user.id) setIsLarge(!isLarge);
                        break;
                }
            });
        }
        return () => {
            if (conversation.is_conversation) {
                const channel = `private.call.${[conversation.id, user.id]
                    .sort((a, b) => a - b)
                    .join("-")}`;
                Echo.leave(channel);
            }
        };
    }, [conversation]);

    useEffect(() => {
        socketRef.current = new WebSocket("ws://localhost:3000");

        socketRef.current.onopen = async () => {
            await socketRef.current.send(
                JSON.stringify({
                    type: "join_room",
                    room_id: room,
                    user_id: user.id,
                })
            );

            socketRef.current.send(
                JSON.stringify({
                    type: "get_users",
                })
            );

            await createOffer();
        };

        socketRef.current.onclose = () => {
            peerConnectionRef.current.close();
        };

        socketRef.current.onerror = (err) => {
            // Log errors only
            console.error("WebSocket error:", err);
        };

        socketRef.current.onmessage = async (message) => {
            if (message.data instanceof Blob) {
                message.data.text().then((text) => {
                    handleMessage(JSON.parse(text));
                });
            } else {
                await handleMessage(JSON.parse(message.data));
            }
        };

        return () => {
            socketRef.current.close();
        };
    }, []);

    const createOffer = async () => {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            await createPeerConnection();

            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socketRef.current.send(JSON.stringify({ type: "offer", offer }));
            setIsCalling(true);
        }
    };

    const handleMessage = async (data) => {
        if (!peerConnectionRef.current) {
            await createPeerConnection();
        }

        if (data.type === "offer") {
            audioRef.current.play();

            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(data.offer)
            );

            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socketRef.current.send(JSON.stringify({ type: "answer", answer }));
        } else if (data.type === "answer") {
            setIsCalling(false);
            audioRef.current.pause();
            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );
        } else if (data.type === "candidate") {
            audioRef.current.pause();
            setIsAccept(true);

            await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(data.candidate)
            );
        }
    };

    const createPeerConnection = async () => {
        peerConnectionRef.current = new RTCPeerConnection();

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.send(
                    JSON.stringify({
                        type: "candidate",
                        candidate: event.candidate,
                    })
                );
            }
        };

        peerConnectionRef.current.ontrack = (event) => {
            setIsLarge(true);
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        const stream = await navigator.mediaDevices.getUserMedia({
            video: is_video,
            audio: true,
        });
        localVideoRef.current.srcObject = stream;

        stream
            .getTracks()
            .forEach((track) =>
                peerConnectionRef.current.addTrack(track, stream)
            );
    };

    const callEnd = () => {
        endCall();
        afterEndCall();
    };

    const endCall = () => {
        noAnswerAudioRef.current.pause();
        setIsRejected(false);
        axios
            .post(route("call_request", conversation), {
                type: "call_end",
            })
            .catch((err) => {
                console.error(err);
            });
        peerConnectionRef.current.close();
        socketRef.current.close();
        audioRef.current.pause();
        localVideoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        remoteVideoRef.current.srcObject
            ?.getTracks()
            .forEach((track) => track.stop());

        window.history.back(); // Go back to the previous page
        setTimeout(() => {
            window.location.reload(); // Reload the page
        }, [10]);
    };

    const afterEndCall = () => {
        const formData = new FormData();
        formData.append("conversation_id", conversation.conversation_id);
        formData.append("type", "call_end");
        formData.append("payload", is_video);
        formData.append("timer", timer);
        axios.post(route("message.store"), formData).catch((err) => {
            console.log(err);
        });
    };

    const toggleMute = () => {
        const stream = localVideoRef.current.srcObject;
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
            audioTracks[0].enabled = !audioTracks[0].enabled;
            setIsMuted(!audioTracks[0].enabled);
        }
    };
    const toggleVideoMute = async () => {
        await setIsVideoMuted(!isVideoMuted);
        const stream = localVideoRef.current.srcObject;
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
            videoTracks[0].enabled = !videoTracks[0].enabled;
        }
        axios
            .post(route("call_request", conversation), {
                type: "video_muted",
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (isAccept) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
        } else if (!isAccept && timer !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isAccept, timer]);

    return (
        <>
            <div className="relative min-h-screen bg-gray-900">
                {/* Main remote video (full screen) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={`${
                        isLarge
                            ? "absolute top-0 left-0 w-full h-full object-cover"
                            : "absolute top-4 left-4 w-32 h-32 z-10 rounded-lg shadow-lg"
                    }${is_video ? "" : " hidden"}`}
                    style={{ transform: "rotateY(180deg)" }}
                    onClick={() => setIsLarge(!isLarge)}
                ></video>
                {/* Local video (small, top-left) */}
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    className={`${
                        isLarge
                            ? "absolute top-4 left-4 w-32 h-32 z-10 rounded-lg shadow-lg"
                            : "absolute top-0 left-0 w-full h-full object-cover"
                    } ${isVideoMuted || !is_video ? " hidden" : ""}`}
                    style={{ transform: "rotateY(180deg)" }}
                    onClick={() => setIsLarge(!isLarge)}
                ></video>
                {/* Normal Calling */}
                {!is_video && (
                    <div className="bg-white w-full h-screen dark:bg-gray-900 flex flex-col justify-center items-center p-6 z-[100] rounded-2xl shadow-2xl text-center">
                        <div className="flex flex-col items-center pb-24">
                            <img
                                src={conversation.avatar}
                                alt="Caller Avatar"
                                className="w-20 h-20 rounded-full mb-4 border-4 border-gray-300 dark:border-gray-700"
                            />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Voice Call
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                                {conversation.name}
                            </p>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-4 bg-transparent rounded-lg shadow-lg">
                    <div className="flex space-x-6">
                        {is_video && (
                            <button
                                onClick={toggleVideoMute}
                                className={`px-4 py-2 text-lg flex items-center justify-center text-white rounded-full shadow-lg focus:outline-none transition-transform duration-300 hover:scale-105 ${
                                    isVideoMuted
                                        ? "bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                                        : "bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900"
                                }`}
                            >
                                {isMuted ? (
                                    <VideoCameraIcon className="w-6 h-6" />
                                ) : (
                                    <VideoCameraSlashIcon className="w-6 h-6" />
                                )}
                                <span className="ml-2 font-semibold">
                                    {isVideoMuted ? "Start" : "stop"}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={callEnd}
                            className="px-4 py-2 text-lg text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none"
                        >
                            <span className="font-semibold">End Call</span>
                        </button>
                        <button
                            onClick={toggleMute}
                            className={`px-4 py-2 text-lg flex items-center justify-center text-white rounded-full shadow-lg focus:outline-none ${
                                isMuted
                                    ? "bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                                    : "bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900"
                            }`}
                        >
                            {isMuted ? (
                                <SpeakerWaveIcon className="w-6 h-6" />
                            ) : (
                                <SpeakerXMarkIcon className="w-6 h-6" />
                            )}
                            <span className="ml-2 font-semibold">
                                {isMuted ? "Unmute" : "Mute"}
                            </span>
                        </button>
                    </div>
                </div>
                <div className="absolute top-4 right-4 text-white">
                    <span>Timer: {formatTime(timer)}</span>
                </div>
            </div>
            {isRejected && <CallRejectedModal onClose={endCall} />}
        </>
    );
};

export default WebRTC;
