const { ObjectId } = require('mongodb');
const { client } = require('../config');

class UserModel {
    constructor() {
        this.collection = client.db().collection('users');
    }

    async createUser({ name, email, password }) {
        const result = await this.collection.insertOne({ name, email, password });
        if (result.insertedId) {
            return { _id: result.insertedId, name, email, password };
        }
        throw new Error('No se pudo crear el usuario');
    }

    async getUsers() {
        return await this.collection.find({}).toArray();
    }

    async getUserById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async updateUserById(id, { name, email, password }) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, email, password } }
        );
        return result.modifiedCount === 1;
    }

    async deleteUserById(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1;
    }
}

module.exports = new UserModel();
