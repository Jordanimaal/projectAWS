const { S3, Iot } = require("aws-sdk");
const s3Client = new S3();
const iotClient = new Iot();

/**
 * Create IoT Things and certificates
 * @returns {Object} certificate
 */
const createThing = async() => {
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

      console.error('Error ::>', error);
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

   const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${thingId}/certificate.pem`,
      Body: certificate.certificatePem
   };

   await s3Client.putObject(params).promise();

   params.Key = `${thingId}/private.pem`;
   params.Body = certificate.keyPair.PrivateKey;

   await s3Client.putObject(params).promise();

   return files;
}

module.exports = { createThing, saveCertificate };
