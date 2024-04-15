// AdvisorClient.tsx

import axios, { AxiosInstance } from "axios";
import { ToolFunctionDefinition, AdvisorResponse } from "../types/types";

class APIClient {
    private axiosInstance: AxiosInstance;
    private conversationId: string = "";

    constructor(private baseURL: string, private licenseKey: string) {
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
        });
    }

    public async fetchToken(): Promise<void> {
        const url = `/token-cache/nutrition-advisor/oauth/token/${this.licenseKey}`;
        const response = await this.axiosInstance.get(url);
        if (response.status !== 200) {
            throw new Error("Failed to fetch token");
        }
        this.setupAxiosDefaults(
            response.data.access_token,
            response.data.customer_id
        );
    }

    private setupAxiosDefaults(accessToken: string, customerId: string): void {
        this.axiosInstance.defaults.headers.common[
            "Authorization"
        ] = `Bearer ${accessToken}`;
        this.axiosInstance.defaults.headers.common["Passio-ID"] = customerId;
    }

    public async getAvailableTools(): Promise<ToolFunctionDefinition[]> {
        const url = "/products/nutrition-advisor/tools";
        const response = await this.axiosInstance.get(url);
        return response.data;
    }

    public async beginConversationThread(): Promise<string> {
        const url = "/products/nutrition-advisor/conversation";
        const response = await this.axiosInstance.post(url);
        if (response.status === 200) {
            this.conversationId = response.data.threadId;
            return this.conversationId;
        } else {
            throw new Error("Failed to start conversation thread");
        }
    }

    public async sendUserMessage(
        content: string,
        autoDetectLogs: boolean = true
    ): Promise<AdvisorResponse | null> {
        const url = `/products/nutrition-advisor/conversation/${this.conversationId}/message?autoDetectLogs=${autoDetectLogs}`;
        const response = await this.axiosInstance.post(
            url,
            JSON.stringify(content)
        );
        if (response.status === 200) {
            return response.data as AdvisorResponse;
        } else {
            throw new Error("Failed to send user message");
        }
    }

    public async handleDataRequest(
        ar: AdvisorResponse,
        responseData: string
    ): Promise<AdvisorResponse | null> {
        const url = `/products/nutrition-advisor/conversation/${this.conversationId}/message/${ar.messageId}/run/${ar.dataRequest?.RunID}/tool-call/${ar.dataRequest?.ToolCallID}`;
        const response = await this.axiosInstance.post(
            url,
            JSON.stringify(responseData)
        );
        if (response.status === 200) {
            return response.data as AdvisorResponse;
        } else {
            throw new Error("Failed to handle data request");
        }
    }

    public async sendToolRequest(
        messageId: string,
        action: string
    ): Promise<AdvisorResponse | null> {
        const url = `/products/nutrition-advisor/conversation/${this.conversationId}/message/${messageId}/${action}`;
        const response = await this.axiosInstance.post(url);
        if (response.status === 200) {
            return response.data as AdvisorResponse;
        } else {
            throw new Error("Failed to perform context menu action");
        }
    }
}

export default APIClient;
