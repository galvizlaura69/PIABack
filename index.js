const express = require('express');
const { connectDB, client } = require('./config');

class PiaApi {
    constructor() {
        this.app = express();
        this.port = 3010;
        this.setupRoutes();
    }

    setupDB = async () => {
        await connectDB();
    }

    setupRoutes = () => {
        this.app.use(express.json());
        this.app.post('/users', this.createUser);
        this.app.get('/users', this.getUsers);
    }

    createUser = async (req, res) => {
        const {
            name,
            lastname,
            email,
            password,
            passwordConfirm,
            identificate
        } = req.body;
        try {
            const db = client.db();
            const collection = db.collection('users');
            const result = await collection.insertOne({
                name,
                lastname,
                email,
                password,
                passwordConfirm,
                identificate,
            });
            const newUser = result.ops[0];
            res.json({ message: 'Usuario creado exitosamente', data: newUser });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ message: 'Error al crear usuario' });
        }
    }

    getUsers = async (req, res) => {
        try {
            const db = client.db();
            const collection = db.collection('users');

            const users = await collection.find({}).toArray();
            res.json({ users });
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }

    startServer = () => {
        this.setupDB().then(() => {
            this.app.listen(this.port, () => {
                console.log(`Server is running on port http://localhost:${this.port}`);
            });
        });
    }
}

const PiaApiInstance = new PiaApi();
PiaApiInstance.startServer();
