import type { Metadata } from "next";
import "./globals.css";
import MuiProvider from "./components/MuiProvider";

export const metadata: Metadata = {
  title: "Hartwell Primary School — Sustainable Travel System Prototype (Figma Multi-Viewport Canvas S1–S9 | 2-Member Equal Split)",
  description: "Hartwell Primary School Sustainable Travel System Prototype (S1–S9)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body data-theme="scheme-b">
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
