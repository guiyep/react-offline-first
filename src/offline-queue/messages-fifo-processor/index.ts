import type { MessagesFifoProcessorConfig, MessagesFifoProcessorProps } from './types';

export const messagesFifoProcessor = async <T>(props: MessagesFifoProcessorProps<T>, config: MessagesFifoProcessorConfig): Promise<void> => {
  const { getMessage, deleteMessage, moveToDlqMessage, executeMessage } = props;
  const { failTimes, remainingTimes: remainingTimesConfig, signal } = config;

  let remainingTimes = remainingTimesConfig === undefined ? failTimes : remainingTimesConfig;

  let message;
  try {
    message = await getMessage();

    if (signal.aborted) {
      return Promise.reject();
    }

    if (message === null) {
      return Promise.resolve();
    }

    await executeMessage(message);
    await deleteMessage();

    return messagesFifoProcessor(props, {
      failTimes,
      remainingTimes: failTimes,
      signal,
    });
  } catch {
    if (remainingTimesConfig === 1) {
      if (message) {
        await moveToDlqMessage(message);
      }
      // TODO what to do when we are unable to get the message more than 5 times?
      await deleteMessage();
    }

    return messagesFifoProcessor(props, {
      failTimes,
      remainingTimes: remainingTimes - 1,
      signal,
    });
  }
};