import type { MessagesPollerProps, MessageProcessorConfig } from '../messages-poller/types';

export type MessagesFifoProcessorProps<T> = MessagesPollerProps<T>;

export type MessagesFifoProcessorConfig = MessageProcessorConfig & {
  remainingTimes?: number,
}