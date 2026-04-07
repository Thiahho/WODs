"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-black text-orange-500">404</p>
      <h1 className="mt-3 text-xl font-bold text-zinc-100">Página no encontrada</h1>
      <p className="mt-2 text-sm text-zinc-400">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        href="/workout"
        className="mt-6 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        Ir al entrenamiento
      </Link>
    </main>
  );
}
