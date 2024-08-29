import * as util from '../../../util';
import * as api from '../../../api';
import {useState, useEffect, Component} from "react";


function NicknameModerationWidget({guild, nicknameConfig, setNickNameModeration}) {
  if(!nicknameConfig) {
    return (
      <p>Nickname moderation is disabled. Use /settings nickname-filtering to enable it!</p>
    )
  }

  function onChange(e) {
    const key = e.target.parentElement.dataset.key;
    const enabled = e.target.checked;
    e.target.disabled = true;
    let obj = {};
    obj[key] = enabled;
    api.set_nickname_moderation(guild.id, obj).then(
      (result) => {e.target.disabled = false; setNickNameModeration(result)}
    ).catch(
      (er) => {
        console.error(er);
        e.target.checked = !enabled;
        e.target.disabled = false
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
              <li key={key || Math.random().toString()} data-key={key}>
                {key}: <input type={"checkbox"} defaultChecked={enabled} onChange={onChange}/>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

function LogFeaturesWidget({guild, features}) {
  function onChange(e) {
    const key = e.target.parentElement.dataset.key;
    const enabled = e.target.checked;
    e.target.disabled = true;

    let func;
    if(enabled) {
      func = api.enable_logging_feature;
    }
    else {
      func = api.disable_logging_feature
    }

    func(guild.id, key).then(
      (result) => {e.target.disabled = false; setLogFeatures(result)}
    ).catch(
      (er) => {
        console.error(er);
        e.target.checked = !enabled;
        e.target.disabled = false
      }
    );
  }
  if(!features) return <p>You do not have any log features enabled.</p>
  else if (features.err) return <p>Failed to load log features: {features.err.message}</p>
  return (
    <div>
      <p>
        The following features are available for logging:
      </p>
      <div className={"featureList"}>
        {
          features.map((feature) => {
            return (
              <div key={feature.id || feature.name} data-key={feature.name}>
                {feature.name}: <input type={"checkbox"} defaultChecked={feature.enabled} onChange={onChange}/>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}


export default class SettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      hasAccess: null,
      logChannel: null,
      nickNameModeration: null,
      logFeatures: [],
      availableLogFeatures: [],
      hasMounted: false
    }
  }

  async checkPermissions() {
    try {
      this.setState({loading: true});
      const result = (await api.get_guild_member_permissions(this.props.guild.id, "@me") & 0x20) === 0x20;
      this.setState({hasAccess: result, loaded: true});
      return result;
    } catch (e) {
      console.error(e);
      this.setState({hasAccess: false, loaded: true});
      return false;
    }
  }

  async loadLogChannel() {
    try {
      this.setState({loading: true});
      const id = await util.withBackoff(async () => util.getLoggingChannelID(this.props.guild.id));
      const channel = await util.withBackoff(async () => util.getDiscordGuildChannel(this.props.guild.id, id));
      this.setState({logChannel: channel, loading: false});
    } catch (e) {
      console.error(e);
      this.setState({logChannel: {err: e}, loading: false});
    }
  }

  async loadNickNameModeration() {
    try {
      this.setState({loading: true});
      const config = await util.getNicknameModerationConfig(this.props.guild.id);
      this.setState({nickNameModeration: config, loading: false});
    } catch (e) {
      console.error(e);
      this.setState({nickNameModeration: {err: e}, loading: false});
    }
  }

  async loadLogFeatures() {
    try {
      this.setState({loading: true});
      let enabledFeatures = await util.getEnabledLoggingFeatures(this.props.guild.id);
      const allFeatures = await util.getAllLoggingFeatures(this.props.guild.id);
      // Add any features from all features missing from enabled as [key]=false
      for(let feature of allFeatures) {
        if(!enabledFeatures.find((f) => f.id === feature.id)) {
          enabledFeatures.push({id: null, name: feature, enabled: false});
        }
      }
      this.setState({logFeatures: enabledFeatures, loading: false});
    } catch (e) {
      console.error(e);
      this.setState({logFeatures: {err: e}, loading: false});
    }
  }

  async entryPoint() {
    console.debug("Checking guild permissions...")
    const ok = await this.checkPermissions();
    if(ok) {
      console.debug("Guild permissions OK. Fetching log channel.");
      await this.loadLogChannel();
      console.debug("Fetching nickname moderation config...");
      await this.loadNickNameModeration();
      console.debug("Fetching log features...");
      await this.loadLogFeatures();
      console.debug("Done");
    } else {
      console.debug("No permissions, skipping loading of log channel, nickname moderation, and log features.")
    }
    this.setState({loading: false});
  }
  componentDidMount() {
    if(this.state.hasMounted) return;
    this.setState({hasMounted: true});
    this.entryPoint().then().catch(console.error);
  }

  render() {
    if(this.state.loading) {
      return (
        <div>
          <util.Spinner/> Fetching data...
        </div>
      )
    }
    else if (this.state.hasAccess === false) {
      return (
        <div>
          <p>You do not have access to this page. You require the <code>Manage Server</code> permission.</p>
        </div>
      )
    }
    else {
      return (
        <div>
          <h2>Server settings:</h2>
          <h3>📖 Logging</h3>
          <p>
            Logging channel: {
            (this.state.logChannel && !this.state.logChannel.err)
              ? <a href={`https://discord.com/channels/${this.props.guild.id}/${this.state.logChannel.id}`}>#{this.state.logChannel.name}</a>
              : <span>No logging channel set</span>
          }
          </p>
          <LogFeaturesWidget guild={this.props.guild} features={this.state.logFeatures} setLogFeatures={() => null }
                             allFeatures={this.state.logFeatures}/>
          <br/>
          <h3>🖥️ AI Nickname Moderation</h3>
          <NicknameModerationWidget guild={this.props.guild} nicknameConfig={this.state.nickNameModeration}
                                    setNickNameModeration={() => null }/>
        </div>
      )
    }
  }
}
