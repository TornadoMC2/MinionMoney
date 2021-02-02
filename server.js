const Eris = require('eris')
const fetch = require('node-fetch')
const fs = require('fs')
const mongoose = require("mongoose");
const GuildSettings = require('./models/guildSettings')

var client = new Eris.CommandClient(no, {
  getAllUsers: true,
  intents: ["guildMembers", "guilds", "guildMessages", "guildMessageReactions"]
}, {
  defaultHelpCommand: false,
  description: "A Discord bot that gets bazaar stats from Hypixel",
  prefix: [",", "@mention"]
})

mongoose.connect(no, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.on('ready', async () => {
  //console.log('on')
  console.log(`Bot is ready. (${client.guilds.size} Guilds - ${client.users.size} Users)`);
  
})

let prefix = ""

client.on('messageCreate', async (msg) => {

  var storedSettings = await GuildSettings.findOne({ gid: msg.guildID });
  if (!storedSettings) {
    // If there are no settings stored for this guild, we create them and try to retrive them again.
    const newSettings = new GuildSettings({
      gid: msg.guildID
    });
    await newSettings.save().catch(()=>{});
    storedSettings = await GuildSettings.findOne({ gid: msg.guildID });
  }
  
  await client.registerGuildPrefix(msg.guildID, [storedSettings.prefix, "@mention"])
  
  prefix = storedSettings.prefix

})

let commandTypes = {
  general: ["help", "ping"],
  configuration: ["prefix"],
  developer: ["log", "eval"]
}

function noPermissionsEmbed() {
  let embed = {
    title: "Thats not right!",
    description: `You don't have permission to use this command!`,
    color: 0xeb4034
  }
  return {embed}
}
function errorEmbed() {
  let embed = {
    title: "Thats not right!",
    description: `Something Went Wrong`,
    color: 0xeb4034
  }
  return {embed}
}
function incorrectUsageEmbed(usage) {
  let embed = {
    title: "Thats not right!",
    description: `The correct way to use this command is ${prefix}${usage}`,
    color: 0xeb4034
  }
  return {embed}
}


let author = 0;
let botName = "Minion Utilities"

let helpPageNum = 1

//page, maxpage, client, botname, commandTypes, command
const helpEmbed = require('./utils/helpEmbed')

client.registerCommand("help", function(msg, args) { helpPageNum = 1; let maxPages = Object.keys(commandTypes).length+1; author = msg.author.id; return new helpEmbed(helpPageNum, maxPages, client, botName, commandTypes, author, msg, prefix, args[0]).embed() }, {
  usage: 'help (command)',
  description: "Basic Help Command",
  fullDescription: "The default help command used for this bot",
  reactionButtons: [
    {
      emoji: "⏪",
      type: "edit",
      response: (msg, args, user) => {
        
        msg.removeReaction("⏪", author)
        
        helpPageNum = 1
        
        return new helpEmbed(helpPageNum, Object.keys(commandTypes).length+1, client, botName, commandTypes, author, msg, prefix, args[0]).embed()
        
      },
      filter: function(msg, emoji, user) { if(user.id == author) { return true } else { return false } }
    },
    {
      emoji: "◀️",
      type: "edit",
      response: (msg, args, user) => {
        
        msg.removeReaction("◀️", author)
        
        helpPageNum -= 1
        if(helpPageNum < 1) helpPageNum = Object.keys(commandTypes).length+1
        
        
        return new helpEmbed(helpPageNum, Object.keys(commandTypes).length+1, client, botName, commandTypes, author, msg, prefix, args[0]).embed()
        
      },
      filter: function(msg, emoji, user) { if(user.id == author) { return true } else { return false } }
    },
    {
      emoji: "⏹️",
      type: "cancel",
      response: (msg, args, user) => {
        msg.removeReactions()
        //client.createMessage(msg.channel.id, `<@${user.id}>, Session Closed!`)
      },
      filter: function(msg, emoji, user) { if(user.id == author) { return true } else { return false } }
    },
    {
      emoji: "▶️",
      type: "edit",
      response: (msg, args, userID) => {
        
        msg.removeReaction("▶️", author)
        
        helpPageNum += 1
        if(helpPageNum > Object.keys(commandTypes).length+1) helpPageNum = 1
        
        return new helpEmbed(helpPageNum, Object.keys(commandTypes).length+1, client, botName, commandTypes, author, msg, prefix, args[0]).embed()
        
      },
      filter: function(msg, emoji, user) { if(user.id == author) { return true } else { return false } }
    },
    {
      emoji: "⏩",
      type: "edit",
      response: (msg, args, user) => {
        msg.removeReaction("⏩", author)
        
        helpPageNum = Object.keys(commandTypes).length+1
        
        return new helpEmbed(helpPageNum, Object.keys(commandTypes).length+1, client, botName, commandTypes, author, msg, prefix, args[0]).embed()
        
      },
      filter: function(msg, emoji, user) { if(user.id == author) { return true } else { return false } }
    },
    {
      emoji: "❓",
      type: "edit",
      response: (msg, args, user) => {
        if(args[0])
          msg.removeReactions()
        else
          msg.removeReactionEmoji("❓")
      }
    }
  ]
})

// ---------------------------------------------

const pingEmbed = require('./utils/pingEmbed.js')

client.registerCommand("ping", async (msg, args) => { return new pingEmbed(msg).embed() }, {
  description: 'Gives latency of bot',
  fullDescription: 'Returnes a message that gives the latency of the bot in milliseconds',
  usage: 'ping'
})

client.connect()