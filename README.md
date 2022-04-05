# Babyfoot Enigma

Comment automatiser les matchs de babyfoot ?


## Description

Comment automatiser les matchs de babyfoot ?

Afin de répondre à cette problématique, nous souhaitons déployer une solution qui permettra de :

- Organiser des matchs en simple ou double grâce à Alexa
- Comptabiliser les scores des joueurs ou des équipes
- Créer des tournois
- Faire des stats

## Choix de l'infrastructure

Table DynamoDB des matches en cours :

- ID (nécessaire pour créer la table, dédoublonner et simplifier les appels à un matche en particulier)
- equipe1
- equipe2 
- score1
- score2 
- statut (état du match : "en cours", "en pause", "abandonné", "terminé")


-> flux de données régulier pour historiqation dans un bucket S3 (json ou csv)

Table historique



## Membres

L'équipe est constitué de 3 développeurs et 1 data qui sont : 

- Vianney BONTE
- Alan DECOURTRAY
- Jordan CORAILLER
- Benjamin CATOUILLARD
