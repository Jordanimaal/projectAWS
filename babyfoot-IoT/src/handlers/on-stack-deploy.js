const { createThing, saveCertificate } = require('../utils/iot');
const { send, SUCCESS, FAILED } = require('../utils/response');
const thingsName = ['team1', 'team2'];

exports.handler = async(event, context) => {
   console.log('event :>>', event);
   try {
      const thingsAndCertificate = new Map();
   
      thingsName.forEach(async (thingName) => {
         const thing = await createThing(thingName);
         const certificateFiles = await saveCertificate(thingName, thing);
   
         if(!thingsAndCertificate.has(thing)){
            thingsAndCertificate.set(thingName, certificateFiles);
         }
      });
   
      if(thingsAndCertificate.size > 0){
         send( event, context, SUCCESS, thingsAndCertificate );
      } else {
         send( event, context, FAILED, thingsAndCertificate );
      }
   } catch (error) {
      console.error('Error ::>', error);
   }
};
