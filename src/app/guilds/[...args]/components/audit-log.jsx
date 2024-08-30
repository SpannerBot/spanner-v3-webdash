import { useState } from 'react';
import * as utils from '../../../util';
import * as api from '../../../api';
import { useEffect } from 'react';
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-typescript";

function AuditLogEntry({entry, user_cache}) {
  // const [authorData, setAuthorData] = useState(
  //   {
  //     id: (entry.version >= 3 && entry.metadata.author.id) || entry.author.toString(),
  //     loaded: false
  //   }
  // );
  const getUserData = () => {
    return (user_cache || {})[entry.metadata?.author?.id] || entry.metadata?.author || {
      id: entry.author.toString(),
      display_name: 'unknown user'
    };
  }
  const [rawHidden, setRawHidden] = useState(true);
  const target = entry.target || 'unknown target';
  const authorData = getUserData();
  if(!entry.version || entry.version <= 2) {
    return (
      <div className={"auditLogEntry"} onDoubleClick={() => {setRawHidden(!rawHidden);Prism.highlightAll()}}>
        <p style={{fontSize: "smaller"}} hidden={!rawHidden}><i>Audit log entry is too old to display.</i></p>
        <pre className={"language-js"} hidden={rawHidden}>
          <code className={"language-js"}>{JSON.stringify(entry, null, 2)}</code>
        </pre>
      </div>
    )
  }
  const createdAt = new Date(entry.created_at);
  console.debug("Entry:", entry);
  console.debug("usercache:", user_cache);

  return (
    <div className={"auditLogEntry text-lg"}>
      <details onDoubleClick={() => {setRawHidden(!rawHidden);Prism.highlightAll()}}>
        <summary>[{entry.namespace}] <strong>{authorData.display_name || 'unknown user'}</strong> {entry.metadata["action.historical"] || entry.action} {entry.metadata?.target?.name || 'unknown target'}</summary>
        <blockquote>{entry.description}</blockquote>
        <p className={"text-xs"}>ID: <code>{entry.id}</code> | {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}</p>
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
  const [offset, setOffset] = useState(0);
  const [users, setUsers] = useState({});
  useEffect(
    () => {
      if(haveFetched) return;

      const fetchUsers = async (user_ids) => {
        let _users = {};
        for(let user_id of user_ids) {
          if(users[user_id]) continue;
          let user = await api.get_user(user_id);
          if(!user.display_name) continue;
          _users[user.id] = user;
        }
        return _users
      }

      api.get_audit_log(
        {guild_id: guild.id, limit: 20, maximum: 20, offset: offset}
      ).then(
        (auditLogResponse) => {
          let _users = [];
          for(let entry of auditLogResponse) {
            if(entry.version <= 2) continue;
            if(entry.metadata?.author?.display_name) continue;
            if(_users.includes(entry.metadata.author.id)) continue;
            _users.push(entry.metadata.author.id);
          }
          fetchUsers(_users).then(
            (_users) => {
              setUsers({...users, ..._users});
              setAuditLogs([...auditLogs, ...auditLogResponse].toSorted((a, b) => a.created_at < b.created_at));
              setLoading(false);
              setHaveFetched(true);
            }
          )
        }
      )
    },
    [guild, auditLogs, loading, haveFetched, offset, users]
  )

  if(!guild) return null;
  if(loading===true) {
    return <utils.Spinner />;
  }
  console.debug("User Cache (render):", users);
  return (
    <div>
      {
        auditLogs.map(log => <AuditLogEntry key={log.id} entry={log} user_cache={users} />)
      }
      {
        auditLogs.length ?
          <button type={"button"} onClick={() => {
            setOffset(offset + 20);setHaveFetched(false);setLoading(true)
          }}>Load More</button>
          :
          <button type={"button"} disabled><utils.Spinner/></button>
      }

    </div>
  )
}