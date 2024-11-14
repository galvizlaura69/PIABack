const { client } = require('../config');


class SensorModel {
    constructor() {
        this.collection = client.db().collection('sensorData');
        this.dataBuffer = [];
        this.dataCounter = 0;
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
    
        let level = '';
        if (co2Level >= 0 && co2Level <= 200) {
            level = 'bajo';
        } else if (co2Level > 300 && co2Level <= 700) {
            level = 'medio';
        } else if (co2Level > 700) {
            level = 'alto';
        }
    
        this.dataBuffer.push(co2Level);
        this.dataCounter++;
    
        if (this.dataCounter >= 2) {
            const averageCo2Level = this.dataBuffer.reduce((sum, level) => sum + level, 0) / this.dataBuffer.length;
            
            let averageLevel = '';
            if (averageCo2Level >= 0 && averageCo2Level <= 200) {
                averageLevel = 'bajo';
            } else if (averageCo2Level > 300 && averageCo2Level <= 700) {
                averageLevel = 'medio';
            } else if (averageCo2Level > 700) {
                averageLevel = 'alto';
            }
                const result = await this.collection.insertOne({
                co2Level: averageCo2Level,
                createdAt: formattedDate,
                level: averageLevel 
            });
    
            this.dataBuffer = [];
            this.dataCounter = 0;
    
            if (result.insertedId) {
                return {
                    _id: result.insertedId,
                    co2Level: averageCo2Level,
                    createdAt: formattedDate,
                    level: averageLevel 
                };
            } else {
                throw new Error('No se pudieron guardar los datos del sensor');
            }
        }
    
        return { message: 'Esperando más datos para calcular el promedio.' };
    }
    
}

module.exports = new SensorModel();
