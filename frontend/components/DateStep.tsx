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

interface DateStepProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
}

export default function DateStep({
  selectedDate,
  onDateSelect,
}: DateStepProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const bookedSlots = [
    { date: new Date(2024, 9, 10), time: "12:00 PM" },
    { date: new Date(2024, 9, 15), time: "7:00 PM" },
    { date: new Date(2024, 9, 18), time: "1:00 PM" },
    { date: new Date(2024, 9, 22), time: "6:30 PM" },
    { date: new Date(2024, 9, 25), time: "8:00 PM" },
    { date: new Date(2024, 8, 25), time: "8:00 PM" },
  ];

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
    if (
      !isBefore(date, startOfDay(new Date())) ||
      bookedSlots.some((slot) => isSameDay(date, slot.date))
    ) {
      onDateSelect(date);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
        Select Date
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
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-500 text-xs sm:text-sm"
            >
              {day}
            </div>
          ))}
          {dates.map((date, i) => {
            const isBooked = bookedSlots.some((slot) =>
              isSameDay(date, slot.date)
            );
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
                    !isBooked &&
                    "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100",
                  !isCurrentMonth && "text-gray-500"
                )}
                onClick={(e) => handleDateClick(e, date)}
                disabled={isPast && !isBooked}
                type="button"
              >
                <span className="text-xs sm:text-sm">
                  {format(date, "EEE")}
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
