"use client";
import {API_URL, Spinner} from "../util";
import useSWR from "swr";
import * as util from "../util";
import './style.css';
import {Avatar} from "../util";
import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid} from 'recharts';

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

function LatencyChart({history}) {
  // History is an array of integers, each representing the latency in milliseconds.
  // There are up to 1440 of these, to represent each minute of the day.
  // The most recent is at the end of the array.

  function arrayToData(h) {
    let obj = {};
    let now = new Date();
    for(let i = 0; i < h.length; i++) {
      const date = new Date(now - (i * 60000) - 60000);
      obj[i] = {
        name: "Minutely latency",
        latency: h[i],
        date: date,
        time: `${date.getHours()}:${date.getMinutes()}`
      };
    }
    return Object.values(obj).reverse();
  }

  return (
    <LineChart width={600} height={300} data={arrayToData(history)} style={{maxWidth: "100%"}}>
      <Line type="monotone" dataKey="latency" stroke="#5865F2"/>
      <XAxis dataKey="time"/>
      <YAxis/>
      <Tooltip/>
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />

    </LineChart>
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
  let avatarUrl=null;
  let isOffline = !!error || !data?.online || (data?.status !== "ok");
  if(error) {
    problems.push({title: "Unable to reach the Spanner API.", description: error.message});
  }
  else {
    if(data?.user?.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.webp`;
    }
    if(data?.online === false) {
      problems.push({title: "Spanner is offline.", description: "The Spanner API is currently offline."});
    }
    if(data?.guilds?.unavailable?.length > 0) {
      problems.push({title: "Guilds Unavailable", description: `The bot is currently unavailable in ${data.guilds.unavailable.length} guilds.`});
    }

    if(data?.latency?.now > 500) {
      problems.push(
        {
          title: "Increased Latency",
          description: `The websocket latency is currently ${data.latency.now}ms. You may notice slightly ` +
                       `slower responses.`
        }
      );
    }
    else if (data?.latency?.now > 1250) {
      problems.push(
        {
          title: "High Latency",
          description: `The websocket latency is currently ${data.latency.now}ms. You may notice slower responses.`
        }
      );
    }
    else if (data?.latency?.now > 2500) {
      problems.push(
        {
          title: "Critical Latency",
          description: `The websocket latency is currently ${data.latency.now}ms. Commands and interactions with the ` +
                       `bot may fail..`
        }
      );
      isOffline = true;
    }
  }
  if(!problems.length && realStatus === "ok" && !isOffline) {
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
        <Problems problems={problems} offline={isOffline}/>
      </div>
      <div>
        <p>
          User:&nbsp;
          <Avatar
            url={avatarUrl}
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
      <div>
        <p>Current websocket latency: {data?.latency?.now || '0'} milliseconds</p>
        {data?.latency?.history?.length >= 3   && <LatencyChart history={data.latency.history}/>}
      </div>
    </div>
  )
}
