const MongoClient = require('mongodb').MongoClient;

// Initializing database and collection variables
let db, coll;

// Connect to MongoDB
MongoClient.connect('mongodb://127.0.0.1:27017')
    .then(client => {
        // Set the database and collection
        db = client.db('proj2023MongoDB');
        coll = db.collection('managers');
    })
    .catch(error => console.log(error.message)); 

// Function to find all documents in the managers collection
var findAll = () => new Promise((resolve, reject) => {
    coll.find().toArray()
        .then(resolve)
        .catch(reject);
});

// Function to add a new manager
async function addManager(_id, name, salary) {
    try {
        // Insert new manager
        return await coll.insertOne({ _id, name, salary });
    } catch (error) {
        throw error; // Throw any errors that occur
    }
}


// Export the functions for use in other modules
module.exports = { addManager, findAll};
