import React from "react";
import { OutgoingSearchResult } from "../types/types";

interface TooltipCardProps {
    ingredientData: OutgoingSearchResult;
}

const TooltipCard: React.FC<
    TooltipCardProps & React.HTMLProps<HTMLDivElement>
> = ({ ingredientData, className, style }) => {
    const { displayName, ingredientName, portionSize, weightGrams, iconId } =
        ingredientData;
    const imgUrl = `https://storage.googleapis.com/passio-prod-env-public-cdn-data/label-icons/${iconId}-90.jpg`;

    return (
        <div
            className={`rounded-lg shadow-lg p-4 bg-white max-w-sm ${className}`}
            style={style}
        >
            <img
                src={imgUrl}
                alt="icon"
                className="w-16 h-16 mx-auto rounded-full"
            />
            <h3 className="text-center font-semibold my-2">{displayName}</h3>
            <div className="text-sm">
                <div className="my-1">
                    <strong>Ingredient:</strong> {ingredientName}
                </div>
                <div className="my-1">
                    <strong>Portion Size:</strong> {portionSize}
                </div>
                <div className="my-1">
                    <strong>Weight (grams):</strong> {weightGrams.toFixed(2)}
                </div>
                {/* Render additional details as needed */}
            </div>
        </div>
    );
};

export default TooltipCard;
