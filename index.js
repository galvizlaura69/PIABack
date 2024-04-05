const express = require('express');
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
        this.app.post('/users', this.createUser);
        this.app.get('/users', this.getUsers);
    }


    async createUser(req, res) {
        const { nombre, apellido, cedula, contrasena } = req.body;
        try {
            const db = client.db();
            const collection = db.collection('users');
            const result = await collection.insertOne({
                nombre, apellido, cedula, contrasena
            });
            if (result && result.insertedId) {
                const newUser = {
                    _id: result.insertedId,
                    nombre,
                    apellido,
                    cedula
                };
                res.json({ message: 'Usuario creado exitosamente'});
            } else {
                console.error('No se pudo crear el usuario');
                throw new Error('No se pudo crear el usuario');
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ message: 'Error al crear usuario' });
        }
    }
    
    async getUsers(req, res) {
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
