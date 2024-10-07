"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";
import { useTranslations } from "@/app/hooks/useTranslations";

interface CustomerDetailsStepProps {
  customerDetails: {
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    user_notes: string;
  };
  setCustomerDetails: (details: {
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    user_notes: string;
  }) => void;
}

export default function CustomerDetailsStep({
  customerDetails,
  setCustomerDetails,
}: CustomerDetailsStepProps) {
  const t = useTranslations();
  const details = customerDetails || {
    user_name: "",
    first_name: "",
    last_name: "",
    user_notes: "",
    email: "",
    phone: "",
  };

  return (
    <div className="space-y-4 sm:space-y-6 h-full sm:h-[500px] overflow-y-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
        {t("customerDetails")}
      </h2>
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="first_name"
            className="text-base sm:text-lg font-medium flex items-center space-x-2"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t("firstName")}</span>
          </Label>
          <Input
            id="first_name"
            value={details.first_name}
            onChange={(e) =>
              setCustomerDetails({ ...details, first_name: e.target.value })
            }
            required
            className="text-base sm:text-lg p-2 sm:p-3"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="last_name"
            className="text-base sm:text-lg font-medium flex items-center space-x-2"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t("lastName")}</span>
          </Label>
          <Input
            id="last_name"
            value={details.last_name}
            onChange={(e) =>
              setCustomerDetails({ ...details, last_name: e.target.value })
            }
            required
            className="text-base sm:text-lg p-2 sm:p-3"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-base sm:text-lg font-medium flex items-center space-x-2"
          >
            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t("email")}</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={details.email}
            onChange={(e) =>
              setCustomerDetails({ ...details, email: e.target.value })
            }
            required
            className="text-base sm:text-lg p-2 sm:p-3"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-base sm:text-lg font-medium flex items-center space-x-2"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t("phone")}</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={details.phone}
            onChange={(e) =>
              setCustomerDetails({ ...details, phone: e.target.value })
            }
            required
            className="text-base sm:text-lg p-2 sm:p-3"
          />
        </div>
      </div>
    </div>
  );
}