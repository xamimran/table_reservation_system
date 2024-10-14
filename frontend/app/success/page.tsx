"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Home, AlertTriangle } from "lucide-react";
import { useTranslations } from "../hooks/useTranslations";

export default function SuccessPage() {
  const t = useTranslations(); // Initialize the translation hook
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const truncateSessionId = (id: string) => {
    if (id.length > 20) {
      return `${id.substring(0, 10)}...${id.substring(id.length - 10)}`;
    }
    return id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="text-yellow-500 w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {t("error_title")}
          </h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-600 mb-4">{t("error_message")}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
          >
            {t("return_home")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full m-4">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {t("reservation_successful")}
        </h1>
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">{t("payment_success")}</p>
        </div>
        {sessionData && (
          <div className="space-y-3 mb-6">
            <p className="text-gray-700">
              <span className="font-semibold">{t("payment_status")}</span>{" "}
              {sessionData?.payment_status}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">{t("amount_total")}</span>{" "}
              {sessionData?.amount_total / 100}{" "}
              {sessionData?.currency.toUpperCase()}
            </p>
            <p className="text-gray-700 break-words">
              <span className="font-semibold">{t("customer_email")}</span>{" "}
              <span className="text-sm">{sessionData?.customer_email}</span>
            </p>
          </div>
        )}
        <p className="text-center text-gray-600 text-sm mb-6">
          {t("contact_support")}
        </p>
      </div>
    </div>
  );
}
