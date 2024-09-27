// components/CheckoutButton.tsx

'use client'; // Make sure it's a client-side component

import { useState } from 'react';

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  const [customerDetails, setCustomerDetails] = useState({
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    user_notes: "Please prepare a table near the window.",
  });

  const adults = 2;
  const children = 1;
  const date = "2024-09-30";
  const tableID = "123";

  const handleCheckout = async () => {
    setLoading(true);

    const lineItems = [
      {
        price: 'price_1Q3GzBRszTyZf6hGEKptEpob', // Replace with actual price ID
        quantity: 1,
      },
    ];

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineItems,
          customerDetails,
          adults,
          children,
          date,
          tableID,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe checkout page
      window.location.href = data.sessionUrl;
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Loading...' : 'Checkout'}
    </button>
  );
}
