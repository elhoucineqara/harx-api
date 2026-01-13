# Docker Configuration - HARX2 Backend

## Fichiers d'environnement

Le Dockerfile copie automatiquement le fichier `.env` dans l'image Docker. 

### Variables d'environnement importantes

Le fichier `.env` contient toutes les variables nécessaires au fonctionnement de l'application :

- **PORT** : Port d'écoute du serveur (défaut: 5000)
- **MONGODB_URI** : URI de connexion à MongoDB
- **JWT_SECRET** : Clé secrète pour les tokens JWT
- **CLOUDINARY_*** : Configuration Cloudinary pour les uploads
- **GOOGLE_*** : Configuration Google Cloud / Vertex AI
- **TWILIO_*** : Configuration Twilio
- **TELNYX_*** : Configuration Telnyx
- Et autres...

### Fichiers de configuration copiés

1. **`.env`** : Fichier d'environnement principal
2. **`config/vertex-service-account.json`** : Credentials Google Cloud (copié via le dossier config)

## Utilisation

### Build de l'image

```bash
docker build -t harx2-backend .
```

Le fichier `.env` sera automatiquement copié dans l'image.

### Exécution

```bash
# Avec le fichier .env monté (recommandé pour le développement)
docker run -p 5000:5000 --env-file .env harx2-backend

# Ou avec docker-compose (charge automatiquement le .env)
docker-compose up
```

### Sécurité en production

⚠️ **Important** : Pour la production, il est recommandé de :

1. **Ne pas inclure le `.env` dans l'image Docker**
2. Utiliser Docker secrets ou des variables d'environnement
3. Utiliser un gestionnaire de secrets (AWS Secrets Manager, HashiCorp Vault, etc.)

Pour exclure le `.env` de l'image, modifiez le `.dockerignore` et utilisez `--env-file` ou des variables d'environnement au runtime.

### Exemple pour la production

```bash
# Build sans .env
docker build -t harx2-backend .

# Run avec variables d'environnement
docker run -p 5000:5000 \
  -e PORT=5000 \
  -e MONGODB_URI=... \
  -e JWT_SECRET=... \
  harx2-backend
```

## Port

Le port par défaut est **5000** (défini dans `.env`). Vous pouvez le modifier en changeant la variable `PORT` dans le fichier `.env`.
