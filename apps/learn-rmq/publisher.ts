import {connect} from "amqplib";

const run = async () => {
    try {
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertExchange('test', 'topic', {durable: true});

        channel.publish('test', 'my.routing-key', Buffer.from('I work!'));
    } catch (error) {
        console.log(error);
    }
};

run();
