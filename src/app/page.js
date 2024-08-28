"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import discord_blurple from '../../public/discordblurple.png';
import * as util from "./util";
import {Avatar} from "./util";

function GetUserInfo() {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(
        () => {
          if(!!userInfo) return;
          util.withBackoff(util.getLoggedInUser, 3)
            .then(setUserInfo)
            .catch((error) => {setUserInfo({detail: error.message})});
        }, [userInfo]
    )
    if (userInfo === null) {
        return <p><util.Spinner/>Loading account data...</p>;
    }
    else if (userInfo.detail === "Not logged in") {
        return <a href={`${util.API_URL}/oauth2/login?return_to=${location}`}>
          Log in with
          <Image src={discord_blurple} alt="Discord" title="Discord" width={30} height="auto" style={{verticalAlign: "middle"}}/>
          to continue
        </a>;
    }
    else if (userInfo.detail) {
        return <p>Error checking login status: <code>{userInfo.detail}</code>. Try clearing your cookies.</p>;
    }
    else {
        return (
          <div>
            <p>Logged in as: <Avatar url={userInfo.avatar_url}/> {userInfo.username}</p>
            <p>Select a server from the sidebar to get started!</p>
          </div>
        )
    }
}


export default function Home() {
  return (
    <div style={{display: "flex", alignItems: "center", textAlign: "center", justifyContent: "center", flexDirection: "column", width: "100%"}}>
      <div>
        <h1>Spanner v3 Web Dashboard</h1>
        <div style={{border: "2px solid red", padding: "1em", margin: "1em", backgroundColor: "#ff000033", borderRadius: "12px"}}>
          <p>Neither this dashboard, nor the bot, are released yet.</p>
          <p>Everything you see here is pre-release software.</p>
          <p>You use this at your own risk.</p>
        </div>
        <GetUserInfo />
      </div>
    </div>
  );
}
