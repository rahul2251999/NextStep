import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "NextStep - AI-Powered Job Search",
  description: "Optimize your resume and land your dream job with AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased" style={{ minHeight: '100vh' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

