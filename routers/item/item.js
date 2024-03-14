const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const url = "mongodb+srv://root:1234@cluster0.y0ac8pa.mongodb.net/";
const databaseName = "Clothings";
const collectionName = "items";

router.get('/item', async (req, res) => {
    try {
        // Connect to the MongoDB server
        const client = new MongoClient(url);
        await client.connect();

        const db = client.db(databaseName);

        // Retrieve all items from the collection
        const items = await db.collection(collectionName).find({}).toArray();

        // Close the connection
        await client.close();

        // Send the items as a JSON response
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/addToCart', async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        console.log('Received addToCart request:', req.body);

        // Validate the data (you may want to perform more validation)
        if (!userId || !itemId) {
            return res.status(400).json({ error: 'Incomplete data. Please provide userId and itemId.' });
        }

        // Connect to the MongoDB server
        const client = new MongoClient(url);
        await client.connect();

        const db = client.db(databaseName);

        // Check if the item is already in the user's cart
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId), cart: itemId });

        if (user) {
            // If the item is already in the cart, send a response indicating this
            return res.json({ message: 'Item is already in the cart.' });
        }

        // Update the user's cart in the database using $addToSet to avoid duplicates
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { cart: itemId } }
        );

        // Close the connection
        await client.close();

        // Send a response back to the client
        res.json({ message: 'Item added to cart successfully!' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/removeFromCart', async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        console.log('Received removeFromCart request:', req.body);

        // Validate the data
        if (!userId || !itemId) {
            return res.status(400).json({ error: 'Incomplete data. Please provide userId and itemId.' });
        }

        // Connect to the MongoDB server
        const client = new MongoClient(url);
        await client.connect();

        const db = client.db(databaseName);

        // Remove the itemId from the user's cart
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { cart: itemId } }
        );

        // Close the connection
        await client.close();

        // Send a response back to the client
        res.json({ message: 'Item removed from cart successfully!' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/removeAllFromCart', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log('Received removeAllFromCart request:', req.body);

        // Validate the data
        if (!userId) {
            return res.status(400).json({ error: 'Incomplete data. Please provide userId.' });
        }

        // Connect to the MongoDB server
        const client = new MongoClient(url);
        await client.connect();

        const db = client.db(databaseName);

        // Remove all items from the user's cart
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { cart: [] } }
        );

        // Close the connection
        await client.close();

        // Send a response back to the client
        res.json({ message: 'All items removed from cart successfully!' });
    } catch (error) {
        console.error('Error removing all items from cart:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
