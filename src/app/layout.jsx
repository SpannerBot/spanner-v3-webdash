"use client";
import "./globals.css";
import localFont from 'next/font/local'

import Nav from "./components/nav";
import Footer from "./components/footer";
import GuildSideBar from "./components/guildSideBar";

const ggSans = localFont({ src: './_gg_sans/gg_sans_Normal.woff2' });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={ggSans.className}>
      <head>
        <title>Spanner v3 - Web Dashboard</title>
      </head>
      <body className={ggSans.className}>
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
