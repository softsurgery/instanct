import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Layout } from "@/components/layout/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return <h1>Home</h1>;
}
