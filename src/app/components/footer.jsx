import './footer.css';
import Link from "next/link";
import {API_URL, DISCORD_INVITE, BOT_SOURCE_URL, WEB_SOURCE_URL} from "../util";

export default function Footer() {
  return (
    <footer className={"footer"}>
      <div>
        <p>
          Spanner v3 | Copyright {(new Date()).getUTCFullYear().toString()}
        </p>
      </div>
      <div>
        <div style={{display: "flex", gap: "1em"}}>
          <div>
            <h4>Resources</h4>
            <ul className={"clearList"}>
              <li>
                <Link href={"/"}>Home</Link>
              </li>
              <li>
                <Link href={API_URL + "/docs"}>API Documentation</Link>
              </li>
              <li>
                <Link href={DISCORD_INVITE}>Support</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul className={"clearList"}>
              <li>
                <Link href={BOT_SOURCE_URL}>Bot</Link>
              </li>
              <li>
                <Link href={WEB_SOURCE_URL}>Website</Link>
              </li>
              <li>
                <Link href={BOT_SOURCE_URL + "/blob/dev/LICENSE"}>License (AGPL-3)</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}