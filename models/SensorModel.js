const { ObjectId } = require('mongodb');
const { client } = require('../config');

class SensorModel {
    constructor() {
        this.collection = client.db().collection('sensorData');
        this.counter = 0; 
        this.co2Sum = 0;  
    }

    async getSensorData(page = 1, pageNumber = 5) {
        const skip = (page - 1) * pageNumber;
        return await this.collection.find({}).skip(skip).limit(Number(pageNumber)).toArray();
    }

    async getSensorDataByDate(date) {
        return await this.collection.find({ createdAt: { $regex: `^${date}` } }).toArray();
    }

    async createSensorData({ co2Level }) {
        this.counter++;
        this.co2Sum += co2Level;

        if (this.counter < 180) {
            return;
        }
        const co2Average = this.co2Sum / this.counter;
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 5);
        const formattedDate = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const result = await this.collection.insertOne({ co2Level: co2Average, createdAt: formattedDate });

        if (result.insertedId) {
            this.counter = 0;
            this.co2Sum = 0;
            return { _id: result.insertedId, co2Level: co2Average, createdAt: formattedDate };
        }
    }
}

module.exports = new SensorModel();
