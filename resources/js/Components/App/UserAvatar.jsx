import React from "react";

const UserAvatar = ({ user, online = null, profile = false }) => {
    let onlineClass =
        online === true ? " online " : online === false ? " offline " : "";

    const sizeClass = profile ? " w-16 " : " w-8 ";

    if (user.avatar) {
        return (
            <div className={`chat-image avatar mx-auto  ${onlineClass}`}>
                <div className={`rounded-full  ${sizeClass}`}>
                    <img src={user.avatar} />
                </div>
            </div>
        );
    } else if (!user.avatar) {
        return (
            <div
                className={`chat-image mx-auto avatar placeholder ${onlineClass}`}
            >
                <div
                    className={`bg-gray-200 text-gray-800 rounded-full ${sizeClass}}`}
                >
                    <span className="text-xl text-center">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                </div>
            </div>
        );
    }
};

export default UserAvatar;
