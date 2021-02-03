const Eris = require('eris')
const fetch = require('node-fetch')
const fs = require('fs')
const mongoose = require("mongoose");
const GuildSettings = require('./models/guildSettings')
const config = require('./config.json')

var client = new Eris.CommandClient(config.token, {
  getAllUsers: true,
  intents: ["guildMembers", "guilds", "guildMessages", "guildMessageReactions"]
}, {
  defaultHelpCommand: false,
  description: "A Discord bot that ",
  prefix: [",", "@mention"]
})

mongoose.connect(config.db, {
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

// ---------------------------------------------

const minionUtils = require('./utils/minionUtils.js')


// ---------------------------------------------

const prefixEmbed = require('./utils/prefixEmbed.js')

client.registerCommand("prefix", async (msg, args) => { return new prefixEmbed(client, args, author, msg, prefix).embed() }, {
  permissionMessage: function() {return noPermissionsEmbed()},
  requirements: {
    permissions: {
      "manageGuild": true
    }
  },
  usage: "prefix (new prefix)",
  desription: "Sets the server's prefix",
  fullDescription: "Lets people with the permission `Manage Server` set the server's prefix"
})

// ---------------------------------------------

client.registerCommand("log", async (msg, args) => { console.log("nothing to see here"); return "Logged Results in Console" }, {
  aliases: ["test"],
  permissionMessage: function() {return noPermissionsEmbed()},
  requirements: {
    userIDs: ["425624104901541888"]
  },
  hidden: true,
  usage: 'log',
  description: "Logs to console",
  fullDescription: "Logs a set item into the console. Used by the developer to debug."
})

// ---------------------------------------------

async function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

let evalCommand = client.registerCommand("eval", async (msg, args) => { 
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      return clean(evaled)
    } catch (err) {
      return `\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``
    }
  }, {
  permissionMessage: function() { return noPermissionsEmbed() },
  requirements: {
    userIDs: ["425624104901541888"]
  },
  hidden: true,
  usage: 'eval [command]',
  description: 'Runs a command as the bot',
  fullDescription: 'Runs the command as the bot, allowing the owner to debug certain things.'
})

evalCommand.registerSubcommand("test", async (msg, args) => { return "test" }, {
  permissionMessage: function() {return noPermissionsEmbed()},
  requirements: {
    userIDs: ["425624104901541888"]
  },
  hidden: true,
  usage: 'eval test',
  description: 'test subcommand'
})

await client.connect()