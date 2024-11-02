const UserModel = require('../models/userModel');

class UserController {
    async createUser(req, res) {
        try {
            const user = await UserModel.createUser(req.body);
            res.json({ message: 'Usuario creado exitosamente', user });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ message: 'Error al crear usuario' });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await UserModel.getUsers();
            res.json({ users });
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await UserModel.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json({ user });
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            res.status(500).json({ message: 'Error al obtener usuario por ID' });
        }
    }

    async updateUserById(req, res) {
        try {
            const updated = await UserModel.updateUserById(req.params.id, req.body);
            if (updated) {
                res.json({ message: 'Usuario actualizado exitosamente' });
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error('Error al actualizar usuario por ID:', error);
            res.status(500).json({ message: 'Error al actualizar usuario por ID' });
        }
    }

    async deleteUserById(req, res) {
        try {
            const deleted = await UserModel.deleteUserById(req.params.id);
            if (deleted) {
                res.json({ message: 'Usuario eliminado exitosamente' });
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error('Error al eliminar usuario por ID:', error);
            res.status(500).json({ message: 'Error al eliminar usuario por ID' });
        }
    }
}

module.exports = new UserController();
