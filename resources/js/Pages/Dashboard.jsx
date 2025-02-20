import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageInputsBar from "@/Components/App/MessageInputsBar";
import MessageItem from "@/Components/App/MessageItem";
import { useEventBus } from "@/EventBus";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { Head } from "@inertiajs/react";
import { useEffect } from "react";

function Dashboard({ selected_conversation = null, messages = null }) {
    const { emit } = useEventBus();

    return (
        <div>
            <Head title="Dashboard" />
            <div className="">
                <ConversationHeader />
                <div className="">
                    <MessageItem messages={messages} />
                </div>
                <MessageInputsBar />
            </div>
        </div>
    );
}

Dashboard.layout = (page) => {
    return (
        <AuthenticatedLayout>
            <ChatLayout children={page}></ChatLayout>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
