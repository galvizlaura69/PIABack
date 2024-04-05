const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://0808javierramirez88:PIA_LordV@mydatabase.7kd0bu3.mongodb.net/?retryWrites=true&w=majority&appName=myDataBase';
const client = new MongoClient(uri, { useUnifiedTopology: true });

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


