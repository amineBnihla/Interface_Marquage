import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Marquage',
  description: 'Marquage packone',
  generator: 'Agridata',
}

export default  function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

    

  return (
    <html lang="en">
      <body>{children}

         <Toaster richColors />
      </body>
     
    </html>
  )
}
