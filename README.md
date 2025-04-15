# Anti Channel Bot

Un bot Discord conçu pour protéger les serveurs contre la création massive de salons.

## 🌟 Fonctionnalités

- Protection contre la création massive de salons
- Système d'autorisation pour les utilisateurs de confiance
- Configuration simple via fichier JSON
- Réponse rapide aux tentatives de raid

## 📋 Prérequis

- Node.js 16.11.0 ou plus récent
- Un token de bot Discord
- npm ou un autre gestionnaire de paquets

## 🚀 Installation

1. Clonez le repository
```bash
git clone [URL_DU_REPO]
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez le fichier `.env` avec votre token Discord
```env
TOKEN=votre_token_ici
```

4. Démarrez le bot
```bash
npm start
```

## ⚙️ Configuration

Le fichier `config/antichannel.json` permet de gérer les utilisateurs autorisés :
```json
{
  "utilisateursAutorises": [
    "ID_UTILISATEUR_1",
    "ID_UTILISATEUR_2"
  ]
}
```

## 📦 Dépendances principales

- discord.js
- dotenv
- @discordjs/rest
- @discordjs/builders

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📜 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## ⚠️ Support

Pour obtenir de l'aide ou signaler un bug, veuillez ouvrir une issue sur GitHub.