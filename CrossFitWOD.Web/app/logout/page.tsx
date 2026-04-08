"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    removeToken();
    router.replace("/login");
  }, []);

  return null;
}
