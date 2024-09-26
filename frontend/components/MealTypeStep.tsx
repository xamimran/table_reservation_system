import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface MealTypeStepProps {
  mealType: number | null; // Updated to store the meal type ID (number)
  setMealType: (value: number) => void; // Updated to accept the meal type ID (number)
}

export default function MealTypeStep({
  mealType,
  setMealType,
}: MealTypeStepProps) {
  const mealOptions = [
    {
      value: "lunch",
      label: "Lunch",
      time: "11:00 AM - 3:00 PM",
      icon: "🍽️",
      id: 1, // Store the ID here
    },
    {
      value: "dinner",
      label: "Dinner",
      time: "5:00 PM - 10:00 PM",
      icon: "🌙",
      id: 2, // Store the ID here
    },
  ];

  return (
    <div className="space-y-6 h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Select Meal Type</h2>
      <RadioGroup
        value={mealType !== null ? String(mealType) : ""} // Convert the ID to a string
        onValueChange={(value) => setMealType(Number(value))} // Store the ID as a number
        className="space-y-4"
      >
        {mealOptions.map((option) => (
          <div key={option.id}>
            <RadioGroupItem
              value={String(option.id)} // Use the ID as the value
              id={String(option.id)}
              className="peer sr-only"
            />
            <Label
              htmlFor={String(option.id)}
              className={cn(
                "flex items-center justify-between w-full p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out",
                "bg-white border-2 border-gray-200 shadow-sm",
                "hover:bg-yellow-50 hover:border-yellow-300",
                mealType === option.id
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "bg-white border-gray-200 text-gray-900"
              )}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="text-lg font-medium">{option.label}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{option.time}</span>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
