"use client";
import { Inter } from "next/font/google";
import "./globals.css";

import Nav from "./components/nav";
import Footer from "./components/footer";
import GuildSideBar from "./components/guildSideBar";

// const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Spanner v3 - Web Dashboard</title>
      </head>
      <body>
        <Nav/>
        <div className={"main-content"}>
          <GuildSideBar/>
          {children}
        </div>
        <Footer/>
      </body>
    </html>
  );
}
