const { Kafka } = require("kafkajs");
const { MongoClient } = require("mongodb");

const kafka = new Kafka({
  clientId: "legalease-client-id",
  brokers: ["pkc-6ojv2.us-west4.gcp.confluent.cloud:9092"],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: "RZ4LDAS454MM3DXU",
    password: "pEygZnz99YGlifs8p9I3orLnBnHcHLNRu0Q/GjktN2YGJMT7h5XoO1kJelSdUgLd",
  }
});

const producer = kafka.producer();
const mongoUrl =
  "mongodb+srv://legalEase:uBR08AiCVFtg2WJd@cluster0.xpnb2yn.mongodb.net/?retryWrites=true&w=majority"; // MongoDB connection URL
const dbName = "legalEase_1";

const createChangeStream = async () => {
  const client = new MongoClient(mongoUrl);

  await client.connect();
  const db = client.db(dbName);

  const changeStream = db.collection("data").watch();
  const collection = db.collection("data");

  while (true) {
    try {
      await changeStream.hasNext();
      const change = await changeStream.next();
      let document = await collection.findOne(change.documentKey);
        await producer.connect();

      await producer.send({
        topic: "legaleasekafkatopic",
        messages: [{ value: JSON.stringify(document) }],
      });

      await producer.disconnect();
    } catch (error) {
      console.error("Error in change stream:", error);
    }
  }
};

createChangeStream().catch(console.error);
