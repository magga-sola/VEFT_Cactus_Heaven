const amqp = require('amqplib/callback_api');
const db = require('data/db').db;
const orderSchema = require('data/db').Order;
const orderItemSchema = require('data/db').OrderItem;

const messageBrokerInfo = {
    exchanges: {
        order: 'order_exchange'
    },
    queues: {
        orderQueue: 'order_queue'
    },
    routingKeys: {
        input: 'create_order',
        output: 'order_logged'
    }
}

const createMessageBrokerConnection = () => new Promise((resolve, reject) => {
    amqp.connect('amqp://localhost', (err, conn) => {
        if (err) { reject(err); }
        resolve(conn);
    });
});

const createChannel = connection => new Promise((resolve, reject) => {
    connection.createChannel((err, channel) => {
        if (err) { reject(err); }
        resolve(channel);
    });
});

const configureMessageBroker = channel => {
    const { orderQueue } = messageBrokerInfo.queues;
    const { input } = messageBrokerInfo.routingKeys;

    channel.assertQueue(orderQueue, { durable: true});

    Object.values(messageBrokerInfo.exchanges).forEach(val => {
        channel.assertExchange(val, 'direct', { durable: true });
        channel.bindQueue(orderQueue, val, input);
    });

};



const createOrder = async (order_event) => {
    const bool = await orderSchema.create(order_event);
    return bool;
}

const createOrderItem = async (order_event) => {
    const bool = await orderItemSchema.create(order_event);
    return bool;
}

(async () => {
    const messageBrokerConnection = await createMessageBrokerConnection();
    const channel = await createChannel(messageBrokerConnection);

    configureMessageBroker(channel);

    const { order } = messageBrokerInfo.exchanges;
    const { orderQueue } = messageBrokerConnection.queues;
    const { output } = messageBrokerInfo.routingKeys;


    // TODO: Setup consumer
    channel.consume(orderQueue, data => {
        const dataJson = JSON.parse(data.content.toString()); //the order to be put into the database

        //creates an order in mongodb
        createOrder(dataJson);

        //creates orderItems in mongodb
        createOrderItem(dataJson);
    })

    // (10%) It should consume the order created event using the queue “order_queue”
    // (15%) It should create a new order using information from the event
    // (15%) It should also create order items using information from the same event


})().catch(e => console.error(e));