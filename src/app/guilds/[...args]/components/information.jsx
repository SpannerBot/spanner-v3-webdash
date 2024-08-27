import * as util from '../../../util';
import {useState, useEffect} from "react";

export default function SettingsPage({guild}) {
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
      <h1>Server information: {guild?.name || 'Unknown guild'}</h1>
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