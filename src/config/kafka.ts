import { Kafka, KafkaConfig, Producer } from "kafkajs";
import { MessageProducerBroker } from "../common/types/broker";
import config from "config";

export class KafkaProducerBroker implements MessageProducerBroker {
    private producer: Producer;
    constructor(clientId: string, brokers: string[]) {
        let kafkaConfig: KafkaConfig = {
            clientId,
            brokers,
        };
        if (process.env.NODE_ENV === "production") {
            kafkaConfig = {
                ...kafkaConfig,
                ssl: true,
                connectionTimeout: 45000,
                sasl: {
                    mechanism: "plain",
                    username: config.get("kafka.sasl.username"),
                    password: config.get("kafka.sasl.password"),
                },
            };
        }
        const kafka = new Kafka(kafkaConfig);
        this.producer = kafka.producer();
    }
    /**
     * Connect the producer
     */
    async connect() {
        await this.producer.connect();
    }
    /**
     * Disconnect the producer
     */
    async disconnect() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }
    /**
     * @param topic - Topic to which the message should be sent
     * @param message - Message to send
     * @throws {Error} - When the producer is not connected
     */
    async sendMessage(topic: string, message: string) {
        await this.producer.send({
            topic,
            messages: [{ value: message }],
        });
    }
}
