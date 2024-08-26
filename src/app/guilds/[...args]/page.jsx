"use client";
import {Component} from "react";
import SettingsPage from "./components/settings";
import InformationPage from "./components/information";
import Link from "next/link";
import './style.css';
import {getDiscordGuildData} from "../../util";

function GuildSidebar({guild}) {
  return (
    <div className={"sidebar"}>
      <div className={"sidebarButton"}>
        <Link href={`/guilds/${guild.id}`}>ℹ️ Information</Link>
      </div>
      <div className={"sidebarButton"}>
        <Link href={`/guilds/${guild.id}/settings`}>⚙️ Settings</Link>
      </div>
      <div className={"sidebarButton"}>
        <Link href={`/guilds/${guild.id}/audit-log`}>📖 Audit Log</Link>
      </div>
      <div className={"sidebarButton"}>
        <Link href={`/guilds/${guild.id}/starboard`}>⭐ Starboard</Link>
      </div>
      <div className={"sidebarButton"}>
        <Link href={`/guilds/${guild.id}/self-roles`}>🖱️ Self-roles</Link>
      </div>
    </div>
  )
}


export default class GuildPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "information",
      guildData: {id: this.props.params.args[0]}
    }
    if(this.props.params.args.length > 1) {
      this.state.page = this.props.params.args[1] || "information";
    }
  }

  componentDidMount() {
    getDiscordGuildData(this.props.params.args[0])
      .then((data) => this.setState({guildData: data}))
      .catch(console.error);
  }

  render() {
    const PageRender = ({_page}) => {
      switch(_page) {
        case "information":
          return <InformationPage guild={this.state.guildData}/>
        case "settings":
          return <SettingsPage guild={this.state.guildData}/>
        default:
          return <p>Unknown page</p>
      }
    }

    return (
      <main className={"home"}>
        <GuildSidebar page={this.state.page} setPage={(page) => this.setState({page})} guild={this.state.guildData}/>
        <PageRender _page={this.state.page}/>
      </main>
    )
  }
}
