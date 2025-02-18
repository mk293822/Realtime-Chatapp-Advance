import {
    Combobox,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";
import { useEffect } from "react";

const ChatLayout = ({ children }) => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(onlineUsers[0]);
    const [query, setQuery] = useState("");

    const filteredPeople =
        query === ""
            ? onlineUsers
            : onlineUsers.filter((person) => {
                  return person.name
                      .toLowerCase()
                      .includes(query.toLowerCase());
              });

    useEffect(() => {
        Echo.join("online")
            .here((users) => {
                setOnlineUsers(users);
                // console.log(users);
            })
            .joining((user) => {
                setOnlineUsers((pre) => [...pre, user]);
            })
            .leaving((user) => {
                setOnlineUsers((pre) => {
                    return pre.filter((ur) => ur.id !== user.id);
                });
            })
            .error((err) => {
                console.log(err);
            });

        return () => {
            Echo.leave("online");
        };
    }, []);

    return (
        <>
            <div className="flex flex-1 dark:text-gray-400 h-screen text-gray-800 overflow-hidden w-full">
                <div className="flex">
                    <div className="hidden md:block w-[18rem] p-4 dark:bg-inherit/10 border-r-2 border-slate-800 rounded-md">
                        <Combobox
                            value={selectedPerson}
                            onChange={setSelectedPerson}
                            onClose={() => setQuery("")}
                        >
                            <ComboboxInput
                                aria-label="Assignee"
                                displayValue={(person) => person?.name}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search....."
                                className={"w-full rounded-md bg-inherit"}
                            />
                            <ComboboxOptions
                                anchor="bottom"
                                className="border empty:invisible bg-inherit mt-1 rounded"
                            >
                                {filteredPeople.map((person) => (
                                    <ComboboxOption
                                        key={person.id}
                                        value={person}
                                        className="group flex w-64 gap-2 bg-inherit data-[focus]:bg-slate-700 px-2"
                                    >
                                        <CheckIcon className="size-4 mt-1 invisible text-inherit group-data-[selected]:visible" />
                                        {person.name}
                                    </ComboboxOption>
                                ))}
                            </ComboboxOptions>
                        </Combobox>
                    </div>
                    <div className="flex-1">{children}</div>
                </div>
            </div>
        </>
    );
};

export default ChatLayout;
