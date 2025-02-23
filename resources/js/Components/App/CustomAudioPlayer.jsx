import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useRef, useState } from "react";

const CustomAudioPlayer = ({ file, showVolume = true }) => {
    const audioRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const onTimeUpdate = (e) => {
        const audio = audioRef.current;
        setDuration(audio.duration);
        setCurrentTime(e.target.currentTime);
    };

    const onLoadedMetadata = (e) => {
        setDuration(e.target.duration);
    };
    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            setDuration(audio.duration);
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const onVolumeChange = (e) => {
        const volume = e.target.value;
        audioRef.current.volume = volume;
        setVolume(volume);
    };

    const onSeekBarChange = (e) => {
        const time = e.target.value;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    return (
        <div className="w-full items-center gap-2 py-2 px-3 rounded-md bg-slate-800">
            <audio
                src={file.path}
                controls
                ref={audioRef}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                className="hidden"
            ></audio>
            <button onClick={togglePlayPause} className="my-auto">
                {!!isPlaying && (
                    <PauseCircleIcon className="w-6 text-gray-400" />
                )}
                {!isPlaying && <PlayCircleIcon className="w-6 text-gray-400" />}
            </button>
            {!!showVolume && (
                <input
                    value={volume}
                    min={0}
                    max={1}
                    step={0.01}
                    type="range"
                    onChange={onVolumeChange}
                />
            )}
            <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                step={0.01}
                className="flex-1"
                onChange={onSeekBarChange}
            />
        </div>
    );
};

export default CustomAudioPlayer;
