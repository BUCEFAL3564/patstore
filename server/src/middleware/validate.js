const { HttpError } = require('../lib/httpError');

// Проверяет req[source] по zod-схеме и кладёт очищенные данные в req.validated[source].
// В req.query в Express 5 записать нельзя, поэтому результат хранится отдельно
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new HttpError(400, 'Validation failed', details));
    }
    req.validated = { ...req.validated, [source]: result.data };
    next();
  };
}

module.exports = validate;
