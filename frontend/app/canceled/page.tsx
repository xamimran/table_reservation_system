// components/FailedPage.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Home, RefreshCw } from 'lucide-react';

export default function FailedPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const session_id = params.get('session_id');

  //   if (session_id) {
  //     fetch(`/api/get-session?session_id=${session_id}`)
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error('Failed to fetch session data');
  //         }
  //         return response.json();
  //       })
  //       .then((data) => {
  //         console.log("data----------------",data);
  //         setSessionData(data);
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         setError(err.message);
  //         setLoading(false);
  //       });
  //   }
  // }, []);

  const truncateSessionId = (id: string) => {
    if (id.length > 20) {
      return `${id.substring(0, 10)}...${id.substring(id.length - 10)}`;
    }
    return id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-400 to-pink-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full m-4">
        <div className="flex justify-center mb-6">
          <XCircle className="text-red-500 w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Payment Failed</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>There was an issue processing your payment.</p>
        </div>
        {sessionData && (
          <div className="space-y-3 mb-6">
            <p className="text-gray-700 break-words">
              <span className="font-semibold">Session ID:</span> 
              <span className="text-sm" title={sessionData.id}>{truncateSessionId(sessionData.id)}</span>
            </p>
            <p className="text-gray-700"><span className="font-semibold">Payment Status:</span> {sessionData.payment_status}</p>
          </div>
        )}
        <p className="text-center text-gray-600 text-sm mb-6">
          If you need assistance or would like to try again, please contact our support team.
        </p>
        <div className="space-y-4">
          {/* <button
  onClick={() => router.back()}
  className="w-full bg-blue-500 hover:bg-[#eab24f] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out flex items-center justify-center"
          >
            <RefreshCw className="mr-2" />
            Try Again
          </button> */}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out flex items-center justify-center"
          >
            <Home className="mr-2" />
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}