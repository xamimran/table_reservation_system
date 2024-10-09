"use client";
import ReservationForm from "@/components/ReservationForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { PUBLISH_KEY } from "./constantVariable/constant";
import { LanguageProvider } from "./contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
const stripePromise = loadStripe(PUBLISH_KEY);
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LanguageProvider>
          <div className="fixed top-4 right-4 z-50">
            <LanguageSwitcher />
          </div>
          <div className="flex justify-center mb-4">
            <Image
              src="/client-logo.png"
              width={300}
              height={250}
              alt="Restaurant Logo"
            />
          </div>
          <Elements stripe={stripePromise}>
            <ReservationForm />
          </Elements>
        </LanguageProvider>
      </main>
    </div>
  );
}
