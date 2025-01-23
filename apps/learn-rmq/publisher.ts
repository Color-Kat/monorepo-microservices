import {connect} from "amqplib";

const run = async () => {
    try {
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertExchange('test', 'topic', {durable: true});

        const replyQueue = await channel.assertQueue('', {exclusive: true});
        channel.consume(replyQueue.queue, (message) => {
            if(!message) return;

            console.log('Response for the request with correlationId: ' + message.properties.correlationId);
            console.log(message.content.toString());
        });

        // Send message to exchange "test".
        // The exchange will distribute the message to the queue
        // with the routing key "my.routing-key.
        channel.publish(
            'test',                      // Exchange
            'my.routing-key',            // Routing key (queues subscribe to this)
            Buffer.from('I work!'),      // Some data for transfer
            {
                replyTo: replyQueue.queue,
                correlationId: '1'
            }  //
        );
    } catch (error) {
        console.log(error);
    }
};

run();
