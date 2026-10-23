export function createBindingSlot<T>(initial: T) {
  let value = initial;
  return {
    get: (): T => value,
    set: (next: T) => {
      value = next;
    },
  };
}
