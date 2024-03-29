
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super();
    this.status = status;
    this.message = message;
  }
  static badFormData(message: string) {
    return new ApiError(400, message);
  }

  static unAuth(message: string) {
    return new ApiError(409, message);
  }

  static unauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован');
  }

  static badRequest(message: string) {
    return new ApiError(404, message);
  }

  static internal(message: string) {
    return new ApiError(500, message);
  }

  static forbidden(message: string) {
    return new ApiError(403, message || 'Forbidden');
  }
}
