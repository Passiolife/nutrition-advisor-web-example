import React, { useState, useEffect, useContext } from "react";

import { UserProfileData } from "../types/types";
import { APIClientContext } from "../context/AdvisorClientContext";

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExampleProfileForm: React.FC<FormModalProps> = ({ isOpen, onClose }) => {
    const { userProfile, setUserProfile } = useContext(APIClientContext);
    const [formData, setFormData] = useState<UserProfileData>(userProfile);

    useEffect(() => {
        if (userProfile) {
            setFormData(userProfile);
        }
    }, [userProfile]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (JSON.stringify(formData) !== JSON.stringify(userProfile)) {
            setUserProfile(formData);
        }
        onClose();
    };

    if (!isOpen) {
        return null; // Don't render the modal if it's not open
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-6">User Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="age"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Age (1-100)
                            </label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                min="1"
                                max="100"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="weight"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Weight (lbs)
                            </label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="height"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                id="height"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="dietInfo"
                            className="block text-gray-700 font-bold mb-2"
                        >
                            Diet Information
                        </label>
                        <textarea
                            id="dietInfo"
                            name="dietInfo"
                            value={formData.dietInfo}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="healthInfo"
                            className="block text-gray-700 font-bold mb-2"
                        >
                            Health Information
                        </label>
                        <textarea
                            id="healthInfo"
                            name="healthInfo"
                            value={formData.healthInfo}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        ></textarea>
                    </div>
                    <div className="mb-6">
                        <label
                            htmlFor="mealLogs"
                            className="block text-gray-700 font-bold mb-2"
                        >
                            Meal Logs
                        </label>
                        <textarea
                            id="mealLogs"
                            name="mealLogs"
                            value={formData.mealLogs}
                            onChange={handleChange}
                            placeholder="Place information on your past meals in any format here to test the advisor's ability to pull your meal data"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        ></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded mr-2"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExampleProfileForm;
