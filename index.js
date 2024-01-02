// Importing necessary modules and initializing Express application
const express = require('express');
const mysqldao = require('./Mysqldao');
const mongosao = require('./mongosao');
const app = express();
const bodyParser = require('body-parser');

// Middleware to parse request bodies and setting EJS as the view engine
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); 

// Route to display products, fetching data from MySQL through mysqldao
app.get('/products', (req, res) => {
    mysqldao.getProducts()
        .then((data) => {
            // Rendering the products page with data
            res.render('products', { Users: data });
        })
        .catch((error) => {
            res.send(error);
        });
});

// Route for the homepage with navigation links
app.get('/', (req, res) => {
    res.send("<h1>Homepage</h1> <br><a href='/stores'>Stores</a></br> <a href='/managers'>Managers</a></br> <a href='/products'>Products</a>");
});

// Route to display stores, fetching data from MySQL through mysqldao
app.get('/stores', (req, res) => {
    mysqldao.getStores()
        .then((data) => {
            // Rendering the stores page with data
            res.render('stores', { stores: data });
        })
        .catch((error) => {
            res.send(error);
        });
    
});

// Route to display the form for adding a new store
app.get('/stores/add', (req, res) => {
    res.render('addStore');
});

// Route for handling the submission of the new store form
app.post('/stores/add', async (req, res) => {
    const storeId = req.body.sid;
    const location = req.body.location;
    let managerId = req.body.mgrid;

    try {
        // Validating if the store ID already exists before adding a new store
        const storeIDexists = await mysqldao.checkStoreById(storeId);
        if (storeIDexists) {
            return res.status(400).send('SID already exists');
        }  

        // Adding store and redirecting to the stores list
        await mysqldao.addStore(storeId, location, managerId);
        res.redirect('/stores');
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Routes to update store information and for rendering the update store page

// Route to handle request for the "Update Store" page
app.get('/stores/update/:id', async (req, res) => {
    try {
        // Fetching store details based on the store ID from the URL parameter
        const store = await mysqldao.checkStoreById(req.params.id);

        // Render the 'editStore' view, passing the store details to the template
        res.render('editStore', { store });
    } catch (error) {
    }
});


// Route to handle the form submission for updating store information
app.post('/stores/update/:id', async (req, res) => {
    // Extracting store ID from the URL parameters, manager ID and location from the request body
    const storeId  = req.params.id;
    const mgridNew  = req.body.mgridNew ;
    const locationNew = req.body.locationNew;

    try {
         // Calling the 'editStore' method from mysqldao to update the store information
        const newEdit = await mysqldao.editStore(mgridNew , locationNew, storeId );

        // Check if the update operation resulted in an error, and send an error response if so
        if (newEdit.error) {
            return res.status(400).send(newEdit.error);
        }
        // redirect to stores if a sucess
        res.redirect('/stores');
    } catch (error) {
    }
});

// Route to display the managers, fetching data from MongoDB through mongosao
app.get('/managers', (req, res) => {
    mongosao.findAll()
        .then((documents) => {
            // Rendering the managers page with data from MongoDB
            res.render('managers', { managers: documents });
        })
        .catch((error) => {
        });
});

// Route to handle the deletion of a product with validation if it is in use
app.get('/products/delete/:pid', async (req, res) => {
    const proID = req.params.pid;

    try {
        // Check if the product is in use before deleting
        const productInStore = await mysqldao.checkProductInStores(proID);
        if (productInStore) {       
            return res.status(400).send(proID +" Product is in use" + " </h1><br> <a href='/'>Home</a>");
        }
        // Delete product 
        await mysqldao.deleteProduct(proID);
    } catch (error) {
        console.error('Error', error);
    }
});

// Start the server on port 3000
app.listen(3000, () => console.log('Listening on port 3000.'));