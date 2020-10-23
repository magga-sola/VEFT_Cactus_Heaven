const orderSchema = require('./schema/order');
const orderItemSchema = require('./schema/orderItem');
const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb+srv://eva:eva@cactusheavencluster.6lte1.mongodb.net/CactusHeavenDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = {
    db: connection,
    Order: connection.model('Order', orderSchema, 'Orders'),
    OrderItem: connection.model('OrderItem', orderItemSchema, 'OrderItems')
};
