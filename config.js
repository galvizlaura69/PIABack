const { MongoClient } = require('mongodb');

const uri = process.env.URLMONGO ||
    'mongodb+srv://0808javierramirez88:PIA_LordV@mydatabase.dyngf.mongodb.net/myDataBase?retryWrites=true&w=majority&appName=myDataBase';

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

async function connectDB() {
    try {
        await client.connect();
        console.log('Conexión a MongoDB establecida');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        throw error;
    }
}

module.exports = { connectDB, client };
