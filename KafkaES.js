const { Kafka, logLevel } = require("kafkajs");
const { Client } = require("@elastic/elasticsearch");

// Kafka Configuration
const kafka = new Kafka({
  clientId: "legalease-client-id",
  brokers: ["pkc-6ojv2.us-west4.gcp.confluent.cloud:9092"],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: "RZ4LDAS454MM3DXU",
    password:
      "pEygZnz99YGlifs8p9I3orLnBnHcHLNRu0Q/GjktN2YGJMT7h5XoO1kJelSdUgLd",
  },
});

const consumer = kafka.consumer({ groupId: "legal-consumer-group" });

// Elasticsearch Configuration
const client = new Client({
    node: "https://legalease.es.us-central1.gcp.cloud.es.io:9243",
    auth: {
      username: "elastic",
      password: "EFQhDJEFdFd9ZrDenZCxil2G",
    },
  });
  

const kafkaTopic = "legaleasekafkatopic";
const elasticIndex = "legaleaseindex";

const consumeAndProcessMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: kafkaTopic, fromBeginning:true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        try {
            const parsedData = JSON.parse(message.value);
            delete parsedData._id;
            console.log(parsedData);
        
            // Index the data into Elasticsearch
           const resp= await client.index({
              index: elasticIndex,
              body: parsedData,
            });
        
            console.log(`Indexed message to Elasticsearch: ${resp.body}`);
          } catch (error) {
            console.error("Error processing Kafka message:", error);
          }
    },
  })

};

consumeAndProcessMessages();
