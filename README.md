# M-Verse : Plateforme de Gestion et de Suivi de Medias

M-Verse est une plateforme web permettant de centraliser le suivi de vos films, séries, musiques et jeux vidéo.

## Architecture:
### Frontend : Next.js
### Backend : NestJS, avec Swagger pour la documentation de l'API
### Database : PostgreSQL, schéma de la base de donnée via DrizzleORM

## Le tout via Docker

### Prerequis

* Docker et Docker Compose installés sur votre machine.
* Une clé API The Movie Database (TMDB). (Voir configuration .env)

### Etapes d'installation

1. **Clonage du depot**
   Cloner le repo github, se placer à la racine

2. **Configuration du .env**
   Faire une copie du .env.example et le renommer en .env
   ```bash
   DB_USER=  -> utilisateur par défaut de la database
   DB_PASSWORD= -> mot de passe par défaut de la database, lié à DB_USER
   DB_NAME=mverse_db -> nom par défaut de la database
  
   PGADMIN_EMAIL= -> utilisateur par défaut pour l'accès au panel PGADMIN
   PGADMIN_PASSWORD= -> mot de passe par défault, lié PGADMIN_EMAIL
  
   #A MODIFIER AVEC VOS IDENTIFIANTS DE BASE DE DONNÉES
   DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@db:5432/mverse_db
  
   JWT_SECRET=your_jwt_secret_key -> à modifier, sers pour créer des tokens (pour la connexion et l'identification des utilisateurs sur l'application)
  
   TMDB_API_READONLY= -> le point plus bas détaille l'obtention de la clé API

   Le reste des clés API ne sont pas nécéssaire car les fonctionnalités ne sont pas encore déploiyés et les services sont suceptibles de changer.
   ```
   
3. **Clés API**
   #### TMDB
   La création d'un compte TMDB se fait via ce lien : https://www.themoviedb.org/signup
   Il est nécéssaire de déclarer une application : https://www.themoviedb.org/settings/api
   Il suffit ensuite de coller le Jeton d'accès en lecture à l'API (pas la clé d'API)
   
5. **Déploiment docker**
   ```bash
   docker compose up --build
   ```
   Cette commande permet l'initilisation de l'application web tout en démarrant les différents containers à la fin du build

### Accès au différent services en local:

1. **Frontend**
   Via http://localhost:3001

2. **Backend**
   Via http://localhost:3000
   La documentation Swagger est sur l'IP http://localhost:3000/api

3. **PGADMIN**
   Via http://localhost:8080

   Depuis l'interface pour enregister un database,
   1. Clique droit sur "Server" -> Register -> Le nom n'est pas important
   2. Onglet "Connection" -> Host Address : "db" (nom du service dans le docker-compose.yml"
                          -> Username : Utilisateur PGADMIN du .env
                          -> Password : mot de passe PGADMIN du .env
   3. La navigation se fait en cliquant sur les sous-dossiers du serveur de la database

# Le projet est lancé désormais !


   
