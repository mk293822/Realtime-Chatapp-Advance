import { MicrophoneIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";

const AudioRecorder = ({ fileReady }) => {
    const [recording, setRecording] = useState();

    const onMicrophoneClick = () => {};

    return (
        <button
            onClick={onMicrophoneClick}
            className="p-1 text-gray-400 hover:text-gray-200"
        >
            {recording && <StopCircleIcon className="w-6 text-red-600" />}
            {!recording && <MicrophoneIcon className="w-6" />}
        </button>
    );
};

export default AudioRecorder;
