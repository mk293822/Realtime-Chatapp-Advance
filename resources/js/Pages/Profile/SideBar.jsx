import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import UserAvatar from "@/Components/App/UserAvatar";
import {
    ArchiveBoxIcon,
    BookmarkIcon,
    Cog8ToothIcon,
    MoonIcon,
    UserCircleIcon,
    UsersIcon,
} from "@heroicons/react/20/solid";
import { Switch } from "@headlessui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useEventBus } from "@/EventBus";

export default function SideBar({ mustVerifyEmail, status, conversations }) {
    const page = usePage().props;
    const { emit } = useEventBus();

    const [enabled, setEnabled] = useState(page.auth.user.dark_mode);
    const [showArchived, setShowArchived] = useState(true);

    // show archived
    useEffect(() => {
        const archived_conversations = conversations.filter(
            (con) => con.archived
        );
        if (archived_conversations.length > 0) {
            setShowArchived(true);
        } else {
            setShowArchived(false);
        }
    }, [conversations]);

    const handleDarkMode = () => {
        axios
            .post(route("user.dark_mode", page.auth.user), {})
            .then((res) => {
                setEnabled(res.data.dark_mode);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleArchived = () => {
        if (showArchived) {
            emit("archived.show");
        }
    };

    useEffect(() => {
        if (enabled) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [enabled]);

    const user = page.auth.user;

    return (
        <div className="w-72 menu h-screen bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            {/* User Profile */}
            <div className="flex flex-col items-center mb-4 mr-8">
                <UserAvatar user={user} profile={true} />
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="capitalize text-center">{user.name}</li>
                    <li>{user.email}</li>
                </ul>
            </div>

            <div className="divide-y divide-gray-300 dark:divide-gray-700">
                {/* Account Options */}
                <div className="py-2 space-y-2">
                    <button className="flex w-full items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                        <UserCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <span className="ml-3 text-sm text-gray-800 dark:text-gray-200">
                            My Account
                        </span>
                    </button>
                    <button
                        disabled={!showArchived}
                        onClick={handleArchived}
                        className="flex w-full items-center px-2 py-2 disabled:bg-gray-100/50 disabled:dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                    >
                        <ArchiveBoxIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <span className="ml-3 text-sm text-gray-800 dark:text-gray-200">
                            {showArchived
                                ? "Archived Chats"
                                : "No Archived Chat Found"}
                        </span>
                    </button>
                </div>

                {/* More Options */}
                <div className="py-2 space-y-2">
                    <button className="flex w-full items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                        <UsersIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <span className="ml-3 text-sm text-gray-800 dark:text-gray-200">
                            Add New Group
                        </span>
                    </button>
                    <button className="flex w-full items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                        <Cog8ToothIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <span className="ml-3 text-sm text-gray-800 dark:text-gray-200">
                            Settings
                        </span>
                    </button>
                    <button className="flex w-full items-center px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                        <BookmarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <span className="ml-3 text-sm text-gray-800 dark:text-gray-200">
                            Saved Messages
                        </span>
                    </button>
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center">
                            <MoonIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <span className="ml-3 text-sm text-gray-800 dark:text-gray-200">
                                Dark Mode
                            </span>
                        </div>
                        <Switch
                            checked={enabled}
                            onChange={handleDarkMode}
                            className="relative inline-flex items-center h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors focus:outline-none"
                        >
                            <span
                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                    enabled ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    );
}
