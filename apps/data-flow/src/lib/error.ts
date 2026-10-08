export class DataFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataFlowError";
  }
}
