class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  error?: Error;

  constructor(statusCode: number, data: T, message: string = "Success", err?: Error) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    if (statusCode >= 400) {
      this.error = err;
    }
  }
}

export default ApiResponse;
