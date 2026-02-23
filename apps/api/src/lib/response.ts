export class ResponseBuilder {
  static success<T>(data: T, message: string = 'Success') {
    return {
      success: true,
      message: message,
      data,
    };
  }

  static error(message: string) {
    return {
      success: false,
      message,
    };
  }
}
