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
import DefaultLoader from "./DefaultLoader";
import Image from "next/image";
import { useTranslations } from "@/app/hooks/useTranslations";
import { useLanguage } from "@/app/contexts/LanguageContext";

const steps = [
  { title: "mealType", icon: "/meal-type.png", component: MealTypeStep },
  { title: "partySize", icon: "/party-size.png", component: PartySizeStep },
  { title: "date", icon: "/date.png", component: DateStep },
  { title: "details", icon: "/details.png", component: CustomerDetailsStep },
];

export default function ReservationForm() {
  const t = useTranslations();
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStepClick = (index: number) => {
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

    if (currentStep === steps.length - 1) {
      setIsLoading(true);
      try {
        const response = await axios.post("/api/make-reservation", {
          mealType,
          adults,
          children,
          date,
          customerDetails,
          tableData,
        });
        window.location.href = response.data.paymentUrl;
      } catch (error: any) {
        let errorMsg = error.response?.data?.error || "An error occurred";
        toast({
          variant: "destructive",
          title: "Reservation Failed",
          description: errorMsg,
          duration: 1500,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAvailability = async () => {
    try {
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
        toast({
          variant: "destructive",
          title: `Uh oh! ${response.data.data.message}.`,
          description: `No table available on : ${formattedDate}`,
          duration: 1000,
        });
        setIsTableAvailable(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Uh oh! ${error.response.data.message}.`,
        // description: `No table available on : ${formattedDate}`,
        duration: 3000,
      });
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
    <div className="max-w-4xl mx-auto mt-4 sm:mt-10 p-4 sm:p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center text-gray-800">
        {t("tableReservation")}
      </h1>
      <div className="mb-4 sm:mb-8">
        <ol className="flex flex-wrap sm:flex-nowrap items-center w-full p-2 sm:p-3 space-x-1 sm:space-x-2 justify-between text-xs sm:text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={cn(
                "flex items-center cursor-pointer mb-2 sm:mb-0",
                index <= currentStep ? "text-[#eab24f]" : "text-gray-500"
              )}
              onClick={() => handleStepClick(index)}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 mr-1 sm:mr-2 rounded-full text-xs shrink-0",
                  index < currentStep
                    ? "border-[#eab24f] bg-[#eab24f] text-white"
                    : "border-gray-500"
                )}
              >
                {index < currentStep ? (
                  "✓"
                ) : (
                  <Image
                    src={step.icon}
                    alt={step.icon}
                    width="32"
                    height="32"
                    className="w-4 h-4 sm:w-6 sm:h-6"
                  />
                )}
              </span>
              <span className="hidden sm:inline">{t(step.title)}</span>
              {index < steps.length - 1 && (
                <svg
                  aria-hidden="true"
                  className="w-3 h-3 ml-1 sm:w-4 sm:h-4 sm:ml-2"
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
        <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
            >
              {t("previous")}
            </Button>
          ) : (
            <div className="hidden sm:block"></div>
          )}
          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {currentStep === 2 && (
              <Button
                type="button"
                onClick={handleAvailability}
                className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              >
                {t("checkAvailability")}{" "}
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
                className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              >
                {t("next")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              >
                {t("submitReservation")}
                {/* Submit Reservation */}
              </Button>
            )}
          </div>
        </div>
      </form>
      {isLoading && <DefaultLoader />}
    </div>
  );
}
