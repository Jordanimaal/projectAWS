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

## Pricing de la table DynamoDb
Cette tables est très "humble" l 'idée est de stocker les matchs en cours ou récemment terminés.
Tous les jours, il y'aura une extraction, ou plutôt une historisation des matchs vers un bucket Amazon S3.
Le poids de la table se mesurant donc en ko, avec une vitesse de lecture et d'écriture de 1 lecture / seconde (minimum possible)
Cette vitesse est largement suffisante pour aller récupérer les données.

En utilisant l'outil de pricing disponible sur Amazon AWS, on obtient, pour la table :
Coût d'écriture mensuel (monthly)
0,58 USD
Coût de lecture mensuel (monthly)
0,12 USD
Coût mensuel total:
0,70 USD
Coût d'écriture initial (upfront)
0,00 USD
Coût de lecture initial (upfront)
0,00 USD
Total des coûts initiaux:
0,00 USD
### Coût mensuel :
1,92 USD
### Coût total sur 12 mois :
23,09 USD

Par ailleurs, il est nécessaire d'ajouter l'option "DynamoDB Data export to Amazon S3"
-> pour un volume de données si bas, cette option est à 0 USD
-> pour avoir un ordre de grandeur, le coût du GO transféré est de  0,1224 USD / mois

On prendre également l'option de backup and restore, également gratuite pour ce volume de données.

## Pricing des buckets S3

### Pour l'historisation des matchs, supposons 1go de données
-> cela ferait plusieurs dizaines de milliers de matchs, mais l'on imaginera que la table d'historique est plus conséquente.
En effet, cete table d'histo pourra être agrémentée de plus de colonnes, pour pouvoir ensuite analyser ces matchs : le nombre de victoire de chaque équipe avant le match, le nombre de buts moyens, l'état de forme ressenti au moment du match, qui serait collecté de manière externe. Ces données permettraient ensuite de mettre en place un algorithme de classification, basé par exemple sur du Random Forest, pour essayer de deviner le gagnant de chaque matche à l'avance.

## Pricing solution de Machine learning "SageMaker"

Config Machine nécessaire : (assez peu puissante car volume de données que l'on estime raisonnable pour le training de l'algorithme)

Compute Type: Standard Instances
V CPU: 2
Memory: 4 GiB
Clock Speed: 3.1 GHz

1 scientifique(s) des données x 2 Instances de bloc-notes Studio = 2,00 Instances de bloc-notes Studio
2,00 Instances de bloc-notes Studio x 1 heures par jour x 30 jours par mois = 60,00 Heures SageMaker Studio Notebook par mois
60,00 heures par mois x 0,058 USD coût d'instance par heure = 3,48 USD (coût mensuel à la demande)
Coût total des bloc-notes Studio (mensuellement): 3.48 USD


## Pricing total de la solution
-> avec 1 table dynamodb "tampon" accessible rapidement et facilement, un historique stocké sur S3, les certifs IOT (négligeable), et la solution de Machine Learning intégrée, recalculée régulièrement :

Coût initial
0,00 USD
Coût mensuel
8,28 USD
Coût total sur 12 mois
99,41 USD


Amazon DynamoDB	0,00 USD	
1,92 USD
Amazon SageMaker	0,00 USD	
6,33 USD
Amazon Simple Storage Service (S3)	0,00 USD	
0,03 USD

-> bien sûr ce pricing est poussé à la hausse : il faudrait jouer beaucoup de matchs pour remplir à ce point l'historique, et surtout la solution de machine learning peut être également implémentée en "local", sans l'aide d' AWS, assez facilement, pour réduire ce qui prend finalement 75% des coûts.



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
