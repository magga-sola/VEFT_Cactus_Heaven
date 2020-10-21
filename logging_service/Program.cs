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

        }
    }
}
