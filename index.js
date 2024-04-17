// Importando librerías necesarias
const express = require('express'); // Importa Express.js para crear el servidor
const cors = require('cors'); // Importa CORS para permitir peticiones desde otros dominios
const { ObjectId } = require('mongodb'); // Importa ObjectId de MongoDB para trabajar con IDs de documentos

// Importa la función connectDB y el objeto client desde el archivo config.js para conectarse a MongoDB
const { connectDB, client } = require('./config');

// Definición de la clase PiaApi para manejar la API
class PiaApi {
    constructor() {
        this.app = express(); // Inicializa la aplicación Express
        this.port = 3010; // Puerto en el que se ejecutará el servidor
        this.setupRoutes(); // Configura las rutas de la API
    }

    async setupDB() {
        // Conexión a la base de datos MongoDB
        try {
            await connectDB();
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            process.exit(1);
        }
    }

    setupRoutes() {
        // Configuración de middleware y rutas de la API
        this.app.use(express.json()); // Middleware para parsear JSON en las peticiones
        this.app.use(cors({
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        // Definición de las rutas y métodos HTTP correspondientes
        this.app.get('/users', (req, res) => this.getUsers(req, res)); // GET para obtener todos los usuarios
        this.app.get('/users/:id', (req, res) => this.getUserById(req, res)); // GET para obtener un usuario por ID
        this.app.post('/users', (req, res) => this.createUser(req, res)); // POST para crear un usuario
        this.app.put('/users/:id', (req, res) => this.updateUserById(req, res)); // PUT para actualizar un usuario por ID
        this.app.delete('/users/:id', (req, res) => this.deleteUserById(req, res)); // DELETE para eliminar un usuario por ID
        this.app.get('/sensorData', (req, res) => this.getSensorData(req, res)); // GET para obtener datos del sensor
        this.app.post('/sensorData', (req, res) => this.createSensorData(req, res)); // POST para crear datos del sensor
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
        const currentDate = new Date()
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


    // Inicia el servidor después de conectar a la base de datos
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

// Instancia de la clase PiaApi y arranque del servidor
const PiaApiInstance = new PiaApi();
PiaApiInstance.startServer();
