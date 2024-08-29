import { useState } from 'react';
import * as utils from '../../../util';
import * as api from '../../../api';
import { useEffect } from 'react';
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-typescript";

function AuditLogEntry({entry}) {
  const [authorData, setAuthorData] = useState(
    {
      id: (entry.version >= 3 && entry.metadata.author.id) || entry.author.toString(),
      loaded: false
    }
  );
  const [rawHidden, setRawHidden] = useState(true);
  useEffect(
    () => {
      if(authorData.loaded) return;
      utils.withBackoff(
        () => api.get_user(authorData.id),
      )
        .then((r) => {setAuthorData({...authorData, ...r, loaded: true}); Prism.highlightAll();})
        .catch(
          (e) => {console.error(e); setAuthorData({...authorData, loaded: true})}
        )
    },
    [authorData]
  )
  if(!entry.version || entry.version <= 2) {
    return (
      <div className={"auditLogEntry"}>
        <p style={{fontSize: "smaller"}}><i>Audit log entry is too old to display.</i></p>
      </div>
    )
  }
  const createdAt = new Date(entry.created_at);

  return (
    <div className={"auditLogEntry"}>
      <details onDoubleClick={() => {setRawHidden(!rawHidden);Prism.highlightAll()}}>
        <summary>[{entry.namespace}] <strong>{entry.metadata.author.display_name || entry.metadata.author.id}</strong> {entry.action} {entry.target || 'unknown'}</summary>
        <p>{entry.description}</p>
        <p className={"text-sm"}>ID: <code>{entry.id}</code> | {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}</p>
        <pre className={"language-js"} hidden={rawHidden}>
          <code className={"language-js"}>{JSON.stringify(entry, null, 2)}</code>
        </pre>
      </details>
    </div>
  )
}

export default function AuditLogPage({guild}) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [haveFetched, setHaveFetched] = useState(false);

  useEffect(
    () => {
      if(haveFetched) return;
      api.get_audit_log({guild_id: guild.id, limit: 10, maximum: 10})
      .then((r) => {setAuditLogs(r.toSorted((a, b) => a.created_at < b.created_at)); setLoading(false); setHaveFetched(true)})
      .catch(
        (e) => {console.error(e); setLoading(false); setHaveFetched(true)}
      )
    },
    [guild, auditLogs, loading, haveFetched]
  )

  if(!guild) return null;
  if(loading===true) {
    return <utils.Spinner />;
  }
  return (
    <div>
      {
        auditLogs.map(log => <AuditLogEntry key={log.id} entry={log} />)
      }
    </div>
  )
}