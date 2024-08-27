"use client";
import {API_URL, Spinner} from "../util";
import useSWR from "swr";
import * as util from "../util";
import './style.css';
import {Avatar} from "../util";

function fetcher(url) {
  return util.withBackoff(async () => fetch(url), 2, 1500)
    .then((res) => {if(!res.ok) throw new Error('Failed to fetch'); return res.json()})
}


function Problems({problems, offline}) {
  if (!problems.length) return null;
  return (
    <div>
      <h2>Problems:</h2>
      <div className={offline ? "errorBox" : "warningBox"}>
        {problems.map((problem, index) => (
          <div key={index}>
            <h3>{problem.title}</h3>
            <p>{problem.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function StatusPage() {
  const {data, error, isLoading} = useSWR(
    API_URL + "/healthz",
    fetcher,
    {
      refreshInterval: 10000
    }
  );
  /* data:
      {
        "status": "ok",
        "online": true,
        "uptime": 764,
        "guilds": {
          "total": 3,
          "unavailable": []
        },
        "host": "1c12d3b5e16c",
        "user": {
          "id": "1018920700234436719",
          "name": "RuntimeError",
          "avatar": "eadd6dda28a5abf0e4bbcd33cec471b5"
        }
      }
   */

  let problems = [];
  let realStatus = data?.status
  if(error) {
    problems.push({title: "Unable to reach the Spanner API.", description: error.message});
  }
  else {
    if(data?.online === false) {
      problems.push({title: "Spanner is offline.", description: "The Spanner API is currently offline."});
    }
    if(data?.guilds.unavailable.length > 0) {
      problems.push({title: "Guilds Unavailable", description: `The bot is currently unavailable in ${data.guilds.unavailable.length} guilds.`});
    }
  }
  if(!problems.length && realStatus === "ok") {
    realStatus = "nominal"
  }

  return (
    <div style={{paddingLeft: "2em"}}>
      <div>
        <h1>Status: <strong>{realStatus}</strong></h1>
        <p suppressHydrationWarning className={"small"}>
          Last refresh: {new Date().toLocaleTimeString()}
          {
            isLoading && <Spinner/>
          }
        </p>
      </div>
      <div>
        <Problems problems={problems} offline={error || !data?.online || (data?.status !== "ok")}/>
      </div>
      <div>
        <p>
          User:&nbsp;
          <Avatar
            url={data?.user ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.icon}.png` : null}
            id={data?.user?.id || "4"}
          />
          {data?.user?.name || 'Unavailable'} (<code>{data?.user?.id || 'Unavailable'})</code>
        </p>
        {
          data?.uptime && (
            <p>
              Uptime: <strong>{util.humaniseSeconds(data.uptime)}</strong>
            </p>
          )
        }
      </div>
    </div>
  )
}
