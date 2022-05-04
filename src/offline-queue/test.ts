import { queueBuilder, queuePublisher, queueFifoReader } from './index';

describe('offline queue exports', () => {
  test('to be exported', () => {
    expect(queueBuilder).toBeDefined();
    expect(queuePublisher).toBeDefined();
    expect(queueFifoReader).toBeDefined();
  })
})