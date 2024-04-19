import { types } from "passio-nutrition-advisor-client";
import React from "react";

interface TooltipCardProps {
    ingredientData: types.OutgoingSearchResult;
}

const TooltipCard: React.FC<
    TooltipCardProps & React.HTMLProps<HTMLDivElement>
> = ({ ingredientData, className, style }) => {
    const {
        displayName,
        ingredientName,
        portionSize,
        weightGrams,
        iconId,
        nutritionPreview,
    } = ingredientData;
    const imgUrl = `https://storage.googleapis.com/passio-prod-env-public-cdn-data/label-icons/${iconId}-90.jpg`;

    return (
        <div
            className={`rounded-lg shadow-lg p-4 bg-white max-w-sm text-center items-center justify-center ${className}`}
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
                    <strong>Ingredient:</strong> {ingredientName}{" "}
                    {" " + weightGrams.toFixed()}g
                </div>

                <div className="my-1">
                    <strong>Portion Size:</strong> {portionSize}
                </div>
                <div className="my-1">
                    <strong>Calories:</strong>{" "}
                    {`${(
                        (nutritionPreview.calories /
                            nutritionPreview.portion.weight.value) *
                        weightGrams
                    ).toFixed(0)} kcal`}
                </div>
                <div className="my-1">
                    <strong>Carbs:</strong>{" "}
                    {`${(
                        (nutritionPreview.carbs /
                            nutritionPreview.portion.weight.value) *
                        weightGrams
                    ).toFixed()} g`}
                </div>
                <div className="my-1">
                    <strong>Protein:</strong>{" "}
                    {`${(
                        (nutritionPreview.protein /
                            nutritionPreview.portion.weight.value) *
                        weightGrams
                    ).toFixed()} g`}
                </div>
                <div className="my-1">
                    <strong>Fat:</strong>{" "}
                    {`${(
                        (nutritionPreview.fat /
                            nutritionPreview.portion.weight.value) *
                        weightGrams
                    ).toFixed()} g`}
                </div>
                <div className="pt-6 text-xs">
                    Use{" "}
                    <a
                        href="https://www.passio.ai/nutrition-ai#nutrition-api-pricing"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Nutrition API
                    </a>{" "}
                    to get full nutritional data
                </div>
            </div>
        </div>
    );
};

export default TooltipCard;
