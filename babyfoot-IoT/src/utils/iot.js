const { S3, Iot } = require("aws-sdk");
const s3Client = new S3();
const iotClient = new Iot();

const thingsName = ['team1', 'team2'];

/**
 * Create IoT Things and certificates
 * @param {String} thingName
 * @returns {Object} certificate
 */
const createThing = async(thing) => {
   let certificateCreated = false;
   let policyAttached = false;
   let thingCreated = false;
   let certificate;

   try {
      certificate = await iotClient.createKeysAndCertificate({ setAsActive: true }).promise();
      certificateCreated = true;

      await iotClient.attachPrincipalPolicy({
         policyName: process.env.MQTT_POLICY,
         principal: certificate.certificateArn
      }).promise();
      policyAttached = true;

      await iotClient.createThing({ thingName: thing }).promise();
      thingCreated = true;

      await iotClient.attachThingPrincipal({
         thingName: thing,
         principal: certificate.certificateArn
      }).promise();

      return certificate;
   } catch (error) {
      if(certificateCreated) {
         if(policyAttached){
            await iotClient.detachPrincipalPolicy({
               policyName: process.env.MQTT_POLICY,
               principal: certificate.certificateArn
            }).promise();
         }

         await iotClient.updateCertificate({
            certificateId: certificate.certificateId,
            newStatus: 'INACTIVE'
         }).promise();

         await iotClient.deleteCertificate({
            certificateId: certificate.certificateId,
            forceDelete: true
         }).promise();

         if(thingCreated){
            await iotClient.deleteThing({ thingName: thing }).promise();
         }
      }

      throw error;
   }
};

/**
 * Save certificate to S3 bucket
 * @param {String} thingId 
 * @param {Any} certificate 
 */
const saveCertificate = async(thingId, certificate) => {
   const files = [
      `${thingId}/certificate.pem`,
      `${thingId}/private.pem`
   ];

   const promises = [
      s3Client.putObject({
         Bucket: process.env.BUCKET_NAME,
         Key: files[0],
         Body: certificate.certificatePem
      }).promise(),
      s3Client.putObject({
         Bucket: process.env.BUCKET_NAME,
         Key: files[1],
         Body: certificate.keyPair.PrivateKey
      }).promise(),
   ];

   await Promise.all(promises);

   return files;
}

const getThing = async(thingId) => {
   return iotClient.describeThing({ thingName: thingId }).promise();
};

const deleteThing = async(thingId) => {
   let thing = getThing(thingId);

   if(thing) {
      let principals = await iotClient.listThingPrincipals({ thingName: thingId }).promise();
      for (const principal of principals.principals) {
         let certificateId = principal.split('/')[1];

         await iotClient.detachThingPrincipal({
            thingName: thingId,
            principal: principal
         }).promise();

         await iotClient.detachPrincipalPolicy({
            policyName: process.env.MQTT_POLICY,
            principal: principal
         }).promise();

         await iotClient.updateCertificate({
            certificateId: certificateId,
            newStatus: 'INACTIVE'
         }).promise();

         await iotClient.deleteCertificate({
            certificateId: certificateId,
            forceDelete: true
         }).promise();
      }

      await iotClient.deleteThing({ thingName: thingId }).promise();
   }
};

const deleteThingCertificate = async(thingId) => {
   const objects = [
      { Key: `${thingId}/certificate.pem` },
      { Key: `${thingId}/private.pem` }
   ];

   return s3Client.deleteObjects({
      Bucket: process.env.BUCKET_NAME,
      Delete: {
         Objects: objects
      }
   }).promise();
}

module.exports = { createThing, saveCertificate, getThing, deleteThing, deleteThingCertificate, thingsName };
