import Header from "@/components/Header/Header";
import ReservationForm from "@/components/ReservationForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* <Header /> */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReservationForm />
      </main>
    </div>
  );
}
