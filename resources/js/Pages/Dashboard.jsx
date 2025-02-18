import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { Head } from "@inertiajs/react";

function Dashboard() {
    return (
        <div>
            <Head title="Dashboard" />
            <div className="">Hi</div>
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
