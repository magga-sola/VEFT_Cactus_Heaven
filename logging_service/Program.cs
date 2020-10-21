using System;
using System.IO;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace logging_service
{
    class Program
    {
        public static void Main(string[] args)
        {

        // look at all these chickens! sorry, just here are our variables to keep going
            const string queue = "logging_queue";
            const string exchangeRoute = "order_exchange";
            const string routeKey = "create_order";
            const string logFile = "log.txt";
            // should they be private_readonly_strings?


            // gotta get connected to the localhost!
            var factory = new ConnectionFactory() {_hostName = "localhost"};


        }
    }
}
