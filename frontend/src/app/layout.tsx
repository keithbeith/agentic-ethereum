import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footerdemo } from "@/components/ui/footer-section";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Home, LayoutGrid } from "lucide-react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Decentalised Species Assessment Mapper",
    description:
        "A Decentralised AI Robotic Agent that maps out invasive species and uploads data to the blockchain to avoid censorship.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const navItems = [
        {
            name: "Home",
            link: "/",
            icon: <Home className="h-4 w-4 text-primary" />,
        },
        {
            name: "Dashboard",
            link: "/dashboard",
            icon: <LayoutGrid className="h-4 w-4 text-primary" />,
        },
    ];
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <FloatingNav navItems={navItems} />
                {children}
                <Footerdemo />
            </body>
        </html>
    );
}
