"use client";
import './style.css';
import {Spinner} from "../util";

export default function GuildLoading() {
  return (
    <div style={{paddingLeft: "2em"}}>
      <div>
        <h1>Status: loading <Spinner/></h1>
      </div>
    </div>
  )
}