import Link from "next/link";
import './nav.css';
import avatar from '../../../public/avatar.png';
import Image from "next/image";
import {useState, useEffect} from "react";
import {API_URL} from "../util";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function StatusWidget() {
  const {data, error, isLoading} = useSWR(
    API_URL + "/healthz",
    fetcher,
    {
      refreshInterval: 10000
    }
  );
  if(error || (data && data.status !== "ok")) return <p style={{color: "var(--danger)"}}>⚠️ API is unreachable!</p>;
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
        <p>⚠️ This is pre-release software!</p>
        <StatusWidget />
      </div>
    </nav>
  );
}

export default Nav;
