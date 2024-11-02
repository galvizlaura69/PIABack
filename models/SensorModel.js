const { ObjectId } = require('mongodb');
const { client } = require('../config');

class SensorModel {
    constructor() {
        this.collection = client.db().collection('sensorData');
    }

    async getSensorData(page = 1, pageNumber = 5) {
        const skip = (page - 1) * pageNumber;
        return await this.collection.find({}).skip(skip).limit(Number(pageNumber)).toArray();
    }

    async getSensorDataByDate(date) {
        return await this.collection.find({ createdAt: { $regex: `^${date}` } }).toArray();
    }

    async createSensorData({ co2Level }) {
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 5);
        const formattedDate = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');

        const result = await this.collection.insertOne({ co2Level, createdAt: formattedDate });
        if (result.insertedId) {
            return { _id: result.insertedId, co2Level, createdAt: formattedDate };
        }
        throw new Error('No se pudieron guardar los datos del sensor');
    }
}

module.exports = new SensorModel();
