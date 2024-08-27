"use client";
import { Inter } from "next/font/google";
import "./globals.css";

import Nav from "./components/nav";
import GuildSideBar from "./components/guildSideBar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav/>
        <div className={"main-content"}>
          <GuildSideBar/>
          {children}
        </div>
      </body>
    </html>
  );
}
