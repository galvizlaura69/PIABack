const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { connectDB, client } = require('./config');
class PiaApi {
    constructor() {
        this.app = express();
        this.port = 3010;
        this.setupRoutes();
    }

    async setupDB() {
        try {
            await connectDB();
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            process.exit(1);
        }
    }

    setupRoutes() {
        this.app.use(express.json());
        this.app.use(cors({
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        this.app.get('/users', (req, res) => this.getUsers(req, res));
        this.app.get('/users/:id', (req, res) => this.getUserById(req, res));
        this.app.post('/users', (req, res) => this.createUser(req, res));
        this.app.put('/users/:id', (req, res) => this.updateUserById(req, res));
        this.app.delete('/users/:id', (req, res) => this.deleteUserById(req, res));
        this.app.get('/sensorData', (req, res) => this.getSensorData(req, res));
        this.app.post('/sensorData', (req, res) => this.createSensorData(req, res));
    }

    createUser = async (req, res) => {
        const { name, email, password } = req.body;
        try {
            const db = client.db();
            const collection = db.collection('users');
            const result = await collection.insertOne({
                name, email, password
            });
            if (result && result.insertedId) {
                const newUser = {
                    _id: result.insertedId,
                    name,
                    email,
                    password
                };
                res.json({ message: 'Usuario creado exitosamente', user: newUser });
            } else {
                console.error('No se pudo crear el usuario');
                throw new Error('No se pudo crear el usuario');
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ message: 'Error al crear usuario' });
        }
    };

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
    };

    getUserById = async (req, res) => {
        const userId = req.params.id;
        const userObjectId = new ObjectId(userId);

        try {
            const db = client.db();
            const collection = db.collection('users');
            const user = await collection.findOne({ _id: userObjectId });
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
            } else {
                res.json({ user });
            }
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            res.status(500).json({ message: 'Error al obtener usuario por ID' });
        }
    };

    deleteUserById = async (req, res) => {
        const userId = req.params.id;
        try {
            const db = client.db();
            const collection = db.collection('users');
            const userObjectId = new ObjectId(userId);

            const result = await collection.deleteOne({ _id: userObjectId });
            if (result.deletedCount === 1) {
                res.json({ message: 'Usuario eliminado exitosamente' });
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error('Error al eliminar usuario por ID:', error);
            res.status(500).json({ message: 'Error al eliminar usuario por ID' });
        }
    };

    updateUserById = async (req, res) => {
        const userId = req.params.id;
        const userObjectId = new ObjectId(userId);

        const { name, email, password } = req.body;

        try {
            const db = client.db();
            const collection = db.collection('users');
            const result = await collection.updateOne(
                { _id: userObjectId },
                { $set: { name, email, password } }
            );
            if (result.modifiedCount === 1) {
                res.json({ message: 'Usuario actualizado exitosamente' });
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error('Error al actualizar usuario por ID:', error);
            res.status(500).json({ message: 'Error al actualizar usuario por ID' });
        }
    };

    getSensorData = async (req, res) => {
        try {
            const db = client.db();
            const collection = db.collection('sensorData');
            const sensorData = await collection.find({}).toArray();
            res.json({ sensorData });
        } catch (error) {
            console.error('Error al obtener lod datos del sensor:', error);
            res.status(500).json({ message: 'Error al obtener lod datos del sensor' });
        }
    };

    createSensorData = async (req, res) => {
        const { co2Level } = req.body;
        const currentDate = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
        try {
            const db = client.db();
            const collection = db.collection('sensorData');
            const result = await collection.insertOne({
                co2Level,
                timestamp: currentDate
            });

            if (result && result.insertedId) {
                const newSensorData = {
                    _id: result.insertedId,
                    co2Level,
                    timestamp: currentDate
                };
                res.json({ message: 'Datos del sensor creados exitosamente', sensorData: newSensorData });
            } else {
                console.error('No se pudieron guardar los datos del sensor');
                throw new Error('No se pudieron guardar los datos del sensor');
            }
        } catch (error) {
            console.error('Error al guardar datos del sensor:', error);
            res.status(500).json({ message: 'Error al guardar datos del sensor' });
        }
    };


    startServer() {
        this.setupDB().then(() => {
            this.app.listen(this.port, () => {
                console.log(`Servidor corriendo en http://localhost:${this.port}`);
            });
        }).catch((error) => {
            console.error('Error al iniciar el servidor:', error);
        });
    }
}

const PiaApiInstance = new PiaApi();
PiaApiInstance.startServer();
