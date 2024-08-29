"use client";
import {API_URL, Spinner} from "../util";
import useSWR from "swr";
import * as util from "../util";
import './style.css';
import { useSearchParams } from 'next/navigation';
import {Avatar} from "../util";
import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, } from 'recharts';
import {useState} from "react";

function fetcher(url) {
  return util.withBackoff(
    async () => fetch(url), 2, 1500)
    .then(
      (res) => {
        if(!res.ok) {
          let err= new Error('Failed to fetch')
          err.response = res;
        }
        return res.json()
      }
    )
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

function LatencyChart({history, range}) {
  function arrayToData(h) {
    h = h.toReversed().slice(0, range);
    let obj = {};
    for(let i = 0; i < h.length; i++) {
      let entry = h[i];
      const date = new Date(entry.timestamp_ms);
      obj[i] = {
        name: "Minutely latency",
        latency: entry.latency,
        time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      };
    }

    return Object.values(obj).reverse();
  }

  return (
    <LineChart
      width={600}
      height={300}
      data={arrayToData(history)}
      style={{maxWidth: "100%"}}
      domain={{y: [0, 5000]}}
    >
      <Line type="monotone" dataKey="latency" stroke="#5865F2"/>
      <XAxis dataKey="time"/>
      <YAxis/>
      <Tooltip/>
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
    </LineChart>
  )
}

export default function StatusPage() {
  const params = useSearchParams();
  const [range, setRange] = useState(30);
  let refreshInterval = params.get("i")*1 || 5;
  const swrParams = {
    refreshInterval: refreshInterval * 1000,
  }
  const {data, error, isLoading} = useSWR(
    API_URL + "/healthz",
    fetcher,
    swrParams
  );

  let problems = [];
  let realStatus = data?.status
  let avatarUrl=null;
  let isOffline = !!error || !data?.online || (data?.status !== "ok");
  if(error) {
    if(error.response) {
      problems.push({title: "Unable to reach the Spanner API.", description: error.message});
    }
    else {
      problems.push(
        {
          title: "Network Error",
          description: "An unknown error occurred while contacting the Spanner API. Please check your connection.."
        }
      )
    }
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
        <p suppressHydrationWarning className={"text-sm"}>
          Last refresh: {new Date().toLocaleTimeString()} (interval: {swrParams.refreshInterval / 1000} seconds)
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
        {
          data?.latency?.history?.length >= 3 && (
            <div>
              <LatencyChart history={data.latency.history} range={range}/>
              <div onDoubleClick={(e) => setRange(120)}>
                <label for={"range"}>Range in minutes ({range}): </label>
                <input
                  type={"range"}
                  id={"range"}
                  value={range}
                  onChange={(e) => setRange(e.target.value * 1)}
                  min={2}
                  max={1440}
                  title={`${range} minutes`}
                  style={{background: "transparent", border: "0", color: "var(--text-active)", verticalAlign: "middle"}}
                />
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}
