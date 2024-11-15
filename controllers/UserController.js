const UserModel = require('../models/UserModel');

class UserController {
    
    async createUser(req, res) {
        try {
            const userData = { ...req.body, active: true };
            const user = await UserModel.createUser(userData);
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

    async getUserByEmail(req, res) {
        try {
            const user = await UserModel.getUserByEmail(req.params.email);
            if (!user || !user.active) {
                return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
            }
            
            res.json({ user });
        } catch (error) {
            console.error('Error al obtener usuario por email:', error);
            res.status(500).json({ message: 'Error al obtener usuario por email' });
        }
    }
    async updateUserById(req, res) {
        try {
            const updated = await UserModel.updateUserById(req.params.email, req.body);
                if (updated) {
                const updatedUser = await UserModel.getUserByEmail(req.params.email);
                res.json({
                    message: 'Usuario actualizado exitosamente',
                    user: updatedUser  
                });
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
            const userUpdated = await UserModel.deleteUserById(req.params.email);
            if (userUpdated) {
                res.json({ message: 'Usuario desactivado exitosamente' });
            } else {
                res.status(404).json({ message: 'Usuario no encontrado o ya estaba desactivado' });
            }
        } catch (error) {
            console.error('Error al desactivar usuario por email:', error);
            res.status(500).json({ message: 'Error al desactivar usuario por email' });
        }
    }
    
    
}

module.exports = new UserController();
