// AdvisorClientContext.tsx

import React, { createContext, useState, useEffect } from "react";
import APIClient from "../client/AdvisorClient";
import {
    UserProfileData,
    IngredientHoverContent,
    Message,
    OutgoingSearchResult,
    ToolFunctionDefinition,
    ToolRunResult,
} from "../types/types";

interface APIClientContextProps {
    apiClient: APIClient | null;
    userProfile: UserProfileData;
    setUserProfile: (profile: UserProfileData) => void;
    messages: Message[];
    sendMessage: (content: string) => Promise<void>;
    availableTools: ToolFunctionDefinition[];
    advisorThinking: boolean;
    sendToolRequest: (
        targetMessageId: string,
        tool: ToolFunctionDefinition
    ) => Promise<void>;
    getToolRunResultsForMessage: (messageId: string) => ToolRunResult[];
    activeIngredientHoverContent: IngredientHoverContent | null;
    setIngredientForHover: (
        item: OutgoingSearchResult | null,
        x: number,
        y: number
    ) => void;
}

export const APIClientContext = createContext<APIClientContextProps>({
    apiClient: null,
    userProfile: {} as UserProfileData,
    setUserProfile: () => {},
    messages: [],
    sendMessage: async () => {},
    availableTools: [],
    advisorThinking: false,
    sendToolRequest: async () => {},
    getToolRunResultsForMessage: () => [],
    activeIngredientHoverContent: null,
    setIngredientForHover: async () => {},
});

interface APIClientProviderProps {
    children: React.ReactNode;
    baseURL: string;
    licenseKey: string;
}

export const APIClientProvider: React.FC<APIClientProviderProps> = ({
    children,
    baseURL,
    licenseKey,
}) => {
    const [apiClient, setApiClient] = useState<APIClient | null>(null);

    const [userProfile, setUserProfile] = useState<UserProfileData>(
        {} as UserProfileData
    );
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "0",
            type: "system-message",
            content: `Welcome${
                " " + userProfile !== undefined && userProfile
                    ? userProfile.name
                    : ""
            }! I am your AI Nutrition Advisor!

##### You can ask me things like:
- *How many calories are in ...?*
- *Create me a recipe for dinner using...*
- *Review my last 3 days of meal logs and tell me how to improve.*
- *I have previously had a cardiac event, how can I adjust my diet to help?*
    
You can also **right-click** on my messages for advanced tools, such as **Extract Ingredients**.
Running this on a recipe will link all the ingredients to a food in our database for you!

Lets chat!`,
        },
    ]);
    const [availableTools, setAvailableTools] = useState<
        ToolFunctionDefinition[]
    >([]);
    const [advisorThinking, setAdvisorThinking] = useState<boolean>(false);
    const [toolRunResults, setToolRunResults] = useState<ToolRunResult[]>();
    const [activeIngredientHoverContent, setActiveIngredientHoverContent] =
        useState<IngredientHoverContent | null>(null);

    useEffect(() => {
        const initializeAPIClient = async () => {
            const client = new APIClient(baseURL, licenseKey);
            await client.fetchToken();
            setApiClient(client);

            const tools = await client.getAvailableTools();
            setAvailableTools(tools);

            // get thread ID here if needed
            await client.beginConversationThread();

            // Load user profile data from local storage
            const storedProfileData = localStorage.getItem("userProfile");
            if (storedProfileData) {
                try {
                    const parsedProfileData = JSON.parse(storedProfileData);
                    setUserProfile(parsedProfileData);
                } catch (error) {
                    console.error(
                        "Failed to parse stored user profile data:",
                        error
                    );
                }
            }
        };

        initializeAPIClient();
    }, [baseURL, licenseKey]);

    function getToolRunResultsForMessage(messageId: string): ToolRunResult[] {
        return (
            toolRunResults?.filter(
                (result) => result.messageId === messageId
            ) || []
        );
    }

    function updateMessageContent(
        messageId: string,
        items: OutgoingSearchResult[]
    ): [Message, number] {
        let nm = messages.find((m) => m.id === messageId) as Message;
        const tgtInd = messages.findIndex((m) => m.id === messageId);
        let doneIngreidents = [] as string[];
        for (let i = 0; i < items.length; i++) {
            if (doneIngreidents.includes(items[i].ingredientName)) continue;
            doneIngreidents.push(items[i].ingredientName);

            const imgUrl = `https://storage.googleapis.com/passio-prod-env-public-cdn-data/label-icons/${items[i].iconId}-90.jpg`;
            let iconStr = `![Icon](${imgUrl})`;

            let linkStr = `[${items[i].ingredientName}](${
                process.env.REACT_APP_API_BASE
            }/products/food/search/results/${
                items[i].labelId || "00000000-0000-0000-0000-000000000000"
            }/${items[i].type}/${items[i].resultId})`;

            nm.content = nm.content.replace(
                new RegExp(items[i].ingredientName, "gi"),
                `${items[i].iconId !== "" ? iconStr + " " + linkStr : linkStr}`
            );
        }
        return [nm, tgtInd];
    }

    const setIngredientForHover = async (
        item: OutgoingSearchResult | null,
        x: number,
        y: number
    ) => {
        if (!item) {
            await setActiveIngredientHoverContent(null);
            return;
        }
        await setActiveIngredientHoverContent({
            xpos: x,
            ypos: y,
            item: item,
        });
    };

    const updateUserProfile = async (profile: UserProfileData) => {
        setUserProfile(profile);
        // Store the updated user profile data in local storage
        localStorage.setItem("userProfile", JSON.stringify(profile));
        const reduced = { ...profile, mealLogs: null };
        // Send the update to the advisor
        await sendMessage(
            `User profile updated. Do not respond with any advice or information. Acknowledge you received their profile, and that you understand their information. Profile data: ${JSON.stringify(
                reduced,
                null
            )}`,
            true,
            false
        );
    };

    const sendMessage = async (
        content: string,
        hideOutgoing: boolean = false,
        autoDetectLogs: boolean = true
    ) => {
        if (!apiClient) {
            console.error("APIClient is not initialized.");
            return;
        }

        if (!hideOutgoing) {
            const newMessage: Message = {
                id: Date.now().toString(),
                type: "user-message",
                content,
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        try {
            setAdvisorThinking(true);
            const response = await apiClient.sendUserMessage(
                content,
                autoDetectLogs
            );
            if (response) {
                // prepare response display object
                const advisorMessage: Message = {
                    id: response.messageId,
                    type: "advisor-message",
                    content: response.content,
                };

                // Handle Data requests, if exist
                if (response.dataRequest) {
                    switch (response.dataRequest?.Name) {
                        case "DetectMealLogsRequired":
                            // The request contains a number value signifying how many days of logs were requested, so you can
                            // minimze data required to be sent and reduce tokens. For this example, since profiles are small and ephemeral,
                            // im ignoring it and sending all data
                            let ar = await apiClient.handleDataRequest(
                                response,
                                JSON.stringify(
                                    userProfile?.mealLogs ||
                                        "Respond telling me I don't actually have any meal logs stored to review."
                                )
                            );
                            advisorMessage.id = ar?.messageId || "";
                            advisorMessage.content = ar?.content || "";
                            break;
                        default:
                            throw new Error("Unhandled data request");
                    }
                }

                setMessages((prevMessages) => [
                    ...prevMessages,
                    advisorMessage,
                ]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setAdvisorThinking(false);
        }
    };

    const sendToolRequest = async (
        targetMessageId: string,
        tool: ToolFunctionDefinition
    ) => {
        if (!apiClient) {
            console.error("APIClient is not initialized.");
            return;
        }

        try {
            setAdvisorThinking(true);
            const response = await apiClient.sendToolRequest(
                targetMessageId,
                tool.name
            );
            if (response) {
                let result: ToolRunResult = {
                    messageId: targetMessageId,
                    toolName: tool.name,
                    toolDisplayName: tool.displayName,
                    content: response.actionResponse?.data || "",
                };

                // Handle different tools data responses as necessary. See docs
                switch (tool.name) {
                    case "SearchIngredientMatches":
                        const items = JSON.parse(
                            response.actionResponse?.data || "[]"
                        ) as OutgoingSearchResult[];
                        result.content = items;
                        setToolRunResults((prevResults) => [
                            ...(prevResults || []),
                            result,
                        ]);
                        let [updatedMessage, tgtInd] = updateMessageContent(
                            targetMessageId,
                            items
                        );
                        setMessages((prevMessages) => [
                            ...prevMessages.slice(0, tgtInd),
                            updatedMessage,
                            ...prevMessages.slice(tgtInd + 1),
                        ]);
                        break;
                    default:
                        throw new Error("Unhandled tool");
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setAdvisorThinking(false);
        }
    };

    return (
        <APIClientContext.Provider
            value={{
                apiClient,
                userProfile,
                setUserProfile: updateUserProfile,
                messages,
                sendMessage,
                availableTools,
                advisorThinking,
                sendToolRequest,
                getToolRunResultsForMessage,
                activeIngredientHoverContent,
                setIngredientForHover,
            }}
        >
            {children}
        </APIClientContext.Provider>
    );
};
