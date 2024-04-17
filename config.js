const { MongoClient } = require('mongodb'); // Importa MongoClient de MongoDB

// URI de conexión a la base de datos MongoDB Atlas
const uri = 'mongodb+srv://0808javierramirez88:PIA_LordV@mydatabase.7kd0bu3.mongodb.net/?retryWrites=true&w=majority&appName=myDataBase';

// Crea un nuevo cliente MongoClient con la URI y las opciones de configuración
const client = new MongoClient(uri, { useUnifiedTopology: true });

// Función asincrónica para conectar a la base de datos MongoDB
async function connectDB() {
    try {
        await client.connect(); // Conecta el cliente a la base de datos
        console.log('Conexión a MongoDB establecida'); // Mensaje de éxito al establecer la conexión
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error); // Manejo de errores al conectar a la base de datos
        throw error; // Lanza el error para ser manejado externamente
    }
}

// Exporta la función connectDB y el cliente MongoClient para ser utilizados en otros archivos
module.exports = { connectDB, client };
