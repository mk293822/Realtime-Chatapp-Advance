import { useEffect } from "react";

export function formatActiveDate(date) {
    const now = new Date();
    const inputDate = new Date(date);
    const diffInMilliseconds = now - inputDate; // Difference in milliseconds
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000); // Convert to seconds

    const minutes = 60;
    const hours = minutes * 60;
    const days = hours * 24;
    const months = days * 30; // Approximation
    const years = months * 12; // Approximation

    if (diffInSeconds < minutes) return `less than a minute ago`;
    if (diffInSeconds < hours) return `${Math.floor(diffInSeconds / minutes)} minute${Math.floor(diffInSeconds / minutes) !== 1 ? 's' : ''} ago`;
    if (diffInSeconds < days) return `${Math.floor(diffInSeconds / hours)} hour${Math.floor(diffInSeconds / hours) !== 1 ? 's' : ''} ago`;
    if (diffInSeconds < months) return `${Math.floor(diffInSeconds / days)} day${Math.floor(diffInSeconds / days) !== 1 ? 's' : ''} ago`;
    if (diffInSeconds < years) return `${Math.floor(diffInSeconds / months)} month${Math.floor(diffInSeconds / months) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInSeconds / years)} year${Math.floor(diffInSeconds / years) !== 1 ? 's' : ''} ago`;
}

export function formatMessageDate(date) {
    const input_date = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - input_date) / (1000 * 86400));

    if (diffDays === 1) return `Yesterday : ${input_date.toLocaleTimeString([], { hour: "numeric", minute: "numeric" })}`;
    if (diffDays > 1) return input_date.toLocaleDateString();

    return input_date.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
}

export function debounce(func, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, delay)
    }
}


export const handleOutsideClick = (ref, callback = () => { }) => {
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && ref.current.contains(e.target)) {
                return;
            }
            callback();
        }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        }
    }, [callback]);
}


export const isImage = (file) => {
    let mime = file.mime || file.type;
    mime = mime.split('/');
    return mime[0].toLowerCase() === 'image';
}
export const isAudio = (file) => {
    let mime = file.mime || file.type;
    mime = mime.split('/');
    return mime[0].toLowerCase() === 'audio';
}
export const isVideo = (file) => {
    let mime = file.mime || file.type;
    mime = mime.split('/');
    return mime[0].toLowerCase() === 'video';
}
export const isPDF = (file) => {
    let mime = file.mime || file.type;
    return mime === 'application/pdf';
}

export const isPreviewAble = (attachment) => {
    return (
        isImage(attachment) ||
        isVideo(attachment) ||
        isAudio(attachment) ||
        isPDF(attachment)
    )
}

export const formatBytes = (size) => {
    if (size === 0) return "0 B"; // Handle zero bytes case

    const sizeUnits = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));

    return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizeUnits[i]}`;
};