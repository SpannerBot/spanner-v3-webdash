"use client";
import {Component} from "react";
import SettingsPage from "./components/settings";
import InformationPage from "./components/information";
import AuditLogPage from "./components/audit-log";
import BigPage from "./components/bigPage";
import Link from "next/link";
import './style.css';
import {getDiscordGuildData, Spinner} from "../../util";
import * as util from "../../util";
import Icon from '@mdi/react';
import { mdiInformationBox, mdiCog, mdiScriptText, mdiStarCog, mdiAccountBox } from '@mdi/js';

function GuildSidebar({guild}) {
  return (
    <div className={"sidebar"}>
      <Link href={`/guilds/${guild.id}`} className={"sidebarButton"}>
        <Icon path={mdiInformationBox} size={1} color={"var(--text-muted)"} className={"emoji"}/>
        <span className={"sideBarText"}>Information</span>
      </Link>
      <Link href={`/guilds/${guild.id}/settings`} className={"sidebarButton"}>
        <Icon path={mdiCog} size={1} color={"var(--text-muted)"} className={"emoji"}/>
        <span className={"sideBarText"}>Settings</span>
      </Link>
      <Link href={`/guilds/${guild.id}/audit-log`} className={"sidebarButton"}>
        <Icon path={mdiScriptText} size={1} color={"var(--text-muted)"} className={"emoji"}/>
        <span className={"sideBarText"}>Audit Log</span>
      </Link>
      <Link href={`/guilds/${guild.id}/starboard`} className={"sidebarButton"}>
        <Icon path={mdiStarCog} size={1} color={"var(--text-muted)"} className={"emoji"}/>
        <span className={"sideBarText"}>Starboard</span>
      </Link>
      <Link href={`/guilds/${guild.id}/self-roles`} className={"sidebarButton"}>
        <Icon path={mdiAccountBox} size={1} color={"var(--text-muted)"} className={"emoji"}/>
        <span className={"sideBarText"}>Self Roles</span>
      </Link>
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
        case "audit-log":
          return <AuditLogPage guild={this.state.guildData}/>
        case "big-page":
          return <BigPage/>
        default:
          return <p>Unknown page (not created yet?)</p>
      }
    }
    let subPage;
    if(!this.state.loaded) {subPage = <div><Spinner/></div>}

    else if(!this.state.guildData.present) {
      subPage = (
        <div>
          <h1>Server not found</h1>
          <p>The server you are looking for could not be found.</p>
          <br/>
          <p>
            Did you want to
            <Link href={`${util.API_URL}/oauth2/invite?guild_id=${this.state.guildData?.id}&return_to=${location}`}>invite Spanner?</Link>
          </p>
        </div>
      )
    }
    else {
      subPage = <PageRender _page={this.state.page}/>
    }

    return (
      <main className={"home"}>
        <GuildSidebar page={this.state.page} setPage={(page) => this.setState({page})} guild={this.state.guildData}/>
        <div className={"content"}>
          {subPage}
        </div>
      </main>
    )
  }
}
