export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly userMessage: string,
    public readonly cause?: unknown,
  ) {
    super(code);

    this.name = "AppError";
  }
}
