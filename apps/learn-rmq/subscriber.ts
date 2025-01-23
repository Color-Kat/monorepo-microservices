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

            if(message.properties.replyTo) {
                console.log('Replying to: ' + message.properties.replyTo);

                // Send response to the exclusive queue from replyTo
                // With the correlationId from the request
                channel.sendToQueue(
                    message.properties.replyTo,
                    Buffer.from('This is response from queue ' + message.properties.replyTo),
                    {
                        correlationId: message.properties.correlationId
                    }
                )
            }
            channel.ack(message);
        });
    } catch (error) {
        console.log(error);
    }
};

run();
