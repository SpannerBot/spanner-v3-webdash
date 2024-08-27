
import Link from "next/link";
import './guildSelect.css'
import Image from "next/image";

export default function GuildSelect({guilds}) {
  return (
    <div>
      <h1>Select a server:</h1>
      <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
        <div className={"guildSelect"}>
          {
            guilds.map((guild) => (
              <div key={guild.id}>
                <Link href={guild.present ? `/guilds/${guild.id}` : `https://discord.com/oauth2/authorize?client_id=1237136674451099820&permissions=17180256320&integration_type=0&scope=bot&guild_id=${guild.id}`}>
                  <Image src={guild.icon_url} alt={guild.name} title={guild.name} className={guild.present ? 'guildPresent' : 'guildAbsent'} width={64} height={64}/>
                </Link>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}