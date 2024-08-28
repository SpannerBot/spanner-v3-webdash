import { useState } from 'react';
import * as utils from '../../../util';
import { useEffect } from 'react';

function AuditLogEntry({entry}) {
  const createdAt = new Date(entry.created_at);
  return (
    <div className={"auditLogEntry"}>
      <details>
        <summary>[{entry.namespace}] <strong>{entry.author}</strong> {entry.action}</summary>
        <p>{entry.description}</p>
        <p className={"small"}>ID: <code>{entry.id}</code> | {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}</p>
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