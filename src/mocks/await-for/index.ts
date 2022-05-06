export const awaitFor = (timeInMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInMs);
  });
