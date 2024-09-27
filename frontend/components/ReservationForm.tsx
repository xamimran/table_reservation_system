"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MealTypeStep from "./MealTypeStep";
import PartySizeStep from "./PartySizeStep";
import DateStep from "./DateStep";
import CustomerDetailsStep from "./CustomerDetailsStep";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { title: "Meal Type", icon: "🍽️", component: MealTypeStep },
  { title: "Party Size", icon: "👥", component: PartySizeStep },
  { title: "Date", icon: "📅", component: DateStep },
  { title: "Details", icon: "📝", component: CustomerDetailsStep },
];

export default function ReservationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [mealType, setMealType] = useState<any>(null);
  const [adults, setAdults] = useState<string>("2");
  const [children, setChildren] = useState<string>("0");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isTableAvailable, setIsTableAvailable] = useState(false);
  const [tableData, setTableData] = useState();
  const [customerDetails, setCustomerDetails] = useState({
    user_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    user_notes: "",
  });
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const { toast } = useToast();

  const handleStepClick = (index: number) => {
    console.log("----", {
      mealType,
      adults,
      children,
      date,
      customerDetails,
      tableData,
    });
    if (index < currentStep) {
      setCurrentStep(index);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if we are on the last step
    if (currentStep === steps.length - 1) {
      console.log("Submitting reservation", customerDetails);

      try {
        const response = await axios.post("/api/make-reservation", {
          mealType,
          adults,
          children,
          date,
          customerDetails,
          tableData,
        });
        console.log("response", response);
        window.location.href = response.data.sessionUrl;
      } catch (error) {
        console.log("Error submitting form", error);
      }
    }
  };

  const handleAvailability = async () => {
    const response = await axios.post("/api/get-table", {
      selectedDate: date,
      mealType: mealType,
      adults: adults,
      children: children,
    });
    const newdate = date ? new Date(date) : new Date();
    const formattedDate = newdate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (response.data.data.available_table) {
      setTableData(response.data.data.available_table);
      const tableNumber = response.data.data.available_table;

      toast({
        title: `Table No. ${tableNumber} is Available`,
        description: `Scheduled on ${formattedDate}.`,
        duration: 1000,
      });

      setIsTableAvailable(true);
    } else {
      console.log(response.data.data);
      toast({
        variant: "destructive",
        title: `Uh oh! ${response.data.data.message}.`,
        description: `No table available on : ${formattedDate}`,
        duration: 1000,
      });
      setIsTableAvailable(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <MealTypeStep mealType={mealType} setMealType={setMealType} />;
      case 1:
        return (
          <PartySizeStep
            adults={adults}
            setAdults={setAdults}
            children={children}
            setChildren={setChildren}
          />
        );
      case 2:
        return (
          <DateStep
            selectedDate={date}
            onDateSelect={(date) => {
              setIsTableAvailable(false);
              setAvailabilityChecked(false);
              setDate(date);
            }}
          />
        );
      case 3:
        return (
          <CustomerDetailsStep
            customerDetails={customerDetails}
            setCustomerDetails={setCustomerDetails}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Table Reservation
      </h1>
      <div className="mb-8">
        <ol className="flex items-center w-full p-3 space-x-2 justify-between text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700 sm:p-4 sm:space-x-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={cn(
                "flex items-center cursor-pointer",
                index <= currentStep ? "text-blue-600" : "text-gray-500"
              )}
              onClick={() => handleStepClick(index)}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 mr-2 text-xs border rounded-full shrink-0",
                  index < currentStep
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-500"
                )}
              >
                {index < currentStep ? "✓" : step.icon}
              </span>
              {step.title}
              {index < steps.length - 1 && (
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 ml-2 sm:ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  ></path>
                </svg>
              )}
            </li>
          ))}
        </ol>
      </div>
      <form>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="text-lg px-6 py-3"
            >
              Previous
            </Button>
          )}
          <div className="flex justify-end space-x-4">
            {currentStep === 2 && (
              <Button
                type="button"
                onClick={handleAvailability}
                className="text-lg px-6 py-3"
              >
                Check Availability
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !mealType) ||
                  (currentStep === 2 &&
                    !isTableAvailable &&
                    !availabilityChecked)
                }
                className="text-lg px-6 py-3"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="text-lg px-6 py-3"
              >
                Submit Reservation
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
