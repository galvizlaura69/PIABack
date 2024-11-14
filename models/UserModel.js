const { ObjectId } = require('mongodb');
const { client } = require('../config');

class UserModel {
    constructor() {
        this.collection = client.db().collection('users');
    }

    async createUser({ name, email, password, active }) {
        if (!name || !email || !password) {
            throw new Error('Todos los campos son requeridos');
        }
        const result = await this.collection.insertOne({ name, email, password, active });
        if (result.insertedId) {
            return { _id: result.insertedId, name, email, password, active };
        }
        throw new Error('No se pudo crear el usuario');
    }


    async getUsers() {
        return await this.collection.find({}).toArray();
    }

    async getUserByEmail(email) {
        return await this.collection.findOne({ email });
    }

    async updateUserById(email, { name, password }) {
        const result = await this.collection.updateOne(
            { email },
            { $set: { name, password } }
        );
        return result.modifiedCount === 1;
    }

    async deleteUserById(email) {
        const result = await this.collection.updateOne(
            { email }, 
            { $set: { active: false } }  
        );
        return result.modifiedCount === 1;
    }
}

module.exports = new UserModel();
