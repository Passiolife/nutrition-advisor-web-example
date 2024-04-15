export interface Message {
    id: string;
    type: "advisor-message" | "user-message" | "system-message";
    content: string;
}

export interface IngredientHoverContent {
    xpos: number;
    ypos: number;
    item: OutgoingSearchResult;
}

export type ToolFunctionDefinition = {
    name: string;
    displayName: string;
    type: "advisor-message" | "user-initiated";
    description: string;
};

export type ToolRunResult = {
    messageId: string;
    toolName: string;
    toolDisplayName: string;
    content: any;
};

export interface AdvisorResponse {
    threadId: string;
    messageId: string;
    content: string;
    dataRequest?: AdvisorDataRequest;
    actionResponse?: AdvisorActionResponse;
    usage?: AdvisorResponseUsage;
}

export interface AdvisorResponseUsage {
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export interface AdvisorDataRequest {
    Name: string;
    RunID: string;
    ToolCallID: string;
    RespondParameters: string;
}

export interface AdvisorActionResponse {
    messageId: string;
    action: string;
    data: string;
}

export interface UserProfileData {
    name: string;
    age: number;
    weight: number;
    height: number;
    dietInfo: string;
    healthInfo: string;
    mealLogs: string;
}

export interface OutgoingSearchResult {
    // extract fields
    ingredientName: string;
    portionSize: string;
    weightGrams: number;
    //

    type: string;
    displayName: string;
    stemmedDisplayName: string;
    shortName: string;
    longName: string;
    scoredName: string;
    score: number;
    displayNameScore: number;
    brandName: string;
    iconId: string;
    labelId: string;
    synonymId: string;
    recipeId: string;
    referenceId: string;
    resultId: string;
    popularity?: number;
    maxPopularity?: number;
    normalizedPopularity?: number;
    rawStringScore?: number;
    relevance?: number;
    portionWeightUnit?: string;
    portionWeightValue?: number;
    portionName?: string;
    portionQuantity?: number;
    suggestedPortionQuantity?: number[];
    calories?: number;
    carbs?: number;
    fat?: number;
    protein?: number;
    externalId?: string;
}
