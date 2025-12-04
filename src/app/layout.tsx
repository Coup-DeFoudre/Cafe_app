import type { Metadata } from "next"
import { Inter, Lora } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Toaster as SonnerToaster } from "sonner"
import { CartProvider } from "@/contexts/CartContext"
import CartSheet from "@/components/customer/CartSheet"
import { Suspense } from "react"
import { NavigationProgress } from "@/components/ui/navigation-progress"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })

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
      <body className={`${inter.variable} ${lora.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
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