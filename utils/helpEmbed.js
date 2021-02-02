const GuildSettings = require('../models/guildSettings')
function helpEmbed(page, maxPage, client, botName, commandTypes, author, msg, prefix, command) {
  
  this.page = page
  this.maxPage = maxPage
  this.command = command
  this.client = client
  this.botName = botName
  this.commandTypes = commandTypes
  this.author = author
  this.msg = msg
  this.prefix = prefix
  
  let commands = this.client.commands
  
  if(!this.client.guildPrefixes[this.msg.guildID])
    this.client.registerGuildPrefix(this.msg.guildID, [this.prefix, "@mention"])
  
  this.embed = async function() {
    
    if(this.command) {
      let embed = {}
      if(!commands.hasOwnProperty(command)) return {embed:{title: ":no_entry: Error", description: "This command does not exist", color: 0xff0000}}
      embed.title = `Command Help`
      embed.description = `\`${this.prefix}${commands[this.command].usage}\`\n\n${commands[this.command].fullDescription}`
      if(commands[this.command].aliases[0])
        embed.description += `\n\n**Aliases**: ${commands[this.command].aliases}`
      if(Object.keys(commands[this.command].subcommands).length > 0) {
        embed.description += `\n\n**Subcommands**:`
        let subcommandKeys = Object.keys(commands[this.command].subcommands)
        for(var i in Object.keys(commands[this.command].subcommands)) {
          embed.description += `\n\n\`${this.prefix}${commands[this.command].subcommands[subcommandKeys[i]].usage}\` - ${commands[this.command].subcommands[subcommandKeys[i]].description}`
        }
      }
      embed.color = 0x23c248
      return {embed}
    }

    if(this.page == 1) {

      let embed = {title: `${this.botName} - Categories`}
      embed.color = 0x23c248

      let categories = Object.keys(this.commandTypes)

      let ctn = ''

      for(var i in categories) {
        ctn += `${(i == 0 ? `` : `\n`)}\`${categories[i].charAt(0).toUpperCase() + categories[i].slice(1)}\``
      }

      embed.description = ctn
      embed.footer = {text: `Page ${this.page}/${this.maxPage} | [] = Required () = Optional`}

      return {embed}

    } else {
      
      let categories = Object.keys(this.commandTypes)
      let cmdInCat = this.commandTypes[categories[this.page-2]]
      
      let embed = {title: `${this.botName} Help - ${categories[this.page-2].charAt(0).toUpperCase() + categories[this.page-2].slice(1)}`}
      embed.color = 0x23c248
      
      let cnt = ''

      for(var i in cmdInCat) {
        if(author == 425624104901541888)
          cnt += `${(i == 0 ? `` : `\n\n`)}\`${prefix}${commands[cmdInCat[i]].usage}\` - ${commands[cmdInCat[i]].description}`
        else {
          if(commands[cmdInCat[i]].hidden && i == cmdInCat.length-1)
            cnt += `Nothing to see here!`
          if(!commands[cmdInCat[i]].hidden)
            cnt += `${(i == 0 ? `` : `\n\n`)}\`${prefix}${commands[cmdInCat[i]].usage}\` - ${commands[cmdInCat[i]].description}`
        }
      }
      
      embed.description = cnt
      embed.footer = {text: `Page ${this.page}/${this.maxPage} | [] = Required () = Optional`}
      
      return {embed}

    }
    
  }
  
}

module.exports = helpEmbed