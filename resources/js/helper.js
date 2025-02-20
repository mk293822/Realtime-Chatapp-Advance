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
