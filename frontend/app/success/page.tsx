"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Home, AlertTriangle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session_id");

    if (session_id) {
      console.log("Fetching session data for ID:", session_id);
      fetch(`/api/get-session?session_id=${session_id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Session data received:", data);
          setSessionData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching session data:", err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      console.error("No session ID provided in URL");
      setError("No session ID provided");
      setLoading(false);
    }
  }, []);

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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-600 mb-4">
            There was an issue processing your payment or retrieving the session
            data. Please contact support if this persists.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
          >
            Return to Homepage
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
          Your Reservation was Successful!
        </h1>
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Success</p>
          <p>Your payment was processed successfully.</p>
        </div>
        {sessionData && (
          <div className="space-y-3 mb-6">
            <p className="text-gray-700 break-words">
              <span className="font-semibold">Session ID:</span>
              <span className="text-sm" title={sessionData.id}>
                {truncateSessionId(sessionData.id)}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Payment Status:</span>{" "}
              {sessionData.payment_status}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Amount Total:</span>{" "}
              {sessionData.amount_total / 100}{" "}
              {sessionData.currency.toUpperCase()}
            </p>
            <p className="text-gray-700 break-words">
              <span className="font-semibold">Customer Email:</span>
              <span className="text-sm">{sessionData.customer_email}</span>
            </p>
          </div>
        )}
        <p className="text-center text-gray-600 text-sm mb-6">
          If you need assistance, please contact our support team.
        </p>
        {/* <button
          onClick={() => router.push("/")}
          className="w-full bg-blue-500 hover:bg-[#eab24f] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out flex items-center justify-center"
        >
          <Home className="mr-2" />
          Return to Homepage
        </button> */}
      </div>
    </div>
  );
}
