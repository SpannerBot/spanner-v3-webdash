import * as util from '../../../util.js';
import {useState, useEffect} from "react";


function NicknameModerationWidget({guild, nicknameConfig, setNickNameModeration}) {
  if(!nicknameConfig) {
    return (
      <p>Nickname moderation is disabled. Use /settings nickname-filtering   to enable it!</p>
    )
  }

  function onChange(e) {
    const key = e.target.parentElement.dataset.key;
    const enabled = e.target.checked;
    util.setNicknameModerationCategory(guild.id, key, enabled)
      .then(setNickNameModeration)
      .catch(
        (er) => {
          console.error(er);
          e.target.checked = !enabled;
        }
      );
  }

  return (
    <div>
      <p>
        AI Nickname moderation is enabled. Currently, the following categories are being filtered:
      </p>
      <ul>
        {
          Object.keys(nicknameConfig).map((key) => {
            const enabled = nicknameConfig[key];
            if(key==="id") return null;
            return (
              <li key={key} data-key={key}>
                {key}: <input type={"checkbox"} defaultChecked={enabled} onChange={onChange}/>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

function LogFeaturesWidget({guild, features, setLogFeatures}) {
  function onChange(e) {
    const key = e.target.parentElement.dataset.key;
    const enabled = e.target.checked;
    if(enabled) {
      util.enableLoggingFeature(guild.id, key).then(
        (result) => {
          if(result) {
            setLogFeatures(result);
          }
        }
      ).catch(
        (er) => {
          console.error(er);
          e.target.checked = !enabled;
        }
      );
    } else {
      util.enableLoggingFeature(guild.id, key).then(
        (result) => {
          if(result) {
            setLogFeatures(result);
          }
        }
      ).catch(
        (er) => {
          console.error(er);
          e.target.checked = !enabled;
        }
      );
    }
  }

  if(!features) return <p>You do not have any log features enabled.</p>
  return (
    <div>
      <p>
        The following features are available for logging:
      </p>
      <ul>
        {
          features.map((feature) => {
            return (
              <li key={feature.id} data-key={feature.name}>
                {feature.name}: <input type={"checkbox"} defaultChecked={feature.enabled} onChange={onChange}/>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}


export default function SettingsPage({guild}) {
  const [loaded, setLoaded] = useState(false);
  const [logChannel, setLogChannel] = useState(null);
  const [nickNameModeration, setNickNameModeration] = useState(null)
  const [logFeatures, setLogFeatures] = useState(null);
  const [availableLogFeatures, setAvailableLogFeatures] = useState(null);
  const [canAccess, setCanAccess] = useState(null);

  useEffect(
    () => {
      if(loaded) return;
      util.hasGuildPermissions(guild.id, 0x0).then(
        (result) => {
          if(!result) {
            setCanAccess(false);
            return;
          }
          setCanAccess(true)
          util.getLoggingChannelID(guild.id)
            .then((id) => util.getDiscordGuildChannel(guild.id, id)
              .then((channel) => setLogChannel(channel))
              .catch(console.error)
            )
            .catch(console.error);

          util.getNicknameModerationConfig( guild.id).then(setNickNameModeration).catch(console.error);
          util.getEnabledLoggingFeatures(guild.id).then(setLogFeatures).catch(console.error);
          util.getAllLoggingFeatures(guild.id).then(setAvailableLogFeatures).catch(console.error);
          setLoaded(true);
        }
      ).catch((e) => {console.error(e); setCanAccess(false);});
    },
    [guild, loaded, logChannel, nickNameModeration, logFeatures, availableLogFeatures, canAccess]
  )
  if(!canAccess) {
    return <p>You do not have permission to view this page.</p>
  }
  return (
    <div>
      <h2>Server settings:</h2>
      <h3>📖 Logging</h3>
      <p>
        Logging channel: {
          logChannel
            ? <a href={`https://discord.com/channels/${guild.id}/${logChannel.id}`}>#{logChannel.name}</a>
            : <span>No logging channel set</span>
        }
      </p>
      <LogFeaturesWidget guild={guild} features={logFeatures} setLogFeatures={setLogFeatures} allFeatures={availableLogFeatures}/>
      <br/>
      <h3>🖥️ AI Nickname Moderation</h3>
      <NicknameModerationWidget guild={guild} nicknameConfig={nickNameModeration} setNickNameModeration={setNickNameModeration}/>
    </div>
  )
}