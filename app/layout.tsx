import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TrackItAll - Personal Tracking App',
  description: 'Track anything in your life with customizable trackers'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className='antialiased' suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
