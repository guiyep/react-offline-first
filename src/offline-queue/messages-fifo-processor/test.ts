import { messagesFifoProcessor } from '.';
import type { MessagesFifoProcessorProps, MessagesFifoProcessorConfig } from './types';

type Value = {
  test: number
}

const awaitFor = (timeInMs: number): Promise<void> => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, timeInMs);
})

const controller = new AbortController();
const signal = controller.signal;

const config: MessagesFifoProcessorConfig = {
  failTimes: 5,
  remainingTimes: 5,
  signal,
}

describe('messagesFifoProcessor', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  })

  test('to be defined', () => {
    expect(messagesFifoProcessor).toBeDefined();
  })

  test('to process a queue of 1 message', async () => {
    const value: Value = { test: 222 }
    let queue: Value[] = [
      value,
    ];

    const props: MessagesFifoProcessorProps<Value> = {
      hasMessages: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue.length > 0;
      }),
      getMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue[0] || null;
      }),
      deleteMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        queue = [];
      }),
      moveToDlqMessage: jest.fn().mockResolvedValue(null),
      executeMessage: jest.fn().mockResolvedValue(null),
    }

    await messagesFifoProcessor(props, config);
    await awaitFor(30);

    expect(queue).toHaveLength(0);
    expect(props.executeMessage).toHaveBeenCalledWith(value);
    expect(props.moveToDlqMessage).toHaveBeenCalledTimes(0);
    expect(props.hasMessages).toHaveBeenCalledTimes(0);
    expect(props.getMessage).toHaveBeenCalledTimes(2);
    expect(props.getMessage).toHaveBeenCalledWith();
    expect(props.deleteMessage).toHaveBeenCalledTimes(1);
    expect(props.deleteMessage).toHaveBeenCalledWith();
  })

  test('to process a queue of 3 message', async () => {
    const value: Value = { test: 222 }
    const value2: Value = { test: 333 }
    const value3: Value = { test: 444 }

    let queue: Value[] = [
      value,
      value2,
      value3
    ];

    const props: MessagesFifoProcessorProps<Value> = {
      hasMessages: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue.length > 0;
      }),
      getMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue[0] || null;
      }),
      deleteMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        queue.shift();
      }),
      moveToDlqMessage: jest.fn().mockResolvedValue(null),
      executeMessage: jest.fn().mockResolvedValue(null),
    }

    await messagesFifoProcessor(props, config);
    await awaitFor(200);

    expect(queue).toHaveLength(0);
    expect(props.hasMessages).toHaveBeenCalledTimes(0);
    expect(props.getMessage).toHaveBeenCalledTimes(4);
    expect(props.executeMessage).toHaveBeenCalledTimes(3);
    expect(props.executeMessage).toHaveBeenNthCalledWith(1, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(2, value2);
    expect(props.executeMessage).toHaveBeenNthCalledWith(3, value3);
    expect(props.deleteMessage).toHaveBeenCalledTimes(3);
    expect(props.moveToDlqMessage).toHaveBeenCalledTimes(0);
  })

  test('to retry message 4 times and recover', async () => {
    const value: Value = { test: 222 }
    let queue: Value[] = [
      value,
    ];

    const props: MessagesFifoProcessorProps<Value> = {
      hasMessages: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue.length > 0;
      }),
      getMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue[0] || null;
      }),
      deleteMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        queue = [];
      }),
      moveToDlqMessage: jest.fn().mockResolvedValue(null),
      executeMessage: jest.fn()
        .mockRejectedValueOnce(new Error('something is wrong'))
        .mockRejectedValueOnce(new Error('something is wrong'))
        .mockRejectedValueOnce(new Error('something is wrong'))
        .mockReturnValueOnce(null),
    }

    await messagesFifoProcessor(props, config);
    await awaitFor(30);

    expect(queue).toHaveLength(0);
    expect(props.hasMessages).toHaveBeenCalledTimes(0);
    expect(props.getMessage).toHaveBeenCalledTimes(5);
    expect(props.executeMessage).toHaveBeenCalledTimes(4);
    expect(props.executeMessage).toHaveBeenNthCalledWith(1, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(2, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(3, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(4, value);
    expect(props.deleteMessage).toHaveBeenCalledTimes(1);
  })

  test('to retry message max of times and move to DLQ', async () => {
    const value: Value = { test: 222 }
    let queue: Value[] = [
      value,
    ];

    const props: MessagesFifoProcessorProps<Value> = {
      hasMessages: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue.length > 0;
      }),
      getMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue[0] || null;
      }),
      deleteMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        queue = [];
      }),
      moveToDlqMessage: jest.fn().mockResolvedValue(null),
      executeMessage: jest.fn()
        .mockRejectedValue(new Error('something is wrong'))
    }

    await messagesFifoProcessor(props, config);
    await awaitFor(30);

    expect(queue).toHaveLength(0);
    expect(props.hasMessages).toHaveBeenCalledTimes(0);
    expect(props.getMessage).toHaveBeenCalledTimes(6);
    expect(props.executeMessage).toHaveBeenCalledTimes(5);
    expect(props.executeMessage).toHaveBeenNthCalledWith(1, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(2, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(3, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(4, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(5, value);
    expect(props.moveToDlqMessage).toHaveBeenCalledTimes(1);
    expect(props.moveToDlqMessage).toHaveBeenCalledWith(value);
    expect(props.deleteMessage).toHaveBeenCalledTimes(1);
  })

  test('to retry message max of times and move to DLQ and keep processing messages', async () => {
    const value: Value = { test: 222 }
    const value2: Value = { test: 333 }
    let queue: Value[] = [
      value,
      value2,
    ];

    const props: MessagesFifoProcessorProps<Value> = {
      hasMessages: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue.length > 0;
      }),
      getMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        return queue[0] || null;
      }),
      deleteMessage: jest.fn().mockImplementation(async () => {
        await awaitFor(20);
        queue.shift();
      }),
      moveToDlqMessage: jest.fn().mockResolvedValue(null),
      executeMessage: jest.fn()
        .mockRejectedValueOnce(new Error('something is wrong'))
        .mockRejectedValueOnce(new Error('something is wrong'))
        .mockRejectedValueOnce(new Error('something is wrong'))
        .mockRejectedValueOnce(new Error('something is wrong'))
        .mockRejectedValueOnce(new Error('something is wrong'))
        .mockReturnValueOnce(null)
    }

    await messagesFifoProcessor(props, config);
    await awaitFor(30);

    expect(queue).toHaveLength(0);
    expect(props.hasMessages).toHaveBeenCalledTimes(0);
    expect(props.getMessage).toHaveBeenCalledTimes(7);
    expect(props.executeMessage).toHaveBeenCalledTimes(6);
    expect(props.executeMessage).toHaveBeenNthCalledWith(1, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(2, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(3, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(4, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(5, value);
    expect(props.executeMessage).toHaveBeenNthCalledWith(6, value2);
    expect(props.moveToDlqMessage).toHaveBeenCalledTimes(1);
    expect(props.moveToDlqMessage).toHaveBeenCalledWith(value);
    expect(props.deleteMessage).toHaveBeenCalledTimes(2);
  })
})