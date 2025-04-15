const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

// Chemin vers le fichier de configuration
const configPath = path.join(__dirname, '..', 'config', 'antichannel.json');

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

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        // Ignore les canaux DM
        if (!channel.guild) return;

        // Configuration
        const CANAL_LOG_ID = '1358721532339290174';

        console.log(`📝 Nouveau canal créé: ${channel.name}`);

        try {
            // Récupère les logs d'audit
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelCreate,
                limit: 1,
            });

            const channelLog = auditLogs.entries.first();

            if (!channelLog) {
                console.log('❌ Aucun log d\'audit trouvé');
                return;
            }

            console.log(`🔍 Log d'audit trouvé - Exécutant: ${channelLog.executor.tag}`);

            // Vérifie si le log correspond au bon canal
            if (channelLog.target.id !== channel.id) {
                console.log('❌ Le log ne correspond pas au canal créé');
                return;
            }

            // Vérifie si le log n'est pas trop ancien (30 secondes)
            if (channelLog.createdAt < (Date.now() - 30000)) {
                console.log(`❌ Log trop ancien (${Math.floor((Date.now() - channelLog.createdAt) / 1000)} secondes)`);
                return;
            }

            // Vérification pour les bots
            if (channelLog.executor.bot) {
                console.log('🤖 Exécutant est un bot - Action ignorée');
                return;
            }

            // Charge la configuration
            const config = await readConfig();
            console.log('👥 Utilisateurs autorisés:', config.utilisateursAutorises);

            // Vérification des utilisateurs autorisés
            if (config.utilisateursAutorises.includes(channelLog.executor.id)) {
                console.log('✅ Utilisateur autorisé - Action permise');
                return;
            }

            console.log('⚠️ Utilisateur non autorisé détecté');

            // Supprime le canal
            await channel.delete('Protection anti-création de canal');
            console.log('✅ Canal supprimé');

            // Message à l'exécutant
            try {
                await channelLog.executor.send({
                    content: `⚠️ Vous n'êtes pas autorisé à créer des canaux sur le serveur. Le canal \`${channel.name}\` a été supprimé.`
                });
                console.log('✅ Message envoyé à l\'exécutant');
            } catch (error) {
                console.error('❌ Impossible d\'envoyer un message à l\'exécutant:', error);
            }

            // Log dans le canal
            const logChannel = channel.guild.channels.cache.get(CANAL_LOG_ID);
            if (logChannel) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('🛡️ Protection Anti-Création de Canal')
                        .setDescription(`Une tentative non autorisée de création de canal a été détectée et bloquée.`)
                        .addFields(
                            { name: 'Exécutant', value: `${channelLog.executor.tag} (${channelLog.executor.id})`, inline: true },
                            { name: 'Canal', value: `${channel.name} (${channel.id})`, inline: true },
                            { name: 'Type', value: channel.type.toString(), inline: true },
                            { name: 'Action prise', value: 'Le canal a été supprimé' }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Protection Anti-Création de Canal' });

                    await logChannel.send({ embeds: [embed] });
                    console.log('✅ Embed de log envoyé dans le canal');
                } catch (error) {
                    console.error('❌ Erreur lors de l\'envoi du log dans le canal:', error);
                }
            } else {
                console.error('❌ Canal de logs non trouvé');
            }

        } catch (error) {
            console.error('❌ Erreur générale de la protection anti-création de canal:', error);
        }
    },
};