import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { PhoneIcon, PhoneXMarkIcon } from "@heroicons/react/20/solid";

export default function IncomingCallModal({
    callerName,
    isOpen,
    onAccept,
    onReject,
    callerAvatar,
}) {
    return (
        <Transition show={isOpen} leave="duration-200">
            <Dialog
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                onClose={() => {}}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-black bg-opacity-40" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel className="bg-white dark:bg-gray-900 h-80 flex flex-col justify-between items-center p-6 z-[100] rounded-2xl shadow-2xl w-96 text-center">
                        <div className="flex flex-col items-center">
                            <img
                                src={callerAvatar}
                                alt="Caller Avatar"
                                className="w-20 h-20 rounded-full mb-4 border-4 border-gray-300 dark:border-gray-700"
                            />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Incoming Call
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                                {callerName}
                            </p>
                        </div>
                        <div className="flex gap-6 mt-6 justify-center">
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full flex items-center shadow-lg"
                                onClick={onAccept}
                            >
                                <PhoneIcon className="w-6 h-6 mr-2" /> Accept
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-full flex items-center shadow-lg"
                                onClick={onReject}
                            >
                                <PhoneXMarkIcon className="w-6 h-6 mr-2" />{" "}
                                Reject
                            </button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
