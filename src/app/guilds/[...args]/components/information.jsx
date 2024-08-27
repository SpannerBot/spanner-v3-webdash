import * as util from '../../../util.js';
import {useState, useEffect} from "react";
import {Spinner} from "../../../page";

export default function SettingsPage({guild}) {
  if(!guild) {
    return <Spinner/>
  }
  return (
    <div>
      <h1>Server information: {guild?.name || 'Unknown guild'}</h1>
      <div>Server ID: <code><pre>{guild?.id}</pre></code></div>
      {
        guild?.owner ? <p>You own this server.</p> : <p>You do not own this server.</p>
      }     
      {
        ((guild?.permissions & 0x20) == 0x20 || guild?.owner) ? null : <p>You do not have the &quot;Manage Server&quot; permission. You may not be able to access more information.</p>
      }
    </div>
  )
}