

export type ExecuteMessage<T> = (data: T) => Promise<unknown>;

export type MessagesPollerProps<T> = {
  hasMessages: () => Promise<boolean>,
  getMessage: () => Promise<T | null>,
  deleteMessage: () => Promise<unknown>,
  moveToDlqMessage: (data: T) => Promise<unknown>,
  executeMessage: ExecuteMessage<T>,
}

export type MessagesPollerConfig = {
  failTimes: number,
  timeout: number
}

export type MessagesPollerUnregister = () => void

export type MessageProcessorConfig = {
  failTimes: number,
  signal: AbortSignal,
}

export type MessageProcessor = <T>(props: MessagesPollerProps<T>, config: MessageProcessorConfig) => Promise<void>