const { connection } = require('./connector')
const { data } = require('./data')

const refreshAll = async () => {
    await connection.deleteMany({})
    // console.log(connection)
    await connection.insertMany(data)
}
refreshAll()

/**
 * mongdb url={mongodb://Mangesh:Mangesh@ac-xt143kl-shard-00-00.dc9k794.mongodb.net:27017,ac-xt143kl-shard-00-01.dc9k794.mongodb.net:27017,ac-xt143kl-shard-00-02.dc9k794.mongodb.net:27017/?ssl=true&replicaSet=atlas-n5j7qa-shard-0&authSource=admin&retryWrites=true&w=majority}
 */