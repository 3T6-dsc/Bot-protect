# Discord Protection Bot

Un bot Discord conçu pour protéger les serveurs contre la création massive de salons et la gestion non autorisée des rôles.

## 🌟 Fonctionnalités

### Protection Anti-Channel
- Surveillance de la création de salons
- Système d'autorisation pour les utilisateurs de confiance
- Protection contre la création massive de salons
- Réponse rapide aux tentatives de raid

### Protection Anti-Rôle
- Surveillance des modifications de rôles
- Liste blanche d'utilisateurs autorisés
- Protection contre l'attribution non autorisée de rôles
- Annulation automatique des modifications non autorisées

## 📋 Prérequis

- Node.js 16.11.0 ou plus récent
- Un token de bot Discord
- npm ou un autre gestionnaire de paquets

## 🚀 Installation

1. Clonez le repository
```bash
git clone https://github.com/3T6-dsc/Bot-protect.git
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez le fichier `.env` avec vos informations
```env
TOKEN=votre_token_ici
CLIENT_ID=ID_DU_BOT
```

4. Démarrez le bot
```bash
npm start
```

## ⚙️ Configuration

### Anti-Channel
Le fichier `config/antichannel.json` permet de gérer les utilisateurs autorisés à créer des salons :
```json
{
  "utilisateursAutorises": [
    "ID_UTILISATEUR_1",
    "ID_UTILISATEUR_2"
  ]
}
```

### Anti-Rôle
Le fichier `config/antirole.json` permet de gérer les utilisateurs autorisés à modifier les rôles :
```json
{
  "utilisateursAutorises": [
    "ID_UTILISATEUR_1",
    "ID_UTILISATEUR_2"
  ]
}
```

## 🛠️ Commandes

### Commandes Anti-Channel
- `/antichannel ajouter` - Ajoute un utilisateur à la liste des autorisations
- `/antichannel retirer` - Retire un utilisateur de la liste des autorisations
- `/antichannel liste` - Affiche la liste des utilisateurs autorisés

### Commandes Anti-Rôle
- `/antirole ajouter` - Ajoute un utilisateur à la liste des autorisations
- `/antirole retirer` - Retire un utilisateur de la liste des autorisations
- `/antirole liste` - Affiche la liste des utilisateurs autorisés

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
