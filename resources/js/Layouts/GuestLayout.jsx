import ApplicationLogo from "@/Components/ApplicationLogo";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0 bg-gray-900">
            <div>
                <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
            </div>

            <div className="mt-6 w-full overflow-hidden  px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
