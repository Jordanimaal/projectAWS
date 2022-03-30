const { createThing, saveCertificate, thingsName } = require('../utils/iot');
const response = require('cfn-response-promise');

exports.handler = async(event, context) => {
   console.log('event :>>', event);
   let thingsAndCertificates = new Map();;

   if(event.RequestType === 'Create') {
      thingsAndCertificates = await createStack();
   }

   return await response.send(event, context, response.SUCCESS, thingsAndCertificates);
};


const createStack = async() => {
   const thingsAndCertificates = new Map();
   try {
      for (const thingName of thingsName) {
         const thing = await createThing(thingName);
         const certificateFiles = await saveCertificate(thingName, thing);
   
         if(!thingsAndCertificates.has(thing)){
            thingsAndCertificates.set(thingName, certificateFiles);
         }
      };
      
      return thingsAndCertificates;
   } catch (error) {
      console.error(error);
   }
}
