import React, { useEffect, useRef, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AppleIcon, CreditCard, Loader2 } from "lucide-react";
import { useTranslations } from "@/app/hooks/useTranslations";
import { PolicyModal } from "./PolicesModal";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
      padding: "10px 12px",
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

export default function CheckoutForm({
  onSuccess,
  clientSecret,
  customerId,
  customerDetails,
}) {
  const t = useTranslations();
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState(customerDetails?.email);
  const [cardholderName, setCardholderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!stripe || !elements || !clientSecret) {
      setIsLoading(false);
      setErrorMessage("Payment system is not ready. Please try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
            email: email,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      onSuccess(result.setupIntent.payment_method, customerId);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            {t("Email")}
          </label>
          <input
            id="email"
            type="email"
            placeholder={t("Email")}
            required
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="card-element"
            className="block text-sm font-medium text-gray-700"
          >
            {t("CardInfor")}
          </label>
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="cardholderName"
            className="block text-sm font-medium text-gray-700"
          >
            {t("CardholderName")}
          </label>
          <input
            id="cardholderName"
            placeholder={t("NamePlaceholder")}
            required
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
        </div>

        <p className="text-xs text-gray-500">
          {t("SecureText")}
          <PolicyModal />
        </p>

        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
        )}

        <button
          type="submit"
          className="w-full bg-gray-500 text-white hover:bg-indigo-700 p-2 rounded-md font-medium transition duration-150 ease-in-out flex justify-center items-center"
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              {t("Processing")}...
            </>
          ) : (
            <>{t("PaySecurely")}</>
          )}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">{t("PaymentInfo")}</p>
    </div>
  );
}
