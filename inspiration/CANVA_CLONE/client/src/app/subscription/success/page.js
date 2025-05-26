"use client";

import { capturePaypalOrder } from "@/services/subscription-service";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function SubscriptionSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const orderId = searchParams.get("token");

    const processPayment = async () => {
      try {
        const response = await capturePaypalOrder(orderId);

        if (response.success) {
          router.push("/");
        }
      } catch (e) {
        setStatus("error");
      }
    };

    processPayment();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        {status === "processing" && (
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="text-muted-foreground mb-4">
              Please wait while we confirm your payment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionSuccess;
