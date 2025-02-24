import { useEventBus } from "@/EventBus";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import React, { Fragment } from "react";
const MessageOptionDropdown = ({ message }) => {
    const { emit } = useEventBus();

    const onMessageDelete = () => {
        axios.delete(route("message.destroy", message.id)).catch((error) => {
            console.log(error);
        });
    };

    return (
        <div className="absolute z-50 right-full text-gray-100 top-1/2 -translate-y-1/2">
            <Menu as="div" className={"relative inline-block text-left"}>
                <Menu.Button className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-black/40">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute -left-20 -top-20 mt-2 w-48 mb-4 rounded-md bg-gray-800 shadow-lg z-50 focus:outline-none">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onMessageDelete}
                                        className={`${
                                            active
                                                ? "bg-black/30 text-white"
                                                : "text-gray-100"
                                        } flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Delete
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};

export default MessageOptionDropdown;
