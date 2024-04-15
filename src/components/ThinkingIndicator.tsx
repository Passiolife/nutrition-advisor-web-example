import React from "react";

const AdvisorThinkingComponent: React.FC = () => {
    return (
        <div className="flex items-center justify-center space-x-2 animate-pulse m-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce200"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce400"></div>
            <span className="text-sm text-gray-500">Advisor is thinking</span>
        </div>
    );
};

export default AdvisorThinkingComponent;
