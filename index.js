const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config');
const userController = require('./controllers/UserController');
const sensorController = require('./controllers/SensorController');

class PiaApi {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3010;
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
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));

        this.app.get('/users', (req, res) => userController.getUsers(req, res));
        this.app.get('/users/email/:email', (req, res) => userController.getUserByEmail(req, res));
        this.app.post('/users', (req, res) => userController.createUser(req, res));
        this.app.put('/users/email/:email', (req, res) => userController.updateUserById(req, res));
        this.app.put('/users/emailDeleted/:email', (req, res) => userController.deleteUserById(req, res));

        this.app.get('/sensorData', (req, res) => sensorController.getSensorData(req, res));
        this.app.get('/sensorDataFull', (req, res) => sensorController.getSensorDataByDate(req, res));
        this.app.post('/sensorData', (req, res) => sensorController.createSensorData(req, res));
    }

    startServer() {
        this.setupDB().then(() => {
            this.app.listen( this.port, () => {
                console.log(`Servidor corriendo en http://localhost:${this.port}`);
            });
        }).catch((error) => {
            console.error('Error al iniciar el servidor:', error);
        });
    }
}

const PiaApiInstance = new PiaApi();
PiaApiInstance.startServer();
