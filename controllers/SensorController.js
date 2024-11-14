const SensorModel = require('../models/SensorModel');

class SensorController {
    async getSensorData(req, res) {
        try {
            const { page, pageNumber } = req.query;
            const sensorData = await SensorModel.getSensorData(page, pageNumber);
            res.json({ sensorData });
        } catch (error) {
            console.error('Error al obtener los datos del sensor:', error);
            res.status(500).json({ message: 'Error al obtener los datos del sensor' });
        }
    }

    async getSensorDataByDate(req, res) {
        try {
            const sensorData = await SensorModel.getSensorDataByDate(req.query.date);
            res.json({ sensorData });
        } catch (error) {
            console.error('Error al obtener los datos del sensor:', error);
            res.status(500).json({ message: 'Error al obtener los datos del sensor' });
        }
    }

    async createSensorData(req, res) {
        try {
            const sensorData = await SensorModel.createSensorData(req.body);
            res.json({ message: 'Datos del sensor procesados', sensorData });
        } catch (error) {
            console.error('Error al guardar datos del sensor:', error);
            res.status(500).json({ message: 'Error al guardar datos del sensor' });
        }
    }
}

module.exports = new SensorController();
