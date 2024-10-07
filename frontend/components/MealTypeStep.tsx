"use client";

import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import axios from "axios";
import Loader from "./Loader";
import { Clock } from "lucide-react";
import { useTranslations } from "@/app/hooks/useTranslations";

interface MealTypeStepProps {
  mealType: number | null;
  setMealType: (value: number) => void;
}

export default function MealTypeStep({
  mealType,
  setMealType,
}: MealTypeStepProps) {
  const t = useTranslations();
  const [mealOptions, setMealOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getMealSlots = async () => {
    try {
      const response = await axios.get("/api/meal_slot_time");
      setMealOptions(response.data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getMealSlots();
  }, []);

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
    <div className="space-y-4 sm:space-y-6 h-full sm:h-[400px] overflow-y-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
        {t("mealType")}
      </h2>

      {loading ? (
        <Loader
          size={40}
          color="text-[#eab24f]"
          text={t("loadingMealOptions")}
        />
      ) : (
        <RadioGroup
          value={mealType !== null ? String(mealType) : ""}
          onValueChange={(value) => setMealType(Number(value))}
          className="space-y-2 sm:space-y-4"
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
                  "flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out",
                  "bg-white border-2 border-gray-200 shadow-sm",
                  "hover:bg-yellow-50 hover:border-yellow-300",
                  mealType === option.id
                    ? "bg-yellow-50 border-[#eab24f] text-[#eab24f]"
                    : "bg-white border-gray-200 text-gray-900"
                )}
              >
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <span className="text-lg sm:text-xl font-medium">
                    {t(option.slot_name)}
                  </span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
