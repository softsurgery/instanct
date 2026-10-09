export const waitForUiReady = () =>
  // It returns a Promise that resolves only after:
  // All ongoing user interactions/animations are finished
  // The JS thread is free of “high priority” UI work
  // The next frame has been scheduled and painted
  new Promise<void>((resolve) => {
    setTimeout(() => {
      requestAnimationFrame(() => resolve());
    }, 10);
  });
