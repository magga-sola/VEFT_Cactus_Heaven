const amqp = require('amqplib/callback_api');
const dbOrder = require('./data/db').Order;
const dbOrderItem = require('./data/db').OrderItem;

const messageBrokerInfo = {
    exchanges: {
        order: 'order_exchange'
    },
    queues: {
        orderQueue: 'order_queue'
    },
    routingKeys: {
        input: 'create_order',
        output: 'order_created'
    }
};

const createMessageBrokerConnection = () => new Promise((resolve, reject) => {
    amqp.connect('amqp://localhost', (err, conn) => {
        if (err) { reject(err); }
        resolve(conn);
    });
});

const configureMessageBroker = channel => {
    const { exchanges, queues, routingKeys } = messageBrokerInfo;

    channel.assertExchange(exchanges.order, 'direct', { durable: true });
    channel.assertQueue(queues.orderQueue, { durable: true });
    channel.bindQueue(queues.orderQueue, exchanges.order, routingKeys.input);
}

const createChannel = connection => new Promise((resolve, reject) => {
    connection.createChannel((err, channel) => {
        if (err) { reject(err); }
        configureMessageBroker(channel);
        resolve(channel);
    });
});

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
        return newOrder;

    } catch(err) {
        throw (err);
    }
}

const createOrderItems = async (order_object, new_order) => {
    
    try {
        let orderItemList = [];
        let items = order_object.items;

        for ( let i = 0; i < items.length; i++) {
            const rowPrice = (items[i].quantity * items[i].unitPrice);
            const newOrderItem = await dbOrderItem.create({
                description: items[i].description,
                quantity: items[i].quantity,
                unitPrice: items[i].unitPrice,
                rowPrice: rowPrice,
                orderId: new_order._id
            })
            orderItemList.push(newOrderItem);
        }
        return orderItemList; 
    } catch (err) {
        throw(err);
    }
}

(async () => {
    const connection = await createMessageBrokerConnection();
    const channel = await createChannel(connection);

    const { order } = messageBrokerInfo.exchanges;
    const { orderQueue } = messageBrokerInfo.queues;
    const { output } = messageBrokerInfo.routingKeys;

    channel.consume(orderQueue, async data => {
        const dataJson = JSON.parse(data.content.toString());
        const newOrder = await createOrder(dataJson);
        const orderList = await createOrderItems(dataJson, newOrder);
        channel.publish(order, output, new Buffer(JSON.stringify(newOrder)));

        console.log(`[x] Sent: ${JSON.stringify(dataJson)}`);
    }, { noAck: true });
})().catch(e => console.error(e));
