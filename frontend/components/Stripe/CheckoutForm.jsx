import React, { useEffect, useRef, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AppleIcon, CreditCard } from "lucide-react";

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

export default function CheckoutForm({ onSuccess,clientSecret,customerId ,customerDetails}) {
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
      {/* <button className="w-full bg-gray-500 text-white hover:bg-gray-800 mb-4 flex justify-center items-center p-2 rounded-md">
        <AppleIcon className="mr-2 h-4 w-4 text-white" />
        Pay
      </button>

      <div className="text-center text-sm text-gray-500 mb-4">
        Or pay with card
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
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
            Card information
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
            Cardholder name
          </label>
          <input
            id="cardholderName"
            placeholder="Full name on card"
            required
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
        </div>
{/* 
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="save-info"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={saveInfo}
            onChange={(e) => setSaveInfo(e.target.checked)}
          />
          <label
            htmlFor="save-info"
            className="text-sm font-medium text-gray-700"
          >
            Save my info for 1-click checkout with Link
          </label>
        </div> */}

        <p className="text-xs text-gray-500">
          Securely pay on Powdur and everywhere Link is accepted.
        </p>

        {/* <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CreditCard className="h-4 w-4" />
          <span>(800) 555-0175</span>
        </div> */}

        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
        )}

        <button
          type="submit"
          className="w-full bg-gray-500 text-white hover:bg-indigo-700 p-2 rounded-md"
          disabled={!stripe || isLoading}
        >
          {isLoading ? "Processing..." : "Pay"}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        Your payment information is securely processed by Stripe. We do not
        store your card details.
      </p>
    </div>
  );
}
