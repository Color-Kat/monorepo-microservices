import {connect} from "amqplib";

const run = async () => {
    try {
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertExchange('test', 'topic', {durable: true});

        const queue = await channel.assertQueue('my.routing-key', {durable: true});
        await channel.bindQueue(queue.queue, 'test', 'my.routing-key');

        channel.consume(queue.queue, (message) => {
            if(!message) return;

            console.log(`Received message: ${message.content.toString()}`);
            console.log(message);

            channel.ack(message);
        });
    } catch (error) {
        console.log(error);
    }
};

run();
