import { Noto_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const notoSansThai = Noto_Sans_Thai({ subsets: ["thai", "latin"], variable: "--font-noto-sans-thai", display: "swap", preload: true });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: true });

export const metadata = {
  title: "PathFinder",
  description: "ค้นหาเส้นทางการเรียนที่เหมาะกับคุณด้วย AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="dns-prefetch" href="https://path-finder-96701.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
      </head>
      <body className={`${notoSansThai.variable} ${inter.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
