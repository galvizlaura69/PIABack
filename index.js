const express = require('express');
const { connectDB, client, ObjectId } = require('./config'); 
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
        this.app.post('/users', (req, res) => this.createUser(req, res));
        this.app.get('/users', (req, res) => this.getUsers(req, res));
        this.app.get('/users/:id', (req, res) => this.getUserById(req, res));
        this.app.delete('/users/:id', (req, res) => this.deleteUserById(req, res));
        this.app.put('/users/:id', (req, res) => this.updateUserById(req, res));
    }

    createUser = async (req, res) => {
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

/*     getUserById = async (req, res) => {
        const userId = req.params.id;
        try {
            const db = client.db();
            const collection = db.collection('users');
            const user = await collection.findOne({ _id: ObjectId(userId) });
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
            const result = await collection.deleteOne({ _id: ObjectId(userId) });
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
        const { nombre, apellido, cedula, contrasena } = req.body;
        try {
            const db = client.db();
            const collection = db.collection('users');
            const result = await collection.updateOne(
                { _id: ObjectId(userId) },
                { $set: { nombre, apellido, cedula, contrasena } }
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
    }; */

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
