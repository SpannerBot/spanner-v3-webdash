"use client";
import {Component} from "react";
import SettingsPage from "./components/settings";
import InformationPage from "./components/information";
import Link from "next/link";
import './style.css';
import {getDiscordGuildData, Spinner} from "../../util";
import * as util from "../../util";

function GuildSidebar({guild}) {
  return (
    <div className={"sidebar"}>
      <Link href={`/guilds/${guild.id}`} className={"sidebarButton"}>ℹ️ Information</Link>
      <Link href={`/guilds/${guild.id}/settings`} className={"sidebarButton"}>⚙️ Settings</Link>
      <Link href={`/guilds/${guild.id}/audit-log`} className={"sidebarButton"}>📖 Audit Log</Link>
      <Link href={`/guilds/${guild.id}/starboard`} className={"sidebarButton"}>⭐ Starboard</Link>
      <Link href={`/guilds/${guild.id}/self-roles`} className={"sidebarButton"}>🖱️ Self-roles</Link>
    </div>
  )
}


export default class GuildPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "information",
      guildData: {id: this.props.params.args[0]},
      loaded: false
    }
    if(this.props.params.args.length > 1) {
      this.state.page = this.props.params.args[1] || "information";
    }
  }

  componentDidMount() {
    async function inner() {
      try {
        const data = await getDiscordGuildData(this.props.params.args[0]);
        this.setState({guildData: data});
      } catch(e) {
        console.error(e);
      }
      try {
        const present = await util.getPresence(this.props.params.args[0]);
        this.setState({guildData: {...this.state.guildData, present}});
      }
      catch(e) {
        console.error(e);
      }
      this.setState({loaded: true});
    }
    inner.bind(this)().then().catch(console.error);
  }

  render() {
    const PageRender = ({_page}) => {
      switch(_page) {
        case "information":
          return <InformationPage guild={this.state.guildData}/>
        case "settings":
          return <SettingsPage guild={this.state.guildData}/>
        default:
          return <p>Unknown page (not created yet?)</p>
      }
    }
    if(!this.state.loaded) return <div><Spinner/></div>

    if(!this.state.guildData.present) {
      return (
        <div className={"home"}>
          <h1>Server not found</h1>
          <p>The server you are looking for could not be found.</p>
          <br/>
          <p>
            Did you want to
            <Link href={`${util.API_URL}/oauth2/invite?guild_id=${this.state.guildData?.id}`}>invite Spanner?</Link>
          </p>
        </div>
      )
    }

    return (
      <main className={"home"}>
        <GuildSidebar page={this.state.page} setPage={(page) => this.setState({page})} guild={this.state.guildData}/>
        <PageRender _page={this.state.page}/>
      </main>
    )
  }
}
