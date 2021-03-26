export class ApplicationError extends Error {
  public constructor(
    public readonly name: string,
    public readonly message: string,
    public readonly status: number,
  ) {
    super();
  }

  static toSocketError(error: ApplicationError) {
    return {
      ok: false,
      message: error.message,
      name: error.name,
    };
  }
}
