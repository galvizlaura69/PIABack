const http = require('http'); // Importa el módulo HTTP de Node.js para crear el servidor
const url = require('url'); // Importa el módulo URL para manejar las URL de las solicitudes
const fs = require('fs'); // Importa el módulo File System para manejar archivos
const EventEmitter = require('events'); // Importa el módulo EventEmitter para gestionar eventos
const { ObjectId } = require('mongodb'); // Importa el objeto ObjectId de MongoDB
const { connectDB, client } = require('./config'); // Importa funciones de conexión a la base de datos
const cors = require('cors');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });


class PiaApi extends EventEmitter { // Define la clase PiaApi que extiende de EventEmitter
    constructor() {
        super();
        this.port = process.env.PORT || 3010; // Define el puerto del servidor
        this.server = http.createServer(this.handleRequest.bind(this)); // Crea el servidor HTTP
        this.setupRoutes(); // Configura las rutas del servidor
        this.setupCors();
        this.setupMulter();
    }

    setupCors() {
        this.server.on('request', (req, res) => {
            // Permite las solicitudes de cualquier origen
            res.setHeader('Access-Control-Allow-Origin', '*');
            // Configura los métodos HTTP permitidos
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            // Configura los encabezados permitidos
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
            // Si la solicitud es de tipo OPTIONS, responde con éxito
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
        });
    }
    
    setupMulter() {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './uploads'); // Ruta donde se guardarán temporalmente los archivos
            },
            filename: function (req, file, cb) {
                cb(null, 'general2.txt'); // Nombre del archivo
            }
        });
    
        this.upload = multer({ storage: storage }).single('file'); // Modificación aquí
    }
    async setupDB() {
        try {
            await connectDB(); // Conecta a la base de datos
            this.emit('dbConnected'); // Emite el evento 'dbConnected' cuando la conexión es exitosa
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            process.exit(1); // Sale del proceso si hay un error en la conexión
        }
    }

    setupRoutes() {
        this.on('dbConnected', () => {
            this.server.listen(this.port, () => { // Inicia el servidor en el puerto especificado
                console.log(`Servidor corriendo en http://localhost:${this.port}`);
            });
        });
    }

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true); // Parsea la URL de la solicitud
        const { pathname } = parsedUrl; // Obtiene la ruta de la URL

        switch (pathname) { // Maneja las diferentes rutas
            case '/users':
                if (req.method === 'GET') {
                    this.getUsers(req, res); // Obtiene todos los usuarios
                } else if (req.method === 'POST') {
                    this.createUser(req, res); // Crea un nuevo usuario
                }
                break;
            case '/users/:id':
                if (req.method === 'GET') {
                    this.getUserById(req, res); // Obtiene un usuario por ID
                } else if (req.method === 'PUT') {
                    this.updateUserById(req, res); // Actualiza un usuario por ID
                } else if (req.method === 'DELETE') {
                    this.deleteUserById(req, res); // Elimina un usuario por ID
                }
                break;
            case '/sensorData':
                if (req.method === 'GET') {
                    this.getSensorData(req, res); // Obtiene datos del sensor
                } else if (req.method === 'POST') {
                    this.createSensorData(req, res); // Crea nuevos datos del sensor
                }
                break;
            case '/file':
                if (req.method === 'GET') {
                    this.readGeneralFile(req, res); 
                }else if (req.method === 'POST') {
                    this.uploadFile(req, res); 
                }
                break;
            default:
                this.notFound(res); // Maneja rutas no encontradas
        }
    }

    notFound(res) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
    }

    async createUser(req, res) {
        const { name, email, password } = req.body;
        try {
            const db = client.db();
            const collection = db.collection('users');
            const result = await collection.insertOne({ name, email, password });
            if (result && result.insertedId) {
                const newUser = { _id: result.insertedId, name, email, password };
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario creado exitosamente', user: newUser }));
            } else {
                throw new Error('No se pudo crear el usuario');
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al crear usuario' }));
        }
    }
async getUsers(req, res) {
    try {
        const db = client.db();
        const collection = db.collection('users');
        const users = await collection.find({}).toArray();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ users }));
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error al obtener usuarios' }));
    }
}

    

    async getUserById(req, res) {
        const userId = req.params.id;
        const userObjectId = new ObjectId(userId);
        try {
            const db = client.db();
            const collection = db.collection('users');
            const user = await collection.findOne({ _id: userObjectId });
            if (!user) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario no encontrado' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ user }));
            }
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al obtener usuario por ID' }));
        }
    }

    async updateUserById(req, res) {
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
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario actualizado exitosamente' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario no encontrado' }));
            }
        } catch (error) {
            console.error('Error al actualizar usuario por ID:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al actualizar usuario por ID' }));
        }
    }

    async deleteUserById(req, res) {
        const userId = req.params.id;
        const userObjectId = new ObjectId(userId);
        try {
            const db = client.db();
            const collection = db.collection('users');
            const result = await collection.deleteOne({ _id: userObjectId });
            if (result.deletedCount === 1) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario eliminado exitosamente' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario no encontrado' }));
            }
        } catch (error) {
            console.error('Error al eliminar usuario por ID:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al eliminar usuario por ID' }));
        }
    }

    async getSensorData(req, res) {
        try {
            const db = client.db();
            const collection = db.collection('sensorData');
            const sensorData = await collection.find({}).toArray();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ sensorData }));
        } catch (error) {
            console.error('Error al obtener los datos del sensor:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al obtener los datos del sensor' }));
        }
    }

    async createSensorData(req, res) {
        const { co2Level } = req.body;
        try {
            const db = client.db();
            const collection = db.collection('sensorData');
            const result = await collection.insertOne({ co2Level });
            if (result && result.insertedId) {
                const newSensorData = { _id: result.insertedId, co2Level };
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Datos del sensor creados exitosamente', sensorData: newSensorData }));
            } else {
                throw new Error('No se pudieron guardar los datos del sensor');
            }
        } catch (error) {
            console.error('Error al guardar datos del sensor:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al guardar datos del sensor' }));
        }
    }
    
    async uploadFile(req, res) {
        try {
            const fileData = req.body;
            fs.appendFileSync('uploads/general2.txt', fileData + '\n');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Archivo subido exitosamente' }));
        } catch (error) {
            console.error('Error al subir archivo:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al subir archivo' }));
        }
    }

    async readGeneralFile(req, res) {
        try {
            const data = fs.readFileSync('uploads/general2.txt', 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(data);
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error al leer el archivo' }));
        }
    } 
}

const PiaApiInstance = new PiaApi(); // Crea una instancia de la clase PiaApi
PiaApiInstance.setupDB(); // Inicia la conexión a la base de datos
