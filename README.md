# BabIoTFoot Enigma

Connecter un babyfoot à des services Cloud.

## Description

Comment automatiser les matchs de babyfoot ?

Afin de répondre à cette problématique, nous souhaitons déployer une solution qui permettra de :

  - Organiser des matchs en simple ou double grâce à Alexa
  - Comptabiliser les scores des joueurs ou des équipes


Dans le cas où nous serions en avance, nous avons prévu des fonctionnalités supplémentaires telles que : 

  - Créer des tournois
  - Faire des stats

## Membres

L'équipe est constitué de 3 développeurs et 1 data qui sont : 

- Vianney BONTE
- Alan DECOURTRAY
- Jordan CORAILLER
- Benjamin CATOUILLARD

## Choix de l'infrastructure

Table `DynamoDB` des matches en cours :

- ID (nécessaire pour créer la table, dédoublonner et simplifier les appels à un matche en particulier)
- equipe1
- equipe2 
- score1
- score2 
- statut (état du match : "en cours", "en pause", "abandonné", "terminé")


Deux buckets `S3` pour :

  - faire un historique des matchs
  - stocker les certificats IoT

> Flux de données régulier pour historisation dans un bucket S3 (json ou csv)

Une Policy `MQTT` pour que les objets IoT puissent communiquer 

Deux fonctions `Lambda` pour :

 - Créer les objets IoT et les certificats au déploiement de la stack
 - Supprimer les objets IoT et les certificats lors de la suppression de la stack

 Deux `Custom Resources` pour :

  - Déclencher la création des objets IoT
  - Déclencher la suppression des objets IoT

### Installation de la stack AWS

> Afin d'installer la stack se trouvant dans le dossier `babyfoot-IoT`, il vous faudra AWS CLI et SAM CLI.

Pour déployer la stack, il vous suffit de lancer les commandes suivantes :

```bash
$ sam build
$ sam deploy
```

## Choix du back-end 

Afin de communiquer avec l'interface Web qui permet de visualiser les matchs en cours et un classement des joueurs en fonction du nombre de matchs gagnés.
Nous avions décidé de créer une `API Gateway` en Websocket qui permettra de communiquer avec le front-end.

L'API Gateway est découpée en plusieurs routes :

  - $connect : permet de se connecter au serveur WebSocket
  - $disconnect : permet de se déconnecter du serveur WebSocket
  - rank : permet de récupérer le classement des joueurs
  - inprogress : permet de récupérer les matchs en cours et en pause

## Choix du front-end

Pour le front-end, j'ai décidé de créer une interface Web avec VueJS tout en utilisant une surcouche appelé NuxtJS qui est un framework de VueJS.

Vous pourrez retrouver le code source sur [Github](https://github.com/bcatouillard/babIOTfootWeb).

Un README est disponible sur le repository du front-end afin d'expliquer comment le mettre en place.
