import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import axios from "axios";
import Loader from "./Loader";
import { Clock } from "lucide-react";

interface MealTypeStepProps {
  mealType: number | null;
  setMealType: (value: number) => void;
}

export default function MealTypeStep({
  mealType,
  setMealType,
}: MealTypeStepProps) {
  const [mealOptions, setMealOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Set initial loading state to true

  const getMealSlots = async () => {
    try {
      const response = await axios.get("/api/meal_slot_time");
      setMealOptions(response.data.data);
      setLoading(false); // Stop loading after data is fetched
    } catch (error) {
      console.log(error);
      setLoading(false); // Stop loading even if there's an error
    }
  };

  useEffect(() => {
    getMealSlots();
  }, []);

  const getIconForMeal = (slotName: string) => {
    switch (slotName.toLowerCase()) {
      case "lunch":
        return "🍽️"; // Lunch icon
      case "dinner":
        return "🌙"; // Dinner icon
      default:
        return "🍴"; // Default icon
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6 h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Select Meal Type</h2>

      {/* Loader: Display the loader while fetching meal slots */}
      {loading ? (
        <Loader
          size={40}
          color="text-blue-600"
          text="Loading meal options..."
        />
      ) : (
        <RadioGroup
          value={mealType !== null ? String(mealType) : ""}
          onValueChange={(value) => setMealType(Number(value))}
          className="space-y-4"
        >
          {mealOptions.map((option) => (
            <div key={option.id}>
              <RadioGroupItem
                value={String(option.id)}
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
                  <span className="text-2xl">
                    {getIconForMeal(option.slot_name)}
                  </span>
                  <span className="text-lg font-medium">
                    {option.slot_name}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {formatTime(option.start_time)} -{" "}
                    {formatTime(option.end_time)}
                  </span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}
