import { messagesPoller } from './index';
import type { MessagesPollerProps, MessagesPollerConfig, MessagesPollerUnregister } from './types';

type Value = {
  test: number
}

const awaitFor = (timeInMs: number): Promise<void> => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, timeInMs);
})

const config: MessagesPollerConfig = {
  failTimes: 5,
  interval: 30,
}

describe('messagesPoller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('to be defined', () => {
    expect(messagesPoller).toBeDefined();
  })

  test('to poll 1 message', async () => {

    const messagesProcessor = jest.fn();
    const props: MessagesPollerProps<Value> = {
      hasMessages: jest.fn().mockResolvedValue(true),
      getMessage: jest.fn(),
      deleteMessage: jest.fn(),
      moveToDlqMessage: jest.fn(),
      executeMessage: jest.fn(),
    }

    messagesPoller(props, config, messagesProcessor)
    await awaitFor(40);
    expect(messagesProcessor).toHaveBeenCalledTimes(1)
    expect(messagesProcessor).toHaveBeenCalledWith(props, {
      failTimes: config.failTimes,
      signal: expect.anything()
    })
  })

  test('to poll multiple message', async () => {
    const messagesProcessor = jest.fn();
    const props: MessagesPollerProps<Value> = {
      hasMessages: jest.fn().mockResolvedValue(true),
      getMessage: jest.fn(),
      deleteMessage: jest.fn(),
      moveToDlqMessage: jest.fn(),
      executeMessage: jest.fn(),
    }

    messagesPoller(props, config, messagesProcessor)
    await awaitFor(200);
    expect(messagesProcessor).toHaveBeenCalledTimes(6)
  })

  test('to cancel polling', async () => {
    const messagesProcessor = jest.fn();
    const props: MessagesPollerProps<Value> = {
      hasMessages: jest.fn().mockResolvedValue(true),
      getMessage: jest.fn(),
      deleteMessage: jest.fn(),
      moveToDlqMessage: jest.fn(),
      executeMessage: jest.fn(),
    }

    const cancelPolling: MessagesPollerUnregister = messagesPoller(props, config, messagesProcessor)
    await awaitFor(70);
    cancelPolling();
    expect(messagesProcessor).toHaveBeenCalledTimes(2)
  })
})