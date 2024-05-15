import React, { useState } from "react";

interface InputAreaProps {
    disable: boolean;
    onSend: (message: string) => void;
    onImageSend: (base64Image: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({
    disable,
    onSend,
    onImageSend,
}) => {
    const [inputValue, setInputValue] = useState("");

    const handleSend = () => {
        if (inputValue.trim() !== "") {
            onSend(inputValue);
            setInputValue("");
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result as string;
                // onImageSend(base64Image.split(",")[1]); // Remove the data URL prefix
                onImageSend(base64Image); // Remove the data URL prefix
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 rounded-md shadow">
            <div className="flex items-center justify-start grow">
                <label
                    htmlFor="imageInput"
                    className="m-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none transition-colors cursor-pointer"
                >
                    <span className="text-2xl">+</span>
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                </label>
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
