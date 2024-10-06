"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Appbar({ fragment }: { fragment: React.ReactNode }) {
  const session = useSession();

  return (
    <div className="flex justify-between px-5 md:px-10 xl:px-20 py-4">
      <div className="text-lg font-bold flex flex-col justify-center text-white">
        Muse
      </div>
      <div className="flex gap-3 items-center">
        {session.data?.user && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Log Out
          </Button>
        )}
        {!session.data?.user && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Sign In
          </Button>
        )}
        {fragment && fragment}
      </div>
    </div>
  );
}
