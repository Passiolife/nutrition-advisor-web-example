import React, { FormEvent, useState } from "react";
import "./App.css";
import Chat from "./components/Chat";
import { APIClientProvider } from "./context/AdvisorClientContext";
import "./tailwind.css";

function App() {
    const searchParams = new URLSearchParams(window.location.search);
    const initialLicenseKey = searchParams.get("licenseKey");
    const decodedLicenseKey = initialLicenseKey
        ? atob(initialLicenseKey)
        : null;
    const [licenseKey, setLicenseKey] = useState(initialLicenseKey);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (licenseKey) {
            // Construct the new URL with the license key
            const url = new URL(window.location.href);
            url.searchParams.set("licenseKey", btoa(licenseKey));
            window.location.href = url.toString(); // Navigate to the new URL
        }
    };

    return (
        <div className="App">
            {decodedLicenseKey ? (
                <APIClientProvider
                    baseURL={process.env.REACT_APP_API_BASE as string}
                    licenseKey={decodedLicenseKey as string}
                >
                    <Chat />
                </APIClientProvider>
            ) : (
                <div className="flex justify-center items-center h-screen">
                    <div>
                        <h1 className="text-center text-xl font-bold mb-4">
                            Please provide a license key:
                        </h1>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col items-center"
                        >
                            <input
                                type="text"
                                value={licenseKey || ""}
                                onChange={(e) => setLicenseKey(e.target.value)}
                                className="text-lg p-2 border-2 border-gray-300 rounded w-full"
                                placeholder="Enter your license key here"
                            />
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
