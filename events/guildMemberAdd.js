module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // Vérification anti-raid
        const accountAge = Date.now() - member.user.createdAt;
        const minimumAge = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

        if (accountAge < minimumAge) {
            await member.kick('Compte trop récent - Protection anti-raid');
            // Vous pouvez aussi logger cette action dans un canal spécifique
        }
    },
};