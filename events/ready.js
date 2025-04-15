module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`${client.user.tag} est en ligne !`);
        client.user.setActivity('Protège votre serveur', { type: 'WATCHING' });
    },
};