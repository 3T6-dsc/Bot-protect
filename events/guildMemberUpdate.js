const { Events, PermissionsBitField, AuditLogEvent, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs').promises;

// Chemin vers le fichier de configuration
const configPath = path.join(__dirname, '..', 'config', 'antirole.json');

// Fonction pour lire la configuration
async function readConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        console.log('📖 Configuration anti-role chargée:', data);
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Erreur lors de la lecture de la configuration anti-role:', error);
        return {
            utilisateursAutorises: []
        };
    }
}

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        // Configuration
        const CITOYEN_ROLE_ID = '1359220051550535892';
        const ROLES_AUTORISES = [
            CITOYEN_ROLE_ID,
        ];
        const CANAL_LOG_ID = '1358721016553017344';

        console.log(`👤 Mise à jour du membre: ${newMember.user.tag}`);
        console.log(`📊 Anciens rôles: ${oldMember.roles.cache.size} | Nouveaux rôles: ${newMember.roles.cache.size}`);

        // Vérifie si des rôles ont été ajoutés
        if (newMember.roles.cache.size > oldMember.roles.cache.size) {
            console.log('➕ Détection d\'ajout de rôle(s)');
            try {
                // Charge la configuration
                const config = await readConfig();
                console.log('👥 Utilisateurs autorisés:', config.utilisateursAutorises);

                // Récupère les logs d'audit
                const auditLogs = await newMember.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberRoleUpdate,
                    limit: 1,
                });
                
                const roleUpdateLog = auditLogs.entries.first();
                
                if (!roleUpdateLog) {
                    console.log('❌ Aucun log d\'audit trouvé');
                    return;
                }

                console.log(`🔍 Log d'audit trouvé - Exécutant: ${roleUpdateLog.executor.tag}`);

                if (roleUpdateLog.target.id !== newMember.id) {
                    console.log('❌ Le log ne correspond pas au membre ciblé');
                    return;
                }

                // Augmentons la fenêtre de temps à 30 secondes au lieu de 5
                if (roleUpdateLog.createdAt < (Date.now() - 30000)) {
                    console.log(`❌ Log trop ancien (${Math.floor((Date.now() - roleUpdateLog.createdAt) / 1000)} secondes)`);
                    return;
                }

                // Vérification pour les bots
                if (roleUpdateLog.executor.bot) {
                    console.log('🤖 Exécutant est un bot - Action ignorée');
                    return;
                }

                // Vérification des utilisateurs autorisés
                if (config.utilisateursAutorises.includes(roleUpdateLog.executor.id)) {
                    console.log('✅ Utilisateur autorisé - Action permise');
                    return;
                }

                console.log('⚠️ Utilisateur non autorisé détecté');

                // Trouve les nouveaux rôles ajoutés
                const nouveauxRoles = newMember.roles.cache.filter(role => 
                    !oldMember.roles.cache.has(role.id) && 
                    !ROLES_AUTORISES.includes(role.id)
                );

                console.log('🎭 Nouveaux rôles:', nouveauxRoles.map(r => r.name).join(', '));

                // Si des rôles non autorisés ont été ajoutés
                if (nouveauxRoles.size > 0) {
                    console.log('🛡️ Début de l\'application des sanctions');
                    try {
                        // Pour la cible (newMember)
                        for (const role of nouveauxRoles.values()) {
                            try {
                                await newMember.roles.remove(role, 'Protection anti-rôle - Retrait des nouveaux rôles');
                                console.log(`✅ Rôle retiré: ${role.name}`);
                            } catch (error) {
                                console.error(`❌ Impossible de retirer le rôle ${role.name}:`, error);
                            }
                        }

                        // Pour l'exécutant
                        try {
                            const executant = await newMember.guild.members.fetch(roleUpdateLog.executor.id);
                            console.log(`👤 Sanction de l'exécutant: ${executant.user.tag}`);

                            const executantRoles = executant.roles.cache
                                .filter(role => role.id !== executant.guild.id)
                                .filter(role => role.id !== '1358365368363520072')
                                .filter(role => role.position < newMember.guild.members.me.roles.highest.position);

                            for (const role of executantRoles.values()) {
                                try {
                                    await executant.roles.remove(role, 'Protection anti-rôle - Sanction');
                                    console.log(`✅ Rôle retiré à l'exécutant: ${role.name}`);
                                } catch (error) {
                                    console.error(`❌ Impossible de retirer le rôle ${role.name}:`, error);
                                }
                            }

                            await executant.roles.add(CITOYEN_ROLE_ID, 'Protection anti-rôle - Attribution du rôle Citoyen');
                            console.log('✅ Rôle Citoyen ajouté à l\'exécutant');
                        } catch (error) {
                            console.error('❌ Erreur lors de la sanction de l\'exécutant:', error);
                        }

                        // Message à l'exécutant
                        try {
                            await roleUpdateLog.executor.send({
                                content: `⚠️ Vous n'êtes pas autorisé à attribuer des rôles. Vos rôles ont été réinitialisés au rôle Citoyen en conséquence.`
                            });
                            console.log('✅ Message envoyé à l\'exécutant');
                        } catch (error) {
                            console.error('❌ Impossible d\'envoyer un message à l\'exécutant:', error);
                        }

                        // Log dans le canal
                        const logChannel = newMember.guild.channels.cache.get(CANAL_LOG_ID);
                        console.log('📝 Canal de logs trouvé:', !!logChannel, 'ID:', CANAL_LOG_ID);
                        
                        if (logChannel) {
                            try {
                                const embed = new EmbedBuilder()
                                    .setColor(0xFF0000)
                                    .setTitle('🛡️ Protection Anti-Rôle')
                                    .setDescription(`Une tentative non autorisée d'attribution de rôle a été détectée et bloquée.`)
                                    .addFields(
                                        { name: 'Exécutant', value: `${roleUpdateLog.executor.tag} (${roleUpdateLog.executor.id})`, inline: true },
                                        { name: 'Cible', value: `${newMember.user.tag} (${newMember.id})`, inline: true },
                                        { name: 'Rôles concernés', value: nouveauxRoles.map(r => r.name).join(', ') || 'Aucun' },
                                        { name: 'Actions prises', value: 
                                            `• Retrait des nouveaux rôles pour la cible\n` +
                                            `• Réinitialisation au rôle Citoyen pour l'exécutant`
                                        }
                                    )
                                    .setTimestamp()
                                    .setFooter({ text: 'Protection Anti-Rôle' });

                                await logChannel.send({ embeds: [embed] });
                                console.log('✅ Embed de log envoyé dans le canal');
                            } catch (error) {
                                console.error('❌ Erreur lors de l\'envoi du log dans le canal:', error);
                            }
                        } else {
                            console.error('❌ Canal de logs non trouvé. ID configuré:', CANAL_LOG_ID);
                        }
                    } catch (error) {
                        console.error('❌ Erreur lors de l\'application des sanctions:', error);
                    }
                }
            } catch (error) {
                console.error('❌ Erreur générale de la protection anti-rôle:', error);
            }
        }
    },
};




