const { deleteThing, deleteThingCertificate, getThing, thingsName} = require('../utils/iot');
const response = require('cfn-response-promise');

exports.handler = async(event, context) => {
   console.log('event :>>', event);
   if(event.RequestType === 'Delete') {
      deleteStack();
   }

   return await response.send(event, context, response.SUCCESS, {});
};

const deleteStack = async() => {
   for (const thingName of thingsName) {
      const thing = await getThing(thingName);
      if(thing) {
         await deleteThing(thingName);
         await deleteThingCertificate(thingName);
      }
   }
};
