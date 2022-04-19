// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require("ask-sdk-core");
const AWS = require("aws-sdk");
const ddbAdapter = require("ask-sdk-dynamodb-persistence-adapter");
const { DocumentClient } = require("aws-sdk/clients/dynamodb");
const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      'Bienvenu sur le skill Babiot-foot! Vous pouvez créer un match grâce à la commande "créer un match"';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "HelloWorldIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Hello World!";
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "You can say hello to me! How can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const  CreerMatchIntentHandler ={
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "CreerMatchIntent"
    );
  },
  handle(handlerInput)  {
    const j1 =
      handlerInput.requestEnvelope.request.intent.slots.equipeUne.value;
    const j2 =
      handlerInput.requestEnvelope.request.intent.slots.equipeDeux.value;
   
    id = 0;
    const paramsRequest = {
      TableName: DYNAMODB_PERSISTENCE_TABLE_NAME,
      ProjectionExpression:"id",
      KeyConditionExpression: "id => :idMinimum",
      ExpressionAttributeValues:{
        ":idMinimum": 0,
      },
      ScanIndexForward: false,
      Key :{
        id: "0"
      }
    };
    
    DocumentClient.query(paramsRequest, function (err, data) {
      if (err) {
        console.log(err); 
        speakOutput =
          "Une erreur est survenue lors de la récupération des données " + err;
      } else {
        id = data.Items.id[0];
        const insertParams = {
            TableName: DYNAMODB_PERSISTENCE_TABLE_NAME,
            Item: {
              id:{S : id+1},
              equipe1: {S: j1},
              equipe2: {S: j2},
              score1: {S: '0'},
              score2: {S: '0'},
              statut: {S: "en cours"}
            }
          }
          ddb.putItem(insertParams, function(err, data) {
            if (err) {
              speakOutput = "Une erreur est survenue lors de la création du match" + err;
            } else {
                speakOutput=' Création du match avec les joueurs '+ j1 +' et '+j2;
            }
          });
      }
    });
    
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const TerminerMatchIntentHandler ={
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "TerminerMatchIntent"
    );
  },
  handle(handlerInput)  {
    const idMatch = handlerInput.requestEnvelope.request.intent.slots.idMatch.value;
    const updateParams = {
      TableName: DYNAMODB_PERSISTENCE_TABLE_NAME,
      Key: {
        id: idMatch
      },
      UpdateExpression: "set statut = :statutMatch",
      ExpressionAttributeValues: {
        ":statutMatch": "terminé"
      }
  };
    ddb.updateItem(updateParams, function(err, data) {
      if (err) {
        console.log(err);
        speakOutput =
          "Une erreur est survenue lors de la mise à jour de l'état du match " + err;
      } else {
        speakOutput = "Le match "+idMatch+" a été terminé";
      }
    });
  },
}

const AjouterPointIntentHandler ={
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AjouterPointIntent"
    );
  },
  handle(handlerInput)  {
    const idMatch = handlerInput.requestEnvelope.request.intent.slots.idMatch.value;
    const joueur = handlerInput.requestEnvelope.request.intent.slots.joueur.value;
    const updateParams = {
      TableName: DYNAMODB_PERSISTENCE_TABLE_NAME,
      Key: {
        id: idMatch
      },

    }
    ddb.updateItem(updateParams, function(err, data) {
      if (err) {
        console.log(err);
        speakOutput =
          "Une erreur est survenue lors de l'ajout du point " + err;
      } else {
        speakOutput = "Un point a été ajouté à l'équipe "+joueur+" pour le match "+idMatch;
      }
    });
  },
}

  
  
// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    CreerMatchIntentHandler,
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    TerminerMatchIntentHandler,
    AjouterPointIntentHandler,

    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(
    new ddbAdapter.DynamoDbPersistenceAdapter({
      tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
      createTable: false,
      dynamoDBClient: new AWS.DynamoDB({
        apiVersion: "latest",
        region: process.env.DYNAMODB_PERSISTENCE_REGION,
      }),
    })
  )
  .lambda();
