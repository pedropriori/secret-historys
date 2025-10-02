import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "@/styles/embla.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secret Historys — Lectura sin límites",
  description: "Novelas, historias y capítulos en español. Romance, drama y machos alfa.",
  keywords: "novelas, historias, romance, drama, lectura online, libros gratis",
  authors: [{ name: "Secret Historys" }],
  openGraph: {
    title: "Secret Historys — Lectura sin límites",
    description: "Novelas, historias y capítulos en español",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}>
        {/* Header Principal */}
        <header className="sticky top-0 z-50 bg-white shadow-md">
          <div className="mx-auto max-w-7xl">
            {/* Top Bar - Logo e Busca */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-4">
              {/* Logo */}
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
                <img
                  src="/secret-logo-hori.png"
                  alt="Secret Historys"
                  className="h-8 w-auto sm:h-10 lg:h-12"
                />
              </Link>

              {/* Search - sempre visível */}
              <form action="/search" className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    placeholder="Buscar histórias..."
                    aria-label="Buscar"
                    className="h-9 sm:h-10 w-full rounded-full border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>

              {/* User Icon/Menu */}
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0" aria-label="Menu de usuário">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl">{children}</main>

        {/* Footer */}
        <footer className="mt-16 bg-gray-900 text-gray-300 py-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-white mb-3">Explorar</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/categoria" className="hover:text-white transition-colors">Categorias</Link></li>
                  <li><Link href="/ranking" className="hover:text-white transition-colors">Ranking</Link></li>
                  <li><Link href="/#hot" className="hover:text-white transition-colors">Tendência</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Sobre</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre nós</Link></li>
                  <li><Link href="/contato" className="hover:text-white transition-colors">Contato</Link></li>
                  <li><Link href="/vip" className="hover:text-white transition-colors">Seja VIP</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
                  <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Redes Sociais</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} Secret Historys. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
