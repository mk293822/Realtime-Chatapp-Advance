import React, { useState } from "react";

export const EventBusContext = React.createContext();

export const EventBusProvider = ({ children }) => {
    const [event, setEvent] = useState({});

    const emit = (event_name, value) => {
        if (event[event_name]) {
            for (let call_back of event[event_name]) {
                call_back(value);
            }
        }
    };

    const on = (event_name, call_back) => {
        if (!event[event_name]) {
            event[event_name] = [];
        }
        event[event_name].push(call_back);

        return () => {
            event[event_name] = event.filter((cb) => cb !== call_back);
        };
    };

    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
};

export const useEventBus = () => {
    return React.useContext(EventBusContext);
};
