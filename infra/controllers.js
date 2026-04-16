import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
} from "./errors";

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, req, res) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return res.status(error.statusCode).json(error);
  }

  const publicObjectError = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.error(publicObjectError);

  res.status(publicObjectError.statusCode).json(publicObjectError);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
