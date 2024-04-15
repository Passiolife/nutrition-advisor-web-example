// Chat.tsx

import React, { useContext, useEffect, useState } from "react";
import MessageComponent from "./Message";
import InputArea from "./InputArea";
import { APIClientContext } from "../context/AdvisorClientContext";
import AdvisorThinkingComponent from "./ThinkingIndicator";
import { Card, CardBody } from "@material-tailwind/react";
import { ReactComponent as Avatar } from "../svg/advisor.svg";
import { ReactComponent as Gear } from "../svg/gear.svg";
import ProfileExample from "./ProfileExample";
import TooltipCard from "./IngredientTip";

const Chat: React.FC = () => {
    const {
        setUserProfile,
        messages,
        sendMessage,
        availableTools,
        advisorThinking,
        sendToolRequest,
        activeIngredientHoverContent,
    } = useContext(APIClientContext);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const delayedEffect = React.useCallback(() => {
        const timer = setTimeout(() => {
            const storedData = localStorage.getItem("formData");
            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                    setUserProfile(parsedData);
                } catch (e) {
                    console.error("Failed to parse stored data");
                }
            }
        }, 1100);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableTools]);

    useEffect(() => {
        delayedEffect();
    }, [delayedEffect]);

    return (
        <div className="flex justify-center items-center h-screen">
            <Card
                shadow
                className="flex flex-col bg-gray-50 w-5/6 h-5/6 rounded-lg"
            >
                <div className="bg-white flex-col justify-start items-start inline-flex">
                    <div className="self-stretch px-6 py-5 justify-between items-center inline-flex">
                        <div className="justify-start items-center gap-4 flex">
                            <Avatar className="w-14 h-14" />
                            <div className="flex-col justify-start items-start inline-flex">
                                <div className="text-gray-700 text-lg font-medium font-sans leading-normal">
                                    Nutrition AI Advisor
                                </div>
                            </div>
                        </div>
                        <Gear
                            className="w-6 h-6 hover:brightness-125 hover:cursor-pointer"
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>
                    <div className="self-stretch h-px bg-gray-200" />
                </div>
                <CardBody className="flex-1 overflow-y-auto">
                    {messages.map((message) => (
                        <MessageComponent
                            key={message.id}
                            message={message}
                            onContextMenuClick={(
                                messageId: string,
                                toolName: string
                            ) => {
                                availableTools.forEach((tool) => {
                                    if (tool.name === toolName) {
                                        sendToolRequest(messageId, tool);
                                    }
                                });
                            }}
                        />
                    ))}
                </CardBody>
                {advisorThinking && <AdvisorThinkingComponent />}
                <InputArea disable={false} onSend={sendMessage} />
            </Card>
            {isModalOpen && (
                <ProfileExample
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            {activeIngredientHoverContent && (
                <TooltipCard
                    ingredientData={activeIngredientHoverContent.item}
                    className="context-menu absolute bg-white shadow-lg rounded-lg p-1 z-10 w-56 flex flex-col justify-start items-start"
                    style={{
                        position: "fixed",
                        left: activeIngredientHoverContent.xpos + 20,
                        top: activeIngredientHoverContent.ypos,
                    }}
                ></TooltipCard>
            )}
        </div>
    );
};

export default Chat;
