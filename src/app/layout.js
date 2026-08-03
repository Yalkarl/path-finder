import { Noto_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const notoSansThai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-noto-sans-thai", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = {
  title: "PathFinder",
  description: "ค้นหาเส้นทางการเรียนที่เหมาะกับคุณด้วย AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://path-finder-96701.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://path-finder-96701.firebaseapp.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://apis.google.com" />
      </head>
      <body className={`${notoSansThai.variable} ${inter.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
