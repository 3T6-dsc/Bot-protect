const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
// Récupération des commandes depuis le dossier commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[ATTENTION] La commande ${filePath} manque la propriété "data" ou "execute" requise.`);
    }
}

// Construction de l'instance REST
const rest = new REST().setToken(process.env.TOKEN);

// Déploiement des commandes
(async () => {
    try {
        console.log(`Début du déploiement de ${commands.length} commandes (/).`);

        // Déploiement des commandes
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Déploiement réussi de ${data.length} commandes (/)`);
    } catch (error) {
        console.error(error);
    }
})();