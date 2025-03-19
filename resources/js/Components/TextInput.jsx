import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export default forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, onKeyUp, ...props },
    ref
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
        get value() {
            return localRef.current?.value;
        },
        set value(val) {
            if (localRef.current) localRef.current.value = val;
        },
        onKeyUp: (event) => {
            if (onKeyUp) onKeyUp(event);
        },
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                "rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 " +
                className
            }
            ref={localRef}
            onKeyUp={(e) => {
                if (onKeyUp) onKeyUp(e);
            }}
        />
    );
});
