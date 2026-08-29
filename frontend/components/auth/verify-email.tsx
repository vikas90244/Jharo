"use client";

import { useEffect, useRef } from "react";
import { useVerifyEmail } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface VerifyEmailProps {
  uid: string;
  token: string;
}

export default function VerifyEmail({
  uid,
  token,
}: VerifyEmailProps) {
  const verifyMutation = useVerifyEmail();
  const router= useRouter()
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    verifyMutation.mutate({
      uid,
      token,
    }, {
        onSuccess:()=>{
            router.push("/login")
        }
    });
  }, [uid, token]);

  if (verifyMutation.isPending) {
    return (
      <div className="w-full max-w-md">
        <p className="text-muted-foreground">
          Verifying your email...
        </p>
      </div>
    );
  }

  if (verifyMutation.isError) {
    return (
      <div className="w-full max-w-md space-y-3">
        <h2 className="text-xl font-semibold">
          Verification failed
        </h2>

        <p className="text-muted-foreground">
          {verifyMutation.error instanceof Error
            ? verifyMutation.error.message
            : "This verification link is invalid or expired."}
        </p>
      </div>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <div className="w-full max-w-md space-y-3">
        <h2 className="text-xl font-semibold">
          You are all set.
        </h2>

        <p className="text-muted-foreground">
          Your email has been verified successfully.
        </p>
      </div>
    );
  }

  return null;
}