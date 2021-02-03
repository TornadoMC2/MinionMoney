const GuildSettings = require('../models/guildSettings')
function prefixEmbed(client, args, author, msg, prefix) {
  
  this.client = client
  this.args = args
  this.author = author
  this.msg = msg
  this.prefix = prefix
  
  let defaultPrefix = this.client.commandOptions.prefix[0]
  
  if(!this.client.guildPrefixes[this.msg.guildID])
    this.client.registerGuildPrefix(this.msg.guildID, [defaultPrefix, "@mention"])
  
  this.embed = async function() {
    if(!this.args[0]) {
      let embed = {title: "Bot Prefix", description: `My prefix for this server is \`${this.client.guildPrefixes[this.msg.guildID][0]}\``, color: 0x23c248}
      return {embed}
    } else {
      
      await this.client.registerGuildPrefix(this.msg.guildID, [this.args[0], "@mention"])
      
      var storedSettings = await GuildSettings.findOne({ gid: this.msg.guildID });
      if (!storedSettings) {
        // If there are no settings stored for this guild, we create them and try to retrive them again.
        const newSettings = new GuildSettings({
          gid: this.msg.guildID
        });
        await newSettings.save().catch(()=>{});
        storedSettings = await GuildSettings.findOne({ gid: this.msg.guildID });
      }
      
      storedSettings.prefix = this.args[0]
      await storedSettings.save().catch(()=>{});
      
      let embed = {title: "Prefix Changed Successfully!", description: `My new prefix for this server is \`${storedSettings.prefix}\``, color: 0x23c248}
      return {embed}
    }
  }
    
}
module.exports = prefixEmbed