export default function ChargeButton({ customerId, paymentMethodId }: any) {
  const handleCharge = async () => {
    const response = await fetch("/api/charge-customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        paymentMethodId,
        amount: 5000, // Amount in cents (e.g., $50.00)
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Payment successful!");
    } else {
      alert(`Payment failed: ${data.error}`);
    }
  };

  return <button onClick={handleCharge}>Charge Customer</button>;
}
