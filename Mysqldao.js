// Import
var pmysql = require('promise-mysql');
var pool;

// Creating a MySQL connection pool 
pmysql.createPool({
    connectionLimit: 3,
    host: 'localhost', 
    user: 'root',
    password: 'root', 
    database: 'proj2023' 
})
.then(p => {
    pool = p; 
})
.catch(err => {
    console.error("pool error:" + err);
});

// Function to retrieve store-related data from the database
var getStores = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store')
            .then((data) => {
                resolve(data); // Resolving the promise with the fetched data
            })
            .catch(error => {
                reject(error); 
            });
    });
}

// Function to add a new store to the database
var addStore = function(sid, location, mgrid) {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO store (sid, location, mgrid) VALUES (?, ?, ?)', [sid, location, mgrid])
            .then((result) => {
                resolve({ sid: result.insertId }); // Resolving with the ID of the newly added store
            })
            .catch((error) => {
                reject(error); 
            });
    });
}

// Async function to update an existing store's details
async function editStore(storeId , mgridNew , locationNew) {
    try {
        const query = 'UPDATE store SET mgrid = ?, location = ? WHERE sid = ?';
        const result = await pool.query(query, [storeId , mgridNew , locationNew]);
        return result; // Returning the result of the update operation
    } catch (error) {
        console.error('Error updating store:', error);
        throw error; 
    }

}// Function to retrieve user-related data from the database
var getProducts = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT ps.productdesc, p.pid, l.sid, l.location, p.Price, ps.supplier FROM product_store p JOIN store l ON p.sid = l.sid JOIN product ps ON p.pid = ps.pid;')
            .then((data) => {
                resolve(data); // Resolving the promise with the fetched data
            })
            .catch(error => {
                reject(error);
            });
    });
}

/*
function deleteProduct(pid) {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM product_store WHERE pid = ?', [pid])
            .then(() => {
                return pool.query('DELETE FROM product WHERE pid = ?', [pid]);
            })
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
}*/

// Async function to retrieve a store by its ID
async function checkStoreById(sid) {
    const result = await pool.query('SELECT * FROM store WHERE sid = ?', [sid]);
    return result.length > 0 ? result[0] : null; // Returning the store if found
}

// Async function to check if a product is present in any store
async function checkProductInStores(pid) {
    const result = await pool.query('SELECT COUNT(*) as count FROM product_store WHERE pid = ?', [pid]);
    return result[0].count > 0; // Returning true if the product is found in any store
}


// Exporting functions for use in other parts of the application
module.exports = {
    getStores, addStore, editStore, getProducts, checkStoreById,checkProductInStores
};
