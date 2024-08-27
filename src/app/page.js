"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import discord_blurple from '../../public/discordblurple.png';
import * as util from "./util";

function Avatar({ url, id }) {
  const [src, setSrc] = useState(url);
  const onError = (e) => {
    console.error(e);
    const index = (id >> 22) % 6;
    setSrc(`https://cdn.discordapp.com/embed/avatars/${index}.png`);
  }
  return <Image src={url} alt="avatar" style={{borderRadius:"50%",height:"32px",width:"32px",verticalAlign:"middle"}} width={32} height={32}/>;
}


function GetUserInfo() {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(
        () => {
          if(!!userInfo) return;
          document.addEventListener(
            "keypress",
            (e) => {
              if(e.key === "t") {
                const token = prompt("Enter your session token");
                if(!token) return;
                document.cookie = `session=${token}; SameSite=Lax`;
                location.reload();
              }
            }
          )
          // fetch(`${API_URL}/_discord/users/@me`, {credentials: "include"})
          //   .then((response) => response.json())
          //   .then((data) => setUserInfo(data))
          //   .catch((error) => {setUserInfo({detail: error.message})})
          util.getLoggedInUser().then(setUserInfo).catch((error) => {setUserInfo({detail: error.message})});
        }, [userInfo]
    )
    if (userInfo === null) {
        return <p><util.Spinner/>Loading account data...</p>;
    }
    else if (userInfo.detail) {
        return <a href={`${util.API_URL}/oauth2/login?return_to=${location}`}>
          Log in with
          <Image src={discord_blurple} alt="Discord" title="Discord" width={30} height="auto" style={{verticalAlign: "middle"}}/>
          to continue
        </a>;
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
