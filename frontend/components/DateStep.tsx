"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isBefore,
  isSameMonth,
  startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/app/hooks/useTranslations";

interface DateStepProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
}

export default function DateStep({
  selectedDate,
  onDateSelect,
}: DateStepProps) {
  const t = useTranslations();
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(addMonths(currentDate, -1));
  };

  const startDate = startOfWeek(startOfMonth(currentDate));
  const endDate = endOfWeek(endOfMonth(currentDate));

  const dates = [];
  let day = startDate;

  while (day <= endDate) {
    dates.push(day);
    day = addDays(day, 1);
  }

  const handleDateClick = (e: React.MouseEvent, date: Date) => {
    e.preventDefault();
    if (!isBefore(date, startOfDay(new Date()))) {
      onDateSelect(date);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
        {t("selectDate")}
      </h2>
      <div className="bg-white rounded-lg shadow p-2 sm:p-4">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base sm:text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-500 text-xs sm:text-sm"
            >
              {t(day)}
            </div>
          ))}
          {dates.map((date, i) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isPast = isBefore(date, startOfDay(new Date()));
            const isCurrentMonth = isSameMonth(date, currentDate);
            return (
              <Button
                key={i}
                variant="outline"
                className={cn(
                  "h-12 sm:h-20 font-normal flex flex-col items-center justify-start p-1",
                  isSelected && "bg-yellow-100 text-[#eab24f] font-semibold",
                  isPast &&
                    "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100",
                  !isCurrentMonth && "text-gray-500"
                )}
                onClick={(e) => handleDateClick(e, date)}
                disabled={isPast}
                type="button"
              >
                <span className="text-xs sm:text-sm">
                  {t(format(date, "EEEE"))}
                </span>
                <span className="text-sm sm:text-lg font-semibold">
                  {format(date, "d")}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
