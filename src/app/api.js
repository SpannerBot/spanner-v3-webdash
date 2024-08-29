// Spanner API
// See: https://spanner.nexy7574.co.uk/api/docs
import { API_URL, withBackoff } from './util';


async function fetchWithRatelimit(
    method,
    path,
    headers = {},
    body=null,
    maxRetries=2,
    __retryCount=0
) {
    if(body !== null && typeof body === "object" || Array.isArray(body)) {
        body = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
        console.debug("Automatically detected JSON body %r", body);
    }
    method = method.toUpperCase();
    const url = path.startsWith("/") ? path : "/" + path
    console.debug("[Attempt %d] Sending %s %s", __retryCount, method, url);
    const response = await withBackoff(
        async () => fetch(
            API_URL + url,
            {
                method: method,
                headers: headers,
                body: body,
                credentials: 'include',
                mode: "cors"
            }
        )
    )
    console.debug("[Attempt %d] Got response %d", __retryCount, response.status);
    if(response.status === 429) {
        if(__retryCount >= maxRetries) {
            console.error(
                "Ratelimited on \"%s %s\" after %d retries.",
                method,
                path,
                maxRetries
            )
            return response;
        }
        console.dir(response.headers);
        console.debug("Retry-After header: %r", response.headers.get("Retry-After"));
        console.debug("Retry-After resolves to: %d", response.headers.get("Retry-After") * 1000);
        const retryAfter = response.headers.get("Retry-After") * 1000;
        console.warn(
            "Ratelimited on \"%s %s\", retrying in %.2f seconds.",
            method,
            path,
            retryAfter
        )
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        __retryCount++;
        return await fetchWithRatelimit(
            method, 
            path, 
            headers, 
            body,
            maxRetries,
            __retryCount
        );
    }
    return await response.json();
}

export async function healthz() {
    return await fetch(API_URL + "/healthz", {mode: "cors"});
}


export async function oauth2_whoami() {
    return await fetch(API_URL + "/oauth2/whoami", {mode: "cors"});
}

export async function oauth2_get_session() {
    return await fetch(API_URL + "/oauth2/session", {mode: "cors"});
}

export async function oauth2_delete_session() {
    return await fetch(API_URL + "/oauth2/session", {method: "DELETE", mode: "cors"});
}


export async function get_user_guillds() {
    return await fetchWithRatelimit("GET", "/_discord/users/@me/guilds");
}

export async function get_user(user_id = "@me") {
    return await fetchWithRatelimit("GET", `/_discord/users/${user_id}`);
}

export async function get_guild(guild_id) {
    return await fetchWithRatelimit("GET", `/guilds/${guild_id}`);
}

export async function get_guild_channels(guild_id) {
    return await fetchWithRatelimit("GET", `/_discord/guilds/${guild_id}/channels`);
}

export async function get_guild_member(guild_id, user_id) {
    if(!["@me", "bot"].includes(user_id)) {
        throw new Error("user_id must be either '@me' or 'bot'");
    }
    return await fetchWithRatelimit("GET", `/_discord/guilds/${guild_id}/members/${user_id}`);
}

export async function get_guild_member_permissions(guild_id, user_id) {
    if(!["@me"].includes(user_id)) {
        throw new Error("user_id must be either '@me' or 'bot'");
    }
    return await fetchWithRatelimit("GET", `/_discord/guilds/${guild_id}/${user_id}/permissions`);
}


export async function get_config(guild_id) {
    // currently broken - all returned IDs are bigints, which breaks JavaScript.
    return await fetchWithRatelimit("GET", `/config/${guild_id}`);
}

export async function get_nickname_moderation(guild_id) {
    return await fetchWithRatelimit("GET", `/config/${guild_id}/nickname-moderation`);
}

export async function set_nickname_moderation(
    guild_id,
    {
        hate = null,
        harassment = null,
        self_harm = null,
        sexual = null,
        violence = null
    }
) {
    let toChange = {};
    if(hate !== null) toChange.hate = hate;
    if(harassment !== null) toChange.harassment = harassment;
    if(self_harm !== null) toChange.self_harm = self_harm;
    if(sexual !== null) toChange.sexual = sexual;
    if(violence !== null) toChange.violence = violence;
    return await fetchWithRatelimit("PATCH", `/config/${guild_id}/nickname-moderation`, {}, toChange);
}

export async function disable_nickname_moderation(guild_id) {
    return await fetchWithRatelimit("DELETE", `/config/${guild_id}/nickname-moderation`);
}


export async function get_logging_channel_id(guild_id) {
    return await fetchWithRatelimit("GET", `/config/${guild_id}/logging/channel`);
}

export async function get_all_logging_features() {
    return await fetch(API_URL + "/config/0/logging/features/all");
}

export async function get_enabled_logging_features(guild_id) {
    return await fetchWithRatelimit("GET", `/config/${guild_id}/logging/features/enabled`);
}

export async function enable_logging_feature(guild_id, feature) {
    return await fetchWithRatelimit(
        "PUT", 
        `/config/${guild_id}/logging/features/${feature}`,
        {enabled: true}
    );
}

export async function disable_logging_feature(guild_id, feature) {
    return await fetchWithRatelimit(
        "PUT", 
        `/config/${guild_id}/logging/features/${feature}`,
        {enabled: false}
    );
}

export async function get_audit_log(
  {
      guild_id,
      before = null,
      after = null,
      limit = 100,
      offset = 0,
      author = null,
      namespace = null,
      action = null,
      maximum = 1000
  }
) {
    let entries = [];
    while(entries.length < maximum) {
        let query_params = [];
        if(before !== null) query_params.push(`before=${before}`);
        if(after !== null) query_params.push(`after=${after}`);
        if(limit !== null) query_params.push(`limit=${limit}`);
        if(offset !== null) query_params.push(`offset=${offset}`);
        if(author !== null) query_params.push(`author=${author}`);
        if(namespace !== null) query_params.push(`namespace=${namespace}`);
        if(action !== null) query_params.push(`action=${action}`);

        let page = await fetchWithRatelimit("GET", `/config/${guild_id}/audit-log?${query_params.join("&")}`);
        if(page.entries.length === 0) {
            return entries;
        }
        else {
            entries = entries.concat(page.entries);
        }
        offset += page.entries.length;
    }
    return entries;
}
