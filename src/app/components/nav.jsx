import Link from "next/link";
import './nav.css';
import avatar from '../../../public/avatar.png';
import Image from "next/image";
import {useState, useEffect} from "react";
import {API_URL} from "../util";
import useSWR from "swr";
import Icon from '@mdi/react';
import { mdiAlert } from '@mdi/js';

const fetcher = (url) => fetch(url).then((res) => res.json());

export function StatusWidget() {
  const {data, error, isLoading} = useSWR(
    API_URL + "/healthz",
    fetcher,
    {
      refreshInterval: 10000
    }
  );
  let result=null;
  if(data || error) {
    if(error) {
      result = "API is unreachable!";
    }
    else {
      if(!data.online) {
        result = "Spanner is offline!"
      }
      else if (data.guilds?.unavailable.length > 0) {
        result = `${data.guilds.unavailable.length} guilds are unavailable!`;
      }
    }
  }

  if(result) {
    return <span style={{color: "var(--danger)"}}><Icon size={1} path={mdiAlert} style={{verticalAlign: "middle"}}/> {result}</span>
  }
  return null;
}

function Nav() {


  return (
    <nav className={"navbar"}>
      <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
        <Link href="/">
          <Image src={avatar} alt="avatar" width={64} height={64} className={"icon"}/>
        </Link>
      </div>
      <div>
        <p><Icon size={1} path={mdiAlert} style={{verticalAlign: "middle"}}/> This is pre-release software!</p>
        <StatusWidget />
      </div>
    </nav>
  );
}

export default Nav;
