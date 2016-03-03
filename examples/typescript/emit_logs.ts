import RxAmqpLib from '../rx-amqplib/RxAmqpLib';
import RxConnection from '../rx-amqplib/RxConnection';
import RxChannel from '../rx-amqplib/RxChannel';
import * as Rx from 'rx';
import * as R from 'ramda';
import AssertExchangeReply from "../rx-amqplib/reply/AssertExchangeReply";

let config = {
  exchange: 'logs',
  exchangeType: 'fanout',
  host: 'amqp://localhost'
};

let createChannel = R.invoker(0, 'createChannel');
let close = R.invoker(0, 'close');

// Process stream
RxAmqpLib.newConnection(config.host)
  .flatMap((connection: RxConnection) => connection
    .createChannel()
    .flatMap((channel: RxChannel) => channel.assertExchange(config.exchange, config.exchangeType, {durable: false}))
    .doOnNext((exchange: AssertExchangeReply) => {
      exchange.channel.publish(config.exchange, '', new Buffer('test message'));
    })
    .flatMap(exchange => close(exchange.channel))
    .flatMap(() => close(connection))
  )
  .subscribe(() => {}, console.error, () => console.log('Messages sent'));

