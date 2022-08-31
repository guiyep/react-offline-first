import type { MessagesPollerProps, MessagesPollerConfig, MessagesPollerUnregister, MessageProcessor } from './types';

export const messagesPoller = <T>(
  props: MessagesPollerProps<T>,
  config: MessagesPollerConfig,
  messageProcessor: MessageProcessor,
): MessagesPollerUnregister => {
  const { hasMessages } = props;
  const { failTimes, interval } = config;

  const controller = new AbortController();
  const signal = controller.signal;

  const configProcess = { failTimes, signal };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const timeoutId = setTimeout(async () => {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return;
    }

    if (await hasMessages()) {
      await messageProcessor(props, configProcess);
    }

    messagesPoller(props, config, messageProcessor);
  }, interval);

  return () => controller.abort();
};
