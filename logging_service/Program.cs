using System;
using System.IO;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace logging_service
{
    class Program
    {
        public static void Main()
        {

            // look at all these chickens! sorry, just here are our variables to keep going
            // TODO: should they be private_readonly_strings?
            const string queue = "logging_queue";
            const string exchangeRoute = "order_exchange";
            const string routeKey = "create_order";
            const string fileName = "log.txt";


            // gotta get connected to the localhost!
            var factory = new ConnectionFactory() {_hostName = "localhost"};

            // make the message
            const string logMessage = "the log"; //var body = ea.Body, var message = Encoding.UTF8.GetString(body);


            // get path and write message
            const string path = Directory.GetCurrentDirectory();
            using (StreamWriter outputFile = new StreamWriter(Path.Combine(path, "log.txt"), true))
            {
                outputFile.WriteLine("Log: " + logMessage);
            }

        }
    }
}
