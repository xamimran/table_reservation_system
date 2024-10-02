import ReservationForm from "@/components/ReservationForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/black-logo.png"
            width={150}
            height={150}
            alt="Restaurant Logo"
            className="w-96 h-20 sm:w-96 sm:h-20 md:w-96 md:h-20"
          />
        </div>
        <ReservationForm />
      </main>
    </div>
  );
}
