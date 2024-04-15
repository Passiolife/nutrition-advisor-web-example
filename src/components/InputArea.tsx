// InputArea.tsx

import React, { useState } from "react";

interface InputAreaProps {
    disable: boolean;
    onSend: (message: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ disable, onSend }) => {
    const [inputValue, setInputValue] = useState("");

    const handleSend = () => {
        if (inputValue.trim() !== "") {
            onSend(inputValue);
            setInputValue("");
        }
    };

    return (
        <div className="flex items-center justify-between p-4 rounded-md shadow">
            <div className="flex items-center justify-start grow">
                <input
                    type="text"
                    disabled={disable}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            handleSend();
                        }
                    }}
                    className="w-full p-2.5 bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Type your message here..."
                />
            </div>
            <button
                onClick={handleSend}
                disabled={disable}
                className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none transition-colors"
            >
                Send
            </button>
        </div>
    );
};

export default InputArea;
