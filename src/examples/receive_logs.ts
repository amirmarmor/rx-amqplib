import * as R from 'ramda';
import RxAmqpLib from '../rx-amqplib/RxAmqpLib';
import RxChannel from '../rx-amqplib/RxChannel';
import AssertExchangeReply from '../rx-amqplib/reply/AssertExchangeReply';
import AssertQueueReply from '../rx-amqplib/reply/AssertQueueReply';

let config = {
  exchange: 'logs',
  exchangeType: 'fanout',
  host: 'amqp://localhost'
};

let messageContent = R.prop('content');
let createChannel = R.invoker(0, 'createChannel');
// [IMPURE] Log message content from buffer to console.log
let logMessageContent = R.compose(console.log, R.toString, messageContent);


// Process stream
RxAmqpLib.newConnection(config.host)
  .flatMap(createChannel)
  .flatMap((channel: RxChannel) => channel.assertExchange(config.exchange, config.exchangeType, { durable: false }))
  .flatMap((exchange: AssertExchangeReply) => exchange.channel.assertQueue('', { exclusive: true }))
  .flatMap((queue: AssertQueueReply) => queue.channel
    .bindQueue(queue.queue, config.exchange, '')
    .flatMap(queue.channel.consume(queue.queue, { noAck: true }))
  )
  .subscribe(logMessageContent, console.error);