const { Collection, Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Aucune commande ${interaction.commandName} n'a été trouvée.`);
            return;
        }

        // Système de cooldown
        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3; // Cooldown par défaut en secondes
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({ 
                    content: `Merci d'attendre avant de réutiliser la commande \`${command.data.name}\`. Vous pourrez l'utiliser <t:${expiredTimestamp}:R>.`, 
                    ephemeral: true 
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            // Log de l'utilisation de la commande
            console.log(`${interaction.user.tag} a utilisé la commande ${interaction.commandName} dans ${interaction.guild.name}`);
            
            // Exécution de la commande
            await command.execute(interaction);
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}`);
            console.error(error);

            const errorMessage = {
                content: 'Une erreur est survenue lors de l\'exécution de cette commande.',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};