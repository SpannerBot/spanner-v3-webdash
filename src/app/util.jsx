export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1237";

export const Spinner = () => {
  return <span className={"spinner large"}>⌛</span>
}


export async function getPresence(guild_id) {
  const response = await fetch(
    `${API_URL}/config/${guild_id}/presence`
  );
  return response.status === 204
}

export async function getNicknameModerationConfig(guild_id) {
  const response = await fetch(
    `${API_URL}/config/${guild_id}/nickname-moderation`,
    {credentials: "include"}
  );
  if(!response.ok) {
    throw new Error("Failed to fetch nickname moderation config");
  }
  return await response.json();
}

export async function setNicknameModerationCategory(guild_id, key, enabled) {
  let body = {};
  body[key] = enabled;
  const response = await fetch(
    `${API_URL}/config/${guild_id}/nickname-moderation`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    }
  );
  if(!response.ok) {
    throw new Error("Failed to enable nickname moderation");
  }
  return await response.json();
}

export async function disableNicknameModeration(guild_id, key) {
  const response = await fetch(
    `${API_URL}/config/${guild_id}/nickname-moderation/${key}`,
    {method: "DELETE", credentials: "include"}
  );
  if(!response.ok) {
    throw new Error("Failed to disable nickname moderation");
  }
  return await response.json();
}

export async function getLoggingChannelID(guild_id) {
  const response = await fetch(
    `${API_URL}/config/${guild_id}/logging/channel`
  );
  if(!response.ok) {
    throw new Error("Failed to fetch logging channel ID");
  }
  return await response.json();
}

export async function getAllLoggingFeatures(guild_id = null) {
  const response = await fetch(
    `${API_URL}/config/${guild_id || "0"}/logging/features/all`
  );
  if(!response.ok) {
    throw new Error("Failed to fetch all logging features");
  }
  return await response.json();
}

export async function getEnabledLoggingFeatures(guild_id, enabled_only = null) {
  let url = `${API_URL}/config/${guild_id}/logging/features/enabled`;
  if(enabled_only !== null) {
    url += `?enabled=${enabled_only}`;
  }
  const response = await fetch(
    url, {credentials: "include"}
  );
  if(!response.ok) {
    throw new Error("Failed to fetch enabled logging features");
  }
  return await response.json();
}

export async function enableLoggingFeature(guild_id, key) {
  const response = await fetch(
    `${API_URL}/config/${guild_id}/logging/features/${key}`,
    {method: "PUT", credentials: "include", body: '{"enabled":true}'}
  );
  if(!response.ok) {
    throw new Error("Failed to enable logging feature");
  }
  return await response.json();
}

export async function disableLoggingFeature(guild_id, key) {
  const response = await fetch(
    `${API_URL}/config/${guild_id}/logging/features/${key}`,
    {method: "PUT", credentials: "include", body: '{"enabled":false}'}
  );
  if(!response.ok) {
    throw new Error("Failed to disable logging feature");
  }
  return await response.json();
}

export async function auditLogsFor(guild_id) {
  let offset = 0;
  let entries = [];

  while(true) {
    let response = await fetch(
      `${API_URL}/config/${guild_id}/audit-log?offset=${offset}`,
      {credentials: "include"}
    );
    if(!response.ok) {
      throw new Error("Failed to fetch audit log entries");
    }
    let data = await response.json();
    if(data.entries.length === 0) {
      break;
    }
    entries.push(...data.entries);
  }
  return entries;
}

export async function getDiscordGuildData(guild_id) {
  const response = await fetch(
    `${API_URL}/_discord/guilds/${guild_id}`,
    {credentials: "include"}
  )
  if(response.status === 429) {
    const retry_after = response.headers.get("Retry-After");
    console.warn("Rate limited, retrying after %d seconds", retry_after);
    await new Promise((resolve) => setTimeout(resolve, retry_after * 1000));
    return await getDiscordGuildData(guild_id);
  }
  if(!response.ok) {
    throw new Error("Failed to fetch guild data");
  }
  return await response.json();
}

export async function getDiscordGuildChannels(guild_id) {
  const response = await fetch(
    `${API_URL}/_discord/guilds/${guild_id}/channels`,
    {credentials: "include"}
  )
  if(!response.ok) {
    throw new Error("Failed to fetch guild channels");
  }
  return await response.json();
}

export async function getDiscordGuildChannel(guild_id, channel_id) {
  const channels = await getDiscordGuildChannels(guild_id);
  return channels.find((c) =>   c.id === channel_id);
}

export async function getLoggedInUser() {
  const response = await fetch(
    `${API_URL}/_discord/users/@me`,
    {credentials: "include"}
  )
  if(response.status === 429) {
    const retry_after = response.headers.get("Retry-After");
    console.warn("Rate limited, retrying after %d seconds", retry_after);
    await new Promise((resolve) => setTimeout(resolve, retry_after * 1000));
    return await getLoggedInUser();
  }
  if(!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return await response.json();
}

export async function getUserGuilds() {
  const response = await fetch(
    `${API_URL}/_discord/users/@me/guilds`,
    {credentials: "include"}
  )
  if(response.status === 429) {
    const retry_after = response.headers.get("Retry-After");
    console.warn("Rate limited, retrying after %d seconds", retry_after);
    await new Promise((resolve) => setTimeout(resolve, retry_after * 1000));
    return await getUserGuilds();
  }
  if(!response.ok) {
    throw new Error("Failed to fetch user guilds");
  }
  return await response.json();
}

export async function getLoggedInMember(guild_id) {
  const response = await fetch(
    `${API_URL}/_discord/users/@me/guilds/${guild_id}/member`,
    {credentials: "include"}
  )
  if(response.status === 429) {
    const retry_after = response.headers.get("Retry-After");
    console.warn("Rate limited, retrying after %d seconds", retry_after);
    await new Promise((resolve) => setTimeout(resolve, retry_after * 1000));
    return await getLoggedInMember(guild_id);
  }
  if(!response.ok) {
    throw new Error("Failed to fetch member data");
  }
  return await response.json();
}

export async function hasGuildPermissions(guild_id, value) {
  const response = await fetch(
    `${API_URL}/_discord/users/@me/guilds/${guild_id}/permissions`,
    {credentials: "include"}
  )
  if(!response.ok) {
    throw new Error("Failed to fetch permissions");
  }
  const permissions = await response.json();
  return (permissions & value) === value;
}

export async function checkAPIHealth() {
  const response = await fetch(
    `${API_URL}/healthz`
  );
  return response.ok && (await response.json()).status === "ok";
}


export async function processedGuilds() {
  let data = await getUserGuilds();
  data.sort((g1, g2) => g1.name.localeCompare(g2.name));
  for(let guild of data) {
    const presenceResponse = await fetch(`${API_URL}/config/${guild.id}/presence`);
    guild.present = presenceResponse.ok;
  }
  // put present guilds first
  data.sort((g1, g2) => g2.present - g1.present);
  return data;
}
