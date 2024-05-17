const express = require('express'); // Importa Express.js para crear el servidor
const cors = require('cors'); // Importa CORS para permitir peticiones desde otros dominios
const { ObjectId } = require('mongodb'); // Importa ObjectId de MongoDB para trabajar con IDs de documentos
const fs = require('fs');
// Importa la función connectDB y el objeto client desde el archivo config.js para conectarse a MongoDB
const { connectDB, client } = require('./config');
const multer = require('multer');


// Definición de la clase PiaApi para manejar la API
class PiaApi {
    constructor() {
        this.app = express(); // Inicializa la aplicación Express
        this.port = process.env.PORT || 3010; // Puerto en el que se ejecutará el servidor
        this.setupRoutes(); // Configura las rutas de la API
        this.setupMulter(); // Configura multer para la subida de archivos
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

    setupMulter() {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './uploads'); // Ruta donde se guardarán temporalmente los archivos
            },
            filename: function (req, file, cb) {
                cb(null, 'general.txt'); // Nombre del archivo
            }
        });
    
        this.upload = multer({ storage: storage }).single('file'); // Modificación aquí
    }
    
    setupRoutes() {
        // Configuración de middleware y rutas de la API
        this.app.use(express.json()); // Middleware para parsear JSON en las peticiones
        this.app.use(cors({
            origin:'http://localhost:3000',  //descomentar para correr en local
            //origin: 'https://piafront-0bbdcf63fce6.herokuapp.com',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        ;
        // Definición de las rutas y métodos HTTP correspondientes
        this.app.get('/users', (req, res) => this.getUsers(req, res)); // GET para obtener todos los usuarios
        this.app.get('/users/:id', (req, res) => this.getUserById(req, res)); // GET para obtener un usuario por ID
        this.app.post('/users', (req, res) => this.createUser(req, res)); // POST para crear un usuario
        this.app.put('/users/:id', (req, res) => this.updateUserById(req, res)); // PUT para actualizar un usuario por ID
        this.app.delete('/users/:id', (req, res) => this.deleteUserById(req, res)); // DELETE para eliminar un usuario por ID
        this.app.get('/sensorData', (req, res) => this.getSensorData(req, res)); // GET para obtener datos del sensor
        this.app.get('/sensorDataFull', (req, res) => this.getSensorDataByDate (req, res)); // GET para obtener datos del sensor
        this.app.post('/sensorData', (req, res) => this.createSensorData(req, res)); // POST para crear datos del sensor
        this.app.get('/file', (req, res) => this.readFile(req, res)); //get para ller archivos
        this.app.post('/file', (req, res) => this.upload(req, res, (err) => {
            if (err) {
                console.error('Error al subir archivo:', err);
                res.status(500).json({ message: 'Error al subir archivo' });
                return;
            }
            this.uploadFile(req, res);
        }));
    }

    //Servicios para usar el fs de node.js
    readFile(req, res) {
        try {
            const data = fs.readFileSync('uploads/general.txt', 'utf8');
            res.status(200).send(data);
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            res.status(500).json({ message: 'Error al leer el archivo' });
        }
    }
    uploadFile(req, res) {
        try {
            const file = req.file; // Archivo subido
            if (!file) {
                res.status(400).json({ message: 'No se ha enviado ningún archivo' });
                return;
            }
    
            const filePath = file.path; // Ruta del archivo en el servidor
            const fileData = fs.readFileSync(filePath, 'utf8'); // Lee el contenido del archivo
    
            const existingFilePath = 'uploads/general.txt'; // Ruta del archivo existente
            fs.appendFileSync(existingFilePath, fileData); // Agrega el contenido del archivo subido al archivo existente
    
            // Envía una respuesta exitosa
            res.status(200).json({ message: 'Contenido del archivo subido agregado al archivo existente' });
        } catch (error) {
            console.error('Error al subir archivo:', error);
            res.status(500).json({ message: 'Error al subir archivo' });
        }
    }
    //Servicios de usuario
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
    //Servicios de sensor
    getSensorData = async (req, res) => {
        try {
            const { page = 1, pageNumber = 5 } = req.query; // Obtiene los parámetros de paginación de los query parameters
            const skip = (page - 1) * pageNumber; // Calcula el número de documentos a omitir
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('sensorData'); // Obtiene la colección de datos del sensor
            const sensorData = await collection.find({}).skip(skip).limit(Number(pageNumber)).toArray(); // Realiza la consulta con paginación
            res.json({ sensorData }); // Devuelve los datos del sensor paginados
        } catch (error) {
            console.error('Error al obtener los datos del sensor:', error); // Manejo de errores
            res.status(500).json({ message: 'Error al obtener los datos del sensor' });
        }
    };
    getSensorDataByDate = async (req, res) => {
        try {
            const { date } = req.query;
            const db = client.db();
            const collection = db.collection('sensorData');
            const sensorData = await collection.find({ createdAt: { $regex: `^${date}` } }).toArray();
            res.json({ sensorData });
        } catch (error) {
            console.error('Error al obtener los datos del sensor:', error);
            res.status(500).json({ message: 'Error al obtener los datos del sensor' });
        }
    };
    createSensorData = async (req, res) => {
        // Método para crear datos del sensor
        const { co2Level } = req.body; // Obtiene el nivel de CO2 del cuerpo de la solicitud
        
        // Obtener la fecha actual en el huso horario de Bogotá
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 5); // Bogotá está 5 horas detrás de UTC
    
        // Formatear la fecha en el formato deseado
        const formattedDate = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, ''); // Eliminar la parte de la fracción de segundos
        
        try {
            const db = client.db(); // Obtiene la instancia de la base de datos
            const collection = db.collection('sensorData'); // Obtiene la colección de datos del sensor    
            const result = await collection.insertOne({
                co2Level,
                createdAt: formattedDate,  // Agregar la fecha actual al documento
            });
    
            if (result && result.insertedId) {
                const newSensorData = {
                    _id: result.insertedId,
                    co2Level,
                    createdAt: formattedDate, // Agregar la fecha actual al objeto de respuesta
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
