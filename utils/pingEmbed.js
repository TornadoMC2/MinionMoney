function pingEmbed(msg) {
  
  this.msg = msg
  
  this.embed = function() {
    let embed = {title: "Pong!", description: `${Date.now() - this.msg.createdAt}ms`, color: 0x1be049}
    return {embed}
  }
  
}
module.exports = pingEmbed