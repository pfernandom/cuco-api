/* eslint-disable prettier/prettier */
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware')
 
const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['http://localhost:8000'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})

const url = 'mongodb://localhost:27017';
const { Client } = require('./db');

async function main({ url }) {
  console.log('Connecting to db...');
  // const client = await connectDB(url);
  const client = new Client(url);
  await client.connect('clinic');

  const clinicDB = client.getCollection('patient');
  console.log('Connected. Starting server...');

  const server = restify.createServer();
  server.pre(cors.preflight)
  server.use(cors.actual)
  server.use(restify.plugins.bodyParser());
  
  const health = (req, res, next) => {
    res.send({
      status: 'up'
    });
    next();
  };
  server.get('/health', health);
  server.head('/health', health);
  server.get('/patient', async (req, res, next) => {
    const chars = await clinicDB.findAll();
    res.send(chars);
    next();
  });
  server.post('/patient', async (req, res, next) => {
    console.log(req.body, req.params);
    const result = await clinicDB.insertOne(JSON.parse(req.body));
    res.send(result);
    next();
  });

  server.on('close', () => {
    client.close();
  });

  /*
  server.get('/test/characters/gen', async (req, res, next) => {
    const result = await db.insertMany(
      Array(5)
        .fill()
        .map((_, index) => ({ id: Math.random() * index, name: 'Roger' }))
    );
    res.send(result);
    next();
  });*/

  server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
  });
}

main({ url });
