"use client";
import './style.css';
import {Spinner} from "../../util";

export default function GuildLoading() {
  return (
    <main className={"home"}>
      <Spinner/>
      <Spinner/>
    </main>
  )
}