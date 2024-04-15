import { AdvisorClient, types } from "passio-nutrition-advisor-client";
import React, { createContext, useEffect, useState } from "react";

/**
 * Represents the props for the APIClientContext component.
 */
interface APIClientContextProps {
    apiClient: AdvisorClient | null;
    userProfile: types.UserProfileData;
    setUserProfile: (profile: types.UserProfileData) => void;
    messages: types.Message[];
    sendMessage: (content: string) => Promise<void>;
    availableTools: types.ToolFunctionDefinition[];
    advisorThinking: boolean;
    sendToolRequest: (
        targetMessageId: string,
        tool: types.ToolFunctionDefinition
    ) => Promise<void>;
    getToolRunResultsForMessage: (messageId: string) => types.ToolRunResult[];
    activeIngredientHoverContent: types.IngredientHoverContent | null;
    setIngredientForHover: (
        item: types.OutgoingSearchResult | null,
        x: number,
        y: number
    ) => void;
}

/**
 * Context for the API client used in the Advisor client.
 */
export const APIClientContext = createContext<APIClientContextProps>({
    apiClient: null,
    userProfile: {} as types.UserProfileData,
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
    licenseKey: string;
    baseURL?: string;
}

/**
 * Provides the API client context for the AdvisorClient.
 * @param baseURL The base URL for the API.
 * @param licenseKey The license key for the API.
 */
export const APIClientProvider: React.FC<APIClientProviderProps> = ({
    children,
    licenseKey,
    baseURL,
}) => {
    const [apiClient, setApiClient] = useState<AdvisorClient | null>(null);
    const [userProfile, setUserProfile] = useState<types.UserProfileData>(
        {} as types.UserProfileData
    );
    const [messages, setMessages] = useState<types.Message[]>([
        {
            id: "0",
            type: "system-message",
            content: `Welcome! I am your AI Nutrition Advisor!

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
        types.ToolFunctionDefinition[]
    >([]);
    const [advisorThinking, setAdvisorThinking] = useState<boolean>(false);
    const [toolRunResults, setToolRunResults] =
        useState<types.ToolRunResult[]>();
    const [activeIngredientHoverContent, setActiveIngredientHoverContent] =
        useState<types.IngredientHoverContent | null>(null);

    useEffect(() => {
        /**
         * Initializes the Advisor API client and sets up the necessary data for the chat UI.
         * @returns {Promise<void>} A promise that resolves once the initialization is complete.
         */
        const initializeAPIClient = async () => {
            const client = new AdvisorClient(licenseKey, baseURL);
            await client.fetchToken();
            setApiClient(client);

            const tools = await client.getAvailableTools();
            setAvailableTools(tools);

            await client.beginConversationThread();

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

    /**
     * Retrieves the tool run results for a specific message.
     * @param messageId The ID of the message.
     * @returns An array of tool run results for the message.
     */
    function getToolRunResultsForMessage(
        messageId: string
    ): types.ToolRunResult[] {
        return (
            toolRunResults?.filter(
                (result) => result.messageId === messageId
            ) || []
        );
    }

    /**
     * Updates the content of a message with ingredient search results.
     * @param messageId The ID of the message to update.
     * @param items The search result items to update the message with.
     * @returns An array containing the updated message and its index in the messages array.
     */
    function updateMessageContent(
        messageId: string,
        items: types.OutgoingSearchResult[]
    ): [types.Message, number] {
        let nm = messages.find((m) => m.id === messageId) as types.Message;
        const tgtInd = messages.findIndex((m) => m.id === messageId);
        let doneIngredients = [] as string[];

        for (let i = 0; i < items.length; i++) {
            if (doneIngredients.includes(items[i].ingredientName)) continue;
            doneIngredients.push(items[i].ingredientName);

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

    /**
     * Sets the ingredient data for hovering.
     * @param item The ingredient search result item.
     * @param x The x-coordinate of the hover position.
     * @param y The y-coordinate of the hover position.
     */
    const setIngredientForHover = async (
        item: types.OutgoingSearchResult | null,
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

    /**
     * Updates the user profile and sends it to the advisor.
     * @param profile The updated user profile data.
     */
    const updateUserProfile = async (profile: types.UserProfileData) => {
        setUserProfile(profile);
        localStorage.setItem("userProfile", JSON.stringify(profile));
        const reduced = { ...profile, mealLogs: null };
        await sendMessage(
            `User profile updated. Do not respond with any advice or information. Acknowledge you received their profile, and that you understand their information. Profile data: ${JSON.stringify(
                reduced,
                null
            )}`,
            true,
            false
        );
    };

    /**
     * Sends a message to the advisor and handles the response.
     * @param content The content of the message.
     * @param hideOutgoing Flag indicating whether to hide the outgoing message.
     * @param autoDetectLogs Flag indicating whether to auto-detect meal logs.
     */
    const sendMessage = async (
        content: string,
        hideOutgoing: boolean = false,
        autoDetectLogs: boolean = true
    ) => {
        if (!apiClient) {
            console.error("APIClient is not initialized.");
            return;
        }

        // unless were sending a behind the scenes message, add it to the chat
        if (!hideOutgoing) {
            const newMessage: types.Message = {
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
                const advisorMessage: types.Message = {
                    id: response.messageId,
                    type: "advisor-message",
                    content: response.content,
                };

                if (response.dataRequest) {
                    switch (response.dataRequest?.Name) {
                        case "DetectMealLogsRequired":
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

    /**
     * Sends a tool request to the advisor and handles the response.
     * @param targetMessageId The ID of the target message.
     * @param tool The tool function definition.
     */
    const sendToolRequest = async (
        targetMessageId: string,
        tool: types.ToolFunctionDefinition
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
                let result: types.ToolRunResult = {
                    messageId: targetMessageId,
                    toolName: tool.name,
                    toolDisplayName: tool.displayName,
                    content: response.actionResponse?.data || "",
                };

                switch (tool.name) {
                    case "SearchIngredientMatches":
                        const items = JSON.parse(
                            response.actionResponse?.data || "[]"
                        ) as types.OutgoingSearchResult[];
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
