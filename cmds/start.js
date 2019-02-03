const Discord = require('discord.js');
const Listing = require ('./../modules/Listing');
const fs = require('fs');


module.exports.run = async (bot, message, args) => {
    let snipeChannel = message.channel; 
    const filter = m => !m.author.bot;
    let game = new Listing();

    let raw = fs.readFileSync('./roles.json');
    let allowedRoles = JSON.parse(raw);
    
    let validation = function(serverRoles, userroles){
        let val = false;
        serverRoles.forEach((role) => {
            userroles.forEach((usr) => {
                if (role == usr){
                    val = true;
                }
            });
        });
        return val;
}

    let editLast3 = null;

    let startMessage = new Discord.RichEmbed()
        .setTitle("Fortnite Scrims")
        .setDescription("Please type the 3 last codes from your server id")
        .setColor("#00FF00")
        .setFooter("Team Ace Scrims");
        
    message.channel.send({embed: startMessage});

    let time = 30;
    let editTime = "";

    let timeEmbed = new Discord.RichEmbed()
        .setTitle("Next match in approximately...")
        .setDescription(time + " minutes")
        .setColor("#00FF00");

    setTimeout(async () => {
        editTime = await message.channel.send({embed: timeEmbed}).catch( (err) => {
            console.log("cant edit deleted message");
        });
    }, 10);

    let timeInterval = setInterval(() => {
        if (time === 1){
            time -= 1;
            timeEmbed.setDescription(time + " minutes");
            clearInterval(timeInterval);
        }else {
            time -=1;
            timeEmbed.setDescription(time + " minutes");

        }

        editTime.edit({embed: timeEmbed}).catch((err) => {
            console.log("cant edit");
            clearIntervals(timeInterval);
        });

    }, 60000);

    let last3 = new Discord.RichEmbed()
    .setTitle("last 3 code")
    .setColor("#00FF00")

    setTimeout(async () => {
        editLast3 = await message.channel.send({embed: last3});
    }, 10);

    const collector = snipeChannel.createMessageCollector(filter, {max: 200, maxMatches: 200, time: 180000});

    collector.on('collect', m => {

        console.log(`Collected ${m.content} | ${m.author.username}`);

        if (validation(allowedRoles.roles,m.member.roles.array())){
            if (m.content === "!start"){
                collector.stop();
                console.log("Collector stopped");
                return;
            }
        } 
        if (game.data.length === 0 && m.content.length === 3){
            game.addID(m.content.toUpperCase(), m.author.username);
        }else if (m.content.length === 3){
            if (game.userPresent(m.author.username)){
                game.deleteuserentry(m.author.username);

                if (game.idPresent(m.content.toUpperCase())){
                    game.addUser(m.content.toUpperCase(), m.author.username);
                }else {
                    game.addID(m.content.toUpperCase(), m.author.username);
                }
            } else {
                if (game.idPresent(m.content.toUpperCase())){
                    game.addUser(m.content.toUpperCase(), m.author.username);
                } else {
                    game.addID(m.content.toUpperCase(), m.author.username)
                }
            }
        }

        game.Sort();

        let str = "";
        last3 = new Discord.RichEmbed()
            .setTitle("Last 3 gamecodes")
            .setColor("#00FF00");

        for (var i = 0; i < game.data.length; i++){
            str = "";
            for (var j = 0; j < game.data[i].users.length ; j++){
                str += game.data[i].users[j] + "\n";
            }
            last3.addField(`${game.data[i].id.toUpperCase()} - ${game.data[i].users.length} Player`, str, true);
        }

        editLast3.edit({embed: last3}).catch((err) => {
            console.log("Caught edit error");
        });

        if (m.deletable){
            m.delete().catch((err) => {
                console.log("Cant delete");
                console.log(err);
            });
        }

    });

    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
    });
    
    
    

    

    
    


}



module.exports.help = {
    name: "start"
}