"use client";
import {useState, useEffect} from "react";
import Prism from 'prismjs';
import Link from "next/link";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-json";
import './style.css';

const API_URL = process.env.API_URL || "http://localhost:1237";


async function getGuildData(guild_id) {
  const response = await fetch(`${API_URL}/_discord/guilds/${guild_id}`, {credentials: "include"});
  if(!response.ok) {
    return {id: guild_id, name: guild_id, icon_url: `https://cdn.discordapp.com/embed/avatars/${(guild_id >> 22) % 6}.png`};
  }
  return await response.json();
}


function DiscordChannel({guild_id, channel_id}) {
  const [channelData, setChannelData] = useState(
    {
      id: channel_id,
      type: 0,
        name: "loading",
      user_permissions: "0",
      bot_permissions: "0",
      flags: 0
    }
  );
  const [loaded, setLoaded] = useState(false);

  const getChannelData = async () => {
    const response = await fetch(
      `${API_URL}/_discord/guilds/${guild_id}/channels`, {credentials: "include"}
    );
    setLoaded(true);
    if(!response.ok) {
      setChannelData(
          {
          id: channel_id,
          type: 0,
          name: "unknown-channel",
          user_permissions: "0",
          bot_permissions: "0",
          flags: 0
        }
      )
      return;
    }
    const _data = await response.json();
    console.debug(_data)
    console.debug("Trying to find c.id %s", channel_id);
    let channel;
    for(const c of _data) {
      console.debug(c)
      if(c.id === channel_id) {
        console.debug("HIT")
        channel = c;
        break;
      }
      console.debug("%s != %s", c.id, channel_id)
    }
    console.debug(channel)
    if(!channel) {
      return;
    }
    setChannelData(channel);
  }

  useEffect(
    () => {
      if(loaded) return;
      getChannelData().catch(console.error);
    },
    [channelData]
  )
  if(!channelData) {
    return <span>loading...</span>
  }
  return (
    <Link href={`https://discord.com/channels/${guild_id}/${channel_id}`} target={"_blank"}>
      {
        channelData.type === 0 ?
          <span>#</span>
          :
          null
      }
      <span>{channelData.name}</span>
    </Link>
  )
}

function LoggingFeaturesTable({features}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Enabled</th>
        </tr>
      </thead>
      <tbody>
        {
          features.map((feature) => {
            return (
              <tr key={feature.name}>
                <td>{feature.name}</td>
                <td>{feature.enabled ? "Yes" : "No"}</td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}


function AuditLogTable({logs}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Namespace</th>
          <th>Action</th>
          <th>Author ID</th>
          <th>Description</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {
          logs.map((log) => {
            const createdAtDT = new Date(log.created_at);
            return (
              <tr key={log.id}>
                <td>{log.namespace}</td>
                <td>{log.action}</td>
                <td><code>{log.author}</code  ></td>
                <td><pre>{log.description}</pre></td>
                <td title={createdAtDT.toISOString()}>{createdAtDT.toLocaleString()}</td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}

function InformationOverload({guild_id}) {
  const [guildData, setGuildData] = useState(null);
  const [logChannel, setLogChannel] = useState("729807102759010416");
  const [nickNameModerationConfig, setNickNameConfig] = useState(null);
  const [loggingFeatures, setLoggingFeatures] = useState([]);
  const [allLoggingFeatures, setAllLoggingFeatures] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGuildData = async () => {
    const dataResponse = await fetch(`${API_URL}/_discord/guilds/${guild_id}`, {credentials: "include"});
    if(!dataResponse.ok) {
      setGuildData(
        {
          id: guild_id,
          name: guild_id,
          icon_url: `https://cdn.discordapp.com/embed/avatars/${(guild_id >> 22) % 6}.png`,
        }
      )
    } else {
      const data = await dataResponse.json();
      setGuildData(data);
    }

    const nickNameResponse = await fetch(`${API_URL}/config/${guild_id}/nickname-moderation`, {credentials: "include"});
    if(nickNameResponse.status === 404) {
      setNickNameConfig(null);
    } else {
      const nickNameConfig = await nickNameResponse.json();
      setNickNameConfig(nickNameConfig);
    }

    const logChannelResponse = await fetch(`${API_URL}/config/${guild_id}/logging/channel`, {credentials: "include"});
    if(logChannelResponse.ok) {
      const logChannelData = await logChannelResponse.json();
      setLogChannel(logChannelData);
    }

    const allLoggingFeaturesResponse = await fetch(`${API_URL}/config/${guild_id}/logging/features/all`, {credentials: "include"});
    const allLoggingFeaturesData = await allLoggingFeaturesResponse.json();
    setAllLoggingFeatures(allLoggingFeaturesData);

    const loggingFeaturesResponse = await fetch(`${API_URL}/config/${guild_id}/logging/features/enabled`, {credentials: "include"});
    let loggingFeaturesData = await loggingFeaturesResponse.json();
    for(let feat of allLoggingFeaturesData) {
      if(!(feat in loggingFeaturesData)) {
        loggingFeaturesData[feat] = false;
      }
    }
    setLoggingFeatures(loggingFeaturesData);

    let offset = 0;
    let auditLogPages = [];
    while(true) {
      const auditLogResponse = await fetch(`${API_URL}/config/${guild_id}/audit-log?offset=${offset}`, {credentials: "include"});
      if(!auditLogResponse.ok) break;
      const auditLogData = await auditLogResponse.json();
      if(auditLogData.entries.length === 0) break;
      for (const entry of auditLogData.entries) {
        auditLogPages.push(entry);
        offset++;
      }
    }
    setAuditLog(auditLogPages);
  }

  useEffect(
    () => {
      Prism.highlightAll();
      if(!!guildData) return; // Don't fetch if we already have data
      setLoading(true);
      getGuildData().catch((e) => {console.error(e); setLoading(false)}).then(() => setLoading(false));
    }, [guildData, logChannel, nickNameModerationConfig, loggingFeatures, auditLog, loading]
  )

  if(loading) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h1>
        Guild {guildData?.name || guild_id} <img src={guildData?.icon_url} alt="guild icon" style={{
        borderRadius: "50%",
        height: "32px",
        width: "32px",
        verticalAlign: "baseline"
      }}/>

      </h1>
      <h2>Discord information</h2>
      <pre><code className={"language-json"}>{JSON.stringify(guildData, null, 2)}</code></pre>
      <h2>Log channel</h2>
      {
        logChannel ?
          <DiscordChannel guild_id={guild_id} channel_id={logChannel}/>
          :
          null
      }
      <details>
        <summary>API Data</summary>
        <pre><code className={"language-json"}>{JSON.stringify(logChannel, null, 2)}</code></pre>
      </details>
      <h2>Nickname moderation configuration</h2>
      {
        nickNameModerationConfig === null ?
          <p>Nickname moderation is not enabled.</p>
          :
          <pre>
            <code className={"language-json"}>
              {JSON.stringify(nickNameModerationConfig, null, 2)}
            </code>
          </pre>
      }
      <h2>Logging features:</h2>
      <LoggingFeaturesTable features={loggingFeatures}/>
      <details>
        <summary>API Data</summary>
        <pre><code className={"language-json"}>{JSON.stringify(loggingFeatures, null, 2)}</code></pre>
      </details>
      <h2>Audit log:</h2>
      <AuditLogTable logs={auditLog}/>
      <pre><code className={"language-json"}>{JSON.stringify(auditLog, null, 2)}</code></pre>
    </div>
  )
}

function GuildSidebar({page, setPage}) {
  return (
    <div className={"sidebar"}>
      <div className={"sidebarButton"}>
        <a onClick={(e) => {e.preventDefault(); setPage("information")}}>ℹ️ Information</a>
      </div>
      <div className={"sidebarButton"}>
        <a onClick={(e) => {e.preventDefault(); setPage("settings")}}>⚙️      Settings</a>
      </div>
    </div>
  )
}


export default function GuildPage({ params: { guild_id }}) {
  const [page, setPage] = useState("information");
  const [guildData, setGuildData] = useState(null);

  const PageRender = ({_page}) => {
    switch(_page) {
      case "information":
        return <InformationOverload guild_id={guild_id}/>
      default:
        return <p>Unknown page</p>
    }
  }

  useEffect(
    () => {
      !guildData ? getGuildData(guild_id).then(setGuildData).catch(console.error) : null;
    },
    [guildData]
  )
  return (
    <main className={"home"}>
      <GuildSidebar page={page} setPage={setPage}/>
      <PageRender _page={page}/>
    </main>
  )
}