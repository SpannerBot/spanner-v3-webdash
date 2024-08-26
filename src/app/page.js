"use client";
import {useEffect, useState} from "react";
import Link from "next/link";

const API_URL = process.env.API_URL || "http://localhost:1237";


async function loadGuilds() {
  const response = await fetch(`${API_URL}/_discord/users/@me/guilds`, {credentials: "include"});
  if (!response.ok) {
      return {detail: response.statusText};
  }
  // Check which guilds we're in
  let data = await response .json();
  data.sort((g1, g2) => g1.name.localeCompare(g2.name));
  for(let guild of data) {
    const presenceResponse = await fetch(`${API_URL}/config/${guild.id}/presence`);
    guild.present = presenceResponse.ok;
  }
  // put present guilds first
  data.sort((g1, g2) => g2.present - g1.present);
  return data;
}


function UserGuildsArray() {
    const [guilds, setGuilds] = useState(null);

    useEffect(
        () => {
          if(!!guilds) return;
          loadGuilds().catch(console.error).then(setGuilds);
        }, [guilds]
    )
    if (!guilds ) {
        return <p>Loading guilds...</p>;
    }
    else if (guilds.detail) {
        return <p>Not logged in: {guilds.detail}</p>;
    }
    else {
        return (
          <div>
              <p>Your servers ({Object.keys(guilds).length}):</p>
              <ul>
                  {
                      guilds.map((guild) => {
                          if(guild.present) {
                            return (
                              <li>
                                <Link href={"./guilds/" + guild.id}><Avatar url={guild.icon_url}/> {guild.name}</Link>
                              </li>
                            )
                          }
                          return (
                            <li>
                              <a
                                href={`https://discord.com/oauth2/authorize?client_id=1237136674451099820&permissions=17180256320&integration_type=0&scope=bot&guild_id=${guild.id}`}
                              ><Avatar url={guild.icon_url}/> Add bot to {guild.name}</a>
                            </li>
                          )
                      })
                  }
              </ul>
          </div>
        )
    }
}

function Avatar({ url, id }) {
  const [src, setSrc] = useState(url);
  const onError = (e) => {
    console.error(e);
    const index = (id >> 22) % 6;
    setSrc(`https://cdn.discordapp.com/embed/avatars/${index}.png`);
  }
  return <img src={url} alt="avatar" style={{borderRadius:"50%",height:"32px",width:"32px",verticalAlign:"middle"}}/>;
}


function GetUserInfo() {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(
        () => {
          if(!!userInfo) return;
          fetch(`${API_URL}/_discord/users/@me`, {credentials: "include"})
            .then((response) => response.json())
            .then((data) => setUserInfo(data))
            .catch((error) => {setUserInfo({detail: error.message})})
        }, [userInfo]
    )
    if (userInfo === null) {
        return <p>Loading...</p>;
    }
    else if (userInfo.detail) {
        return <a href={`${API_URL}/oauth2/login?return_to=${location}`}>Login</a>;
    }
    else {
        return (
          <div>
            <p>Logged in as: <Avatar url={userInfo.avatar_url}/> {userInfo.username}</p>
            <UserGuildsArray />
          </div>
        )
    }
}


export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <GetUserInfo />
    </div>
  );
}
