const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

// Chemin vers le fichier de configuration
const configPath = path.join(__dirname, '..', 'config', 'antirole.json');

// Fonction pour lire la configuration
async function readConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors de la lecture de la configuration:', error);
        return {
            utilisateursAutorises: [
                "1348237994749984808",
                "1302614774089121875"
            ]
        };
    }
}

// Fonction pour sauvegarder la configuration
async function saveConfig(config) {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antirole')
        .setDescription('Gère les utilisateurs autorisés pour l\'anti-rôle')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ajouter')
                .setDescription('Ajoute un utilisateur à la liste des utilisateurs autorisés')
                .addUserOption(option =>
                    option
                        .setName('utilisateur')
                        .setDescription('L\'utilisateur à autoriser')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('retirer')
                .setDescription('Retire un utilisateur de la liste des utilisateurs autorisés')
                .addUserOption(option =>
                    option
                        .setName('utilisateur')
                        .setDescription('L\'utilisateur à retirer')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Affiche la liste des utilisateurs autorisés'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = await readConfig();
        if (!config.utilisateursAutorises.includes(interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Accès Refusé')
                .setDescription('Vous n\'êtes pas autorisé à utiliser cette commande.')
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'ajouter': {
                const user = interaction.options.getUser('utilisateur');
                if (config.utilisateursAutorises.includes(user.id)) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle('⚠️ Utilisateur Déjà Autorisé')
                        .setDescription(`${user.tag} est déjà dans la liste des utilisateurs autorisés.`)
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                config.utilisateursAutorises.push(user.id);
                await saveConfig(config);

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Utilisateur Ajouté')
                    .setDescription(`${user.tag} a été ajouté à la liste des utilisateurs autorisés.`)
                    .addFields(
                        { name: 'ID Utilisateur', value: user.id },
                        { name: 'Ajouté par', value: interaction.user.tag }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'retirer': {
                const user = interaction.options.getUser('utilisateur');
                const index = config.utilisateursAutorises.indexOf(user.id);
                
                if (index === -1) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle('⚠️ Utilisateur Non Trouvé')
                        .setDescription(`${user.tag} n'est pas dans la liste des utilisateurs autorisés.`)
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                if (config.utilisateursAutorises.length === 1) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('⚠️ Action Impossible')
                        .setDescription('Impossible de retirer le dernier utilisateur autorisé.')
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                config.utilisateursAutorises.splice(index, 1);
                await saveConfig(config);

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Utilisateur Retiré')
                    .setDescription(`${user.tag} a été retiré de la liste des utilisateurs autorisés.`)
                    .addFields(
                        { name: 'ID Utilisateur', value: user.id },
                        { name: 'Retiré par', value: interaction.user.tag }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'liste': {
                const userList = await Promise.all(
                    config.utilisateursAutorises.map(async (id) => {
                        try {
                            const user = await interaction.client.users.fetch(id);
                            return `• ${user.tag} (${id})`;
                        } catch {
                            return `• ID invalide: ${id}`;
                        }
                    })
                );

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('📋 Liste des Utilisateurs Autorisés')
                    .setDescription(userList.join('\n'))
                    .setFooter({ text: `Total: ${userList.length} utilisateurs` })
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    },
};



