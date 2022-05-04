import type { MessagesPollerProps, MessagesPollerConfig, MessagesPollerUnregister, MessageProcessor } from './types';

export const messagesPoller = <T>(props: MessagesPollerProps<T>, config: MessagesPollerConfig, messageProcessor: MessageProcessor): MessagesPollerUnregister => {
  const { hasMessages } = props;
  const { failTimes, timeout } = config;

  const controller = new AbortController();
  const signal = controller.signal;

  const configProcess = { failTimes, signal };

  const timeoutId = setTimeout(async () => {
    if (signal.aborted) {
      console.log('aborted')
      clearTimeout(timeoutId);
      return;
    }

    if (await hasMessages()) {
      await messageProcessor(props, configProcess);
    }

    return messagesPoller(props, config, messageProcessor);
  }, timeout);


  return () => controller.abort();
};
