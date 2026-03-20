import './globals.css'
import Sidebar from '../src/components/Sidebar'
import { AuthProvider } from '@/lib/AuthHandler';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Sidebar />
          <main>
            {children}
          </main>
        </AuthProvider>
        
        <footer className="footer">© 2026 M-Verse</footer>
      </body>
    </html>
  )
}