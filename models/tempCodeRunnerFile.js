const createRiderCollection = async () => {
//   try {
//     await connectToMongoDB(); // Establish a connection to the MongoDB database
//     const connection = mongoose.connection;
//     const collectionExists = await connection.db.listCollections({ name: 'riders' }).hasNext();

//     if (!collectionExists) {
//       await connection.db.createCollection('riders');
//       console.log('Rider collection created.');
//     }
//   } catch (error) {
//     console.error('Error creating rider collection:', error);
//   }
// };
// createRiderCollection();