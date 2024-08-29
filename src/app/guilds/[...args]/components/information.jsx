import * as util from '../../../util';
import Link from "next/link";
import {useState, useEffect} from "react";

export default function InformationPage({guild}) {
  if(!guild.present) {
    return (
      <div>
        <h1>Server not found</h1>
        <p>The server you are looking for could not be found.</p>
        <br/>
        <p>
          Did you want
          to <Link
            href={`${util.API_URL}/oauth2/invite?guild_id=${guild?.id}&return_to=${location}`}
            >invite Spanner?</Link>
        </p>
      </div>
    )
  }
  if(!guild.name) {
    return (
      <div>
        <util.Spinner/>
      </div>
    )
  }

  const hasPermission = ((guild.permissions & 0x20) == 0x20 || guild.owner);
  return (
    <div>
      <h1>
        Server info<span className={"hideOnMobile"}>rmation</span>:
        <br className={"hideOnDesktop"}/>
        {guild?.name || 'Unknown guild'}
      </h1>
      <div>Server ID: <code>{guild?.id}</code></div>
      {
        guild?.owner ? <p>You own this server.</p> : <p>You do not own this server.</p>
      }     
      {
        hasPermission ? null : <p>You do not have the &quot;Manage Server&quot; permission. You may not be able to access more information.</p>
      }
    </div>
  )
}