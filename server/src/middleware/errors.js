function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Express 5 сам передаёт сюда ошибки из async-обработчиков.
// 4xx (наши HttpError и ошибки express.json, например битый JSON) уходят клиенту как есть,
// 5xx логируются, а клиент видит только общее сообщение
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);

  const body = { error: err.expose ? err.message : 'Internal server error' };
  if (err.details) body.details = err.details;
  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
