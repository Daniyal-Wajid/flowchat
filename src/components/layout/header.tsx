"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header({
  title,
  userEmail,
}: {
  title: string;
  userEmail?: string | null;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-4">
        {userEmail && <span className="text-sm text-slate-500">{userEmail}</span>}
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
