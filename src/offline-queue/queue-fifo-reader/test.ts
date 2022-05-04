import { queueFifoReader } from './index';
import { queueBuilder } from '../queue-builder';

type Value = {
  test: number,
}

describe('queueFifoReader', () => {
  test('to be defined', () => {
    expect(queueFifoReader).toBeDefined();
  })

  test('to process messages', () => {
    const queue = queueBuilder<Value>('test')
    const queueHandler = queueFifoReader(queue)
    expect(queueHandler).toBeDefined();
  })
})