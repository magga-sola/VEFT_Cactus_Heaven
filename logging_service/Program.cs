using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;
using System.IO;

namespace logging_service
{
    class Receive
{
    public static void Main()
    {

        const string queueName = "logging_queue";
        const string exchange = "order_exchange";
        const string routingKey = "create_order";
        const string fileName = "log.txt";


        var factory = new ConnectionFactory() { HostName = "localhost" };
        using(var connection = factory.CreateConnection())
        using(var channel = connection.CreateModel())
        {
            
            channel.QueueDeclare(queue: queueName,
                                 durable: false,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);

            channel.ExchangeDeclare(exchange: exchange,
                                    type: ExchangeType.Direct, 
                                    durable: true );

            channel.QueueBind(queue: queueName,
                                  exchange: exchange,
                                  routingKey: routingKey);
            
            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var logMessage = Encoding.UTF8.GetString(body);
                Console.WriteLine(" [x] Received {0}", logMessage); 

                using (StreamWriter writer = System.IO.File.AppendText(fileName))
                {
                    writer.WriteLine(logMessage);
                }
            };

            channel.BasicConsume(queue: queueName,
                                 autoAck: true,
                                 consumer: consumer);

            Console.ReadLine();
    
            
        }
    }
}

}









// using RabbitMQ.Client;
// using RabbitMQ.Client.Events;
// using System;
// using System.IO;
// using System.Text;

// class logging_service_class
// {
//     public static void Main()
//     {
//         const string queueName = "logging_queue";
//         const string exchange = "order_exchange";
//         const string inputKey = "create_order";


//         var factory = new ConnectionFactory() { HostName = "localhost" };
//         using(var connection = factory.CreateConnection())
//         using(var channel = connection.CreateModel())
//         {
//             channel.QueueDeclare(queue: queueName,
//                                  durable: false,
//                                  exclusive: false,
//                                  autoDelete: false,
//                                  arguments: null);

//             string message = "Hello World!";
//             var body = Encoding.UTF8.GetBytes(message);

//             channel.ExchangeDeclare(exchange:exchange, type:"direct");
//             var queue = channel.QueueDeclare().QueueName;

//             channel.QueueBind(queue: queue,
//                               exchange:exchange,
//                               routingKey:inputKey
//                               );

//             var consumer = new EventingBasicConsumer(channel);

//                 consumer.Received += (model, ea) =>
//                 {
//                     var body = ea.Body;
//                     var message = Encoding.UTF8.GetString(body);
//                     Console.WriteLine(message);

//                     string path = Directory.GetCurrentDirectory();
//                     using (StreamWriter outputFile = new StreamWriter(Path.Combine(path, "log.txt"), true))
//                     {
                        
//                         outputFile.WriteLine("Log: " + message);
//                     }
//                 };

//             channel.BasicConsume(queue: queue,
//                                  autoAck: true, // a eg ad setja output key herna?
//                                  consumer: consumer);

//             channel.Close();
//             connection.Close();
//         }
//     }
// }
