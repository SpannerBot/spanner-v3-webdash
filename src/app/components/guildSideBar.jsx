import {Component} from "react";
import * as util from "../util";
import './guildSideBar.css'
import Link from "next/link";
import Image from "next/image";
import {Spinner} from "../util";
import Icon from '@mdi/react';
import { mdiCloudOffOutline, mdiLogin } from '@mdi/js';

function defaultGuildIconURL(id) {
  return `https://cdn.discordapp.com/embed/avatars/${id % 6}.png`;
}


function guildIconUrl(guild_id, icon_hash) {
  return icon_hash ? `https://cdn.discordapp.com/icons/${guild_id}/${icon_hash}.webp?size=256` : defaultGuildIconURL(guild_id);
}


export default class GuildSideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      guilds: []
    };
  }

  async getGuilds() {
    let guilds;
    try {
      guilds = await util.withBackoff(async () => util.processedGuilds());
    } catch (e) {
      console.error(e);
      guilds = [
        {
          id: -1,
        }
      ];
    }
    this.setState({guilds});
  }

  componentDidMount() {
    if(this.loaded) return;
    this.getGuilds().then(() => {this.setState({loaded: true})}).catch(console.error);
  }

  render() {
    function onError(e) {
      e.target.src = defaultGuildIconURL(e.target.dataset.guild_id || 1);
    }
    if(!this.state.loaded || !this.state.guilds) {
      return (
        <div className={"guild-side-bar"}>
          <div className={"guild-side-bar-inner"}>
            <Spinner size={2}/>
          </div>
        </div>
      )
    }

    let inner = null
    if(this.state.guilds.detail === "LOGIN_REQUIRED") {
      inner = (
        <Link href={util.API_URL + "/oauth2/login?return_to=" + location}>
          <Icon path={mdiLogin} size={2} className={"text-xl icon"} color={"#5865F2"} title={"Login Required"}/>
        </Link>
      )
    }
    else if(this.state.guilds[0].id === -1) {
      inner = (
          <Icon path={mdiCloudOffOutline} size={2} className={"text-xl icon"} color={"#f77"} title={"Error"}/>
      )
    }
    else {
      inner = this.state.guilds?.map((guild) => {
        return (
          <Link href={`/guilds/${guild.id}`} key={guild.id} prefetch={guild.present}>
            <Image
              src={guild.icon_url || guildIconUrl(guild.id, guild.icon)}
              width={50}
              height={50}
              alt={guild.name}
              className={"guild-side-bar-icon icon " + (guild.present ? '' : 'absent')}
              data-guild_id={guild.id}
              title={guild.name}
              disabled={!guild.present}
              onError={onError}
            />
          </Link>
        )
      });
    }

    return (
      <div className={"guild-side-bar"}>
        <div className={"guild-side-bar-inner"}>
          {inner}
        </div>
      </div>
    );
  }
}
