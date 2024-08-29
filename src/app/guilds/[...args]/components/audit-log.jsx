import { useState } from 'react';
import * as utils from '../../../util';
import { useEffect } from 'react';

function AuditLogEntry({entry}) {
  if(!entry.version || entry.version <= 2) {
    return (
      <div className={"auditLogEntry"}>
        <p style={{fontSize: "smaller"}}><i>Audit log entry is too old to display.</i></p>
      </div>
    )
  }
  const createdAt = new Date(entry.created_at);

  const [authorData, setAuthorData] = useState(
    {
      id: entry.metadata?.author?.id || entry.author.toString(),
      loaded: false
    }
  );

  useEffect(
    () => {
      if(authorData.loaded) return;
      utils.withBackoff(
        () => utils.getUser(authorData.id),
      )
      .then((r) => {setAuthorData({...authorData, ...r, loaded: true})})
      .catch(
        (e) => {console.error(e); setAuthorData({...authorData, loaded: true})}
      )
    },
    [authorData]
  )

  return (
    <div className={"auditLogEntry"}>
      <details>
        <summary>[{entry.namespace}] <strong>{entry.author}</strong> {entry.action}</summary>
        <p>{entry.description}</p>
        <p className={"text-sm"}>ID: <code>{entry.id}</code> | {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}</p>
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
      utils.withBackoff(
        () => utils.auditLogsFor(guild.id),
      )
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