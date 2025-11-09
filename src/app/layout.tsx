import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Toaster as SonnerToaster } from "sonner"
import { CartProvider } from "@/contexts/CartContext"
import CartSheet from "@/components/customer/CartSheet"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cafe Ordering System",
  description: "Multi-tenant cafe ordering platform with customizable menus and order management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            {children}
            <CartSheet />
            <SonnerToaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}