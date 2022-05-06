import type { MessagesPollerProps, IMessageProcessorConfig } from '../messages-poller/types';

export type MessagesFifoProcessorProps<T> = MessagesPollerProps<T>;

export interface MessagesFifoProcessorConfig extends IMessageProcessorConfig {
  remainingTimes?: number,
}