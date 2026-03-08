import './globals.css'
import Sidebar from '../src/components/Sidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>

        <Sidebar />
        <main>
          {children}
        </main>
        
        <footer>© 2026 M-Verse</footer>
      </body>
    </html>
  )
}