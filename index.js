const restify = require("restify");
const corsMiddleware = require("restify-cors-middleware");
require("dotenv").config();

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ["http://localhost:8000"],
  allowHeaders: ["API-Token"],
  exposeHeaders: ["API-Token-Expiry"]
});

const url = process.env.DB_HOST;
const { Client } = require("./db");

async function main({ url }) {
  console.log("Connecting to db...");
  // const client = await connectDB(url);
  const client = new Client(url);
  await client.connect("clinic");

  const patientTable = client.getCollection("patient");
  const appmtTable = client.getCollection("appointment");
  console.log("Connected. Starting server...");

  const server = restify.createServer();
  server.pre(cors.preflight);
  server.use(cors.actual);
  server.use(restify.plugins.bodyParser());
  server.use(restify.plugins.queryParser());

  const health = (req, res, next) => {
    res.send({
      status: "up"
    });
    next();
  };
  server.get("/health", health);
  server.head("/health", health);
  server.get("/patient", async (req, res, next) => {
    const patients = await patientTable.findAll();
    res.send(patients);
    next();
  });
  server.post("/patient", async (req, res, next) => {
    console.log(req.body, req.params);
    const result = await patientTable.insertOne(JSON.parse(req.body));
    res.send({ ...result.ops[0] });
    next();
  });

  server.get("/appointment", async (req, res, next) => {
    const appointments = await appmtTable.findAll();
    const usedIds = appointments.map(({ patientId }) => patientId);
    const patients = await patientTable.findAll({
      _id: { $in: usedIds }
    });
    console.log({ patients });

    res.send(
      appointments.map((a, index) => ({ patient: patients[index], ...a }))
    );
    next();
  });
  server.post("/appointment", async (req, res, next) => {
    console.log(req.body, req.params);
    const result = await appmtTable.insertOne(JSON.parse(req.body));
    res.send({ ...result.ops[0] });
    next();
  });

  server.on("close", () => {
    client.close();
  });

  server.listen(8080, function() {
    console.log("%s listening at %s", server.name, server.url);
  });
}

main({ url });
