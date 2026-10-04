// Ошибка с HTTP-статусом: сообщение 4xx уходит клиенту, 5xx скрывается обработчиком в app.js
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.expose = status < 500;
    if (details) this.details = details;
  }
}

module.exports = { HttpError };
