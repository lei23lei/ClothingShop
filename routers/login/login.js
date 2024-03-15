const express = require('express');
const router = express.Router();
const { MongoClient,ObjectId } = require('mongodb');

const url = "mongodb+srv://root:1234@cluster0.y0ac8pa.mongodb.net/";
const databaseName = "Clothings";
const collectionName = "users";

const client = new MongoClient(url, {
    connectTimeoutMS: 10000,
    maxIdleTimeMS: 10000,
});

client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'Incomplete data. Please provide all required fields.' });
        }

        const client = new MongoClient(url);
        await client.connect();

        const db = client.db(databaseName);

        const existingUser = await db.collection(collectionName).findOne({ email });

        if (existingUser) {
            await client.close();
            return res.status(400).json({ error: 'Email already exists. Please use a different email address.' });
        }

        const newUser = {
            firstName,
            lastName,
            email,
            password,
            cart: []
        };

        const result = await db.collection(collectionName).insertOne(newUser);

        await client.close();

        res.status(201).json({ message: 'User signed up successfully!', userId: result.insertedId });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
    


router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Incomplete data. Please provide email and password.' });
        }

        const db = client.db(databaseName);

        const user = await db.collection(collectionName).findOne({ email, password });

        if (user) {
            req.session.userId = user._id;
            console.log("signin successfull", req.session.userId);
            res.json({ message: 'Sign-in successful!', userId: user._id });
        } else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/islogin', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        if (req.session.userId) {
            const client = new MongoClient(url);
            await client.connect();

            const db = client.db(databaseName);

            const user = await db.collection(collectionName).findOne({ _id: new ObjectId(req.session.userId) });

            await client.close();

            if (user) {
                res.json({
                    isLogin: true,
                    userInfo: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        cart: user.cart,
                    },
                });
            } else {
                res.json({ isLogin: false });
            }
        } else {
            res.json({ isLogin: false });
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/signout', async (req, res) => {
    try {
        // destroy the session
        req.session.destroy((error) => {
            if (error) {
                console.error('Error destroying session:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json({ message: 'Sign-out successful!' });
            }
        }); 
    } catch (error) {
        console.error('Error in signout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;










