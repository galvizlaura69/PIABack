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
        // Método para crear un usuario
        const { name, email, password } = req.body; // Obtiene los datos del cuerpo de la solicitud
        try {
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('users'); // Obtiene la colección de usuarios
            const result = await collection.insertOne({ // Inserta un nuevo usuario en la base de datos
                name, email, password
            });
            if (result && result.insertedId) { // Verifica si se creó correctamente el usuario
                const newUser = {
                    _id: result.insertedId,
                    name,
                    email,
                    password
                };
                res.json({ message: 'Usuario creado exitosamente', user: newUser }); // Respuesta exitosa
            } else {
                console.error('No se pudo crear el usuario'); // Error al crear el usuario
                throw new Error('No se pudo crear el usuario');
            }
        } catch (error) {
            console.error('Error al crear usuario:', error); // Manejo de errores
            res.status(500).json({ message: 'Error al crear usuario' });
        }
    };
    
    getUsers = async (req, res) => {
        // Método para obtener todos los usuarios
        try {
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('users'); // Obtiene la colección de usuarios
            const users = await collection.find({}).toArray(); // Obtiene todos los usuarios de la base de datos
            res.json({ users }); // Devuelve la lista de usuarios
        } catch (error) {
            console.error('Error al obtener usuarios:', error); // Manejo de errores
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    };
    getUserById = async (req, res) => {
        // Método para obtener un usuario por su ID
        const userId = req.params.id; // Obtiene el ID del usuario de los parámetros de la URL
        const userObjectId = new ObjectId(userId); // Convierte el ID en un ObjectId de MongoDB
    
        try {
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('users'); // Obtiene la colección de usuarios
            const user = await collection.findOne({ _id: userObjectId }); // Busca el usuario por su ID en la base de datos
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' }); // Si no se encuentra el usuario, devuelve un error 404
            } else {
                res.json({ user }); // Devuelve el usuario encontrado
            }
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error); // Manejo de errores
            res.status(500).json({ message: 'Error al obtener usuario por ID' });
        }
    };
    
    deleteUserById = async (req, res) => {
        // Método para eliminar un usuario por su ID
        const userId = req.params.id; // Obtiene el ID del usuario de los parámetros de la URL
        try {
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('users'); // Obtiene la colección de usuarios
            const userObjectId = new ObjectId(userId); // Convierte el ID en un ObjectId de MongoDB
    
            const result = await collection.deleteOne({ _id: userObjectId }); // Elimina el usuario de la base de datos
            if (result.deletedCount === 1) {
                res.json({ message: 'Usuario eliminado exitosamente' }); // Respuesta exitosa
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' }); // Si el usuario no se encuentra, devuelve un error 404
            }
        } catch (error) {
            console.error('Error al eliminar usuario por ID:', error); // Manejo de errores
            res.status(500).json({ message: 'Error al eliminar usuario por ID' });
        }
    };
    
    updateUserById = async (req, res) => {
        // Método para actualizar un usuario por su ID
        const userId = req.params.id; // Obtiene el ID del usuario de los parámetros de la URL
        const userObjectId = new ObjectId(userId); // Convierte el ID en un ObjectId de MongoDB
    
        const { name, email, password } = req.body; // Obtiene los nuevos datos del usuario
    
        try {
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('users'); // Obtiene la colección de usuarios
            const result = await collection.updateOne(
                { _id: userObjectId }, // Filtra por el ID del usuario a actualizar
                { $set: { name, email, password } } // Actualiza los datos del usuario
            );
            if (result.modifiedCount === 1) {
                res.json({ message: 'Usuario actualizado exitosamente' }); // Respuesta exitosa
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' }); // Si el usuario no se encuentra, devuelve un error 404
            }
        } catch (error) {
            console.error('Error al actualizar usuario por ID:', error); // Manejo de errores
            res.status(500).json({ message: 'Error al actualizar usuario por ID' });
        }
    };
    
    getSensorData = async (req, res) => {
        // Método para obtener datos del sensor
        try {
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('sensorData'); // Obtiene la colección de datos del sensor
            const sensorData = await collection.find({}).toArray(); // Obtiene todos los datos del sensor
            res.json({ sensorData }); // Devuelve los datos del sensor
        } catch (error) {
            console.error('Error al obtener los datos del sensor:', error); // Manejo de errores
            res.status(500).json({ message: 'Error al obtener los datos del sensor' });
        }
    };
    
    createSensorData = async (req, res) => {
        // Método para crear datos del sensor
        const { co2Level } = req.body; // Obtiene el nivel de CO2 del cuerpo de la solicitud
        const currentDate = new Date(); // Obtiene la fecha y hora actuales
    
        try {
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('sensorData'); // Obtiene la colección de datos del sensor
            const result = await collection.insertOne({
                co2Level,
                timestamp: currentDate // Agrega la marca de tiempo al dato del sensor
            });
    
            if (result && result.insertedId) {
                const newSensorData = {
                    _id: result.insertedId,
                    co2Level,
                    timestamp: currentDate
                };
                res.json({ message: 'Datos del sensor creados exitosamente', sensorData: newSensorData }); // Respuesta exitosa
            } else {
                console.error('No se pudieron guardar los datos del sensor'); // Error al guardar los datos del sensor
                throw new Error('No se pudieron guardar los datos del sensor');
            }
        } catch (error) {
            console.error('Error al guardar datos del sensor:', error); // Manejo de errores
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
