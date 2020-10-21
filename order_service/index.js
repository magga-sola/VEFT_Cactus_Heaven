const amqp = require('amqplib/callback_api');
const db = require('data/db').db;
const dbOrder = require('data/db').Order;
const dbOrderItem = require('data/db').OrderItem;

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



const createOrder = async (order_object) => {

    let finalPrice = 0;

    order_object.items.forEach( item => {
        finalPrice += (item.quantity * item.unitPrice);
    });

    const today = new Date();

    try {
        const newOrder = await dbOrder.create({
            customerEmail: order_object.email,
            totalPrice: finalPrice,
            orderDate: today
        })

    } catch(err) {
        throw (err);
    }
}

const createOrderItem = async (order_object, new_order) => {
    try {
        let items = order_object.items;

        for ( let i = 0; i < items; i++) {
            const rowPrice = await (items[i].quantity * items[i].unitPrice);

            const newOrderItem = await dbOrderItem.create({
                description: items[i].description,
                quantity: items[i].quantity,
                unitPrice: items[i].unitPrice,
                rowPrice: rowPrice,
                orderId: new_order._id
            })
        }
        return; //TODO: should we return something or just leave this?

    } catch (err) {
        throw(err);
    }
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


})().catch(e => console.error(e));