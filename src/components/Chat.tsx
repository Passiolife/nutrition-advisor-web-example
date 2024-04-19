import React, { useContext, useEffect, useRef, useState } from "react";
import { APIClientContext } from "../context/AdvisorClientContext";
import { ReactComponent as Avatar } from "../svg/advisor.svg";
import { ReactComponent as Gear } from "../svg/gear.svg";
import TooltipCard from "./IngredientTip";
import InputArea from "./InputArea";
import MessageComponent from "./Message";
import ProfileExample from "./ProfileExample";
import AdvisorThinkingComponent from "./ThinkingIndicator";
import { types } from "passio-nutrition-advisor-client";

const Chat: React.FC = () => {
    const {
        apiClient,
        setUserProfile,
        messages,
        sendMessage,
        availableTools,
        advisorThinking,
        sendTargetToolRequest,
        sendVisionToolRequest,
        activeIngredientHoverContent,
    } = useContext(APIClientContext);

    const [apiReady, setApiReady] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (apiClient) {
            apiClient.waitForReady(3000).then((r) => {
                setApiReady(r);
            });
        }
    }, [apiClient]);

    useEffect(() => {
        if (apiReady) {
            const storedData = localStorage.getItem("formData");
            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                    setUserProfile(parsedData);
                } catch (e) {
                    console.error("Failed to parse stored data");
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiReady]);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col bg-gray-50 w-5/6 h-5/6 rounded-lg">
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
                <div className="flex-1 overflow-y-auto">
                    {messages.map((message) => (
                        <MessageComponent
                            key={message.id}
                            message={message}
                            onContextMenuClick={(
                                messageId: string,
                                toolName: string
                            ) => {
                                availableTools.forEach((tool) => {
                                    if (
                                        tool.type === "target" &&
                                        tool.name === toolName
                                    ) {
                                        sendTargetToolRequest(messageId, tool);
                                    }
                                });
                            }}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {advisorThinking && <AdvisorThinkingComponent />}
                <InputArea
                    disable={false}
                    onSend={sendMessage}
                    onImageSend={(image: string) => {
                        let tool = availableTools.find(
                            (tool) => tool.name === "VisualFoodExtraction"
                        );
                        if (tool) {
                            sendVisionToolRequest(
                                {
                                    image: image,
                                } as types.AdvisorIncomingVisionRequest,
                                tool
                            );
                        }
                    }}
                />
            </div>
            {isModalOpen && (
                <ProfileExample
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            {activeIngredientHoverContent && (
                <TooltipCard
                    ingredientData={activeIngredientHoverContent.item}
                    className="context-menu absolute bg-white shadow-lg rounded-lg p-1 z-10 w-72 flex flex-col justify-start items-start"
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
