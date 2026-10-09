import {
  AuthenticationError,
  ConflictError,
  CursorError,
  NotFoundError,
  PasswordBusyError,
} from '@support-desk/data';
import type { FastifyInstance } from 'fastify';
export const registerErrors = (app: FastifyInstance) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof PasswordBusyError)
      return reply
        .code(503)
        .header('Retry-After', '1')
        .send({ message: error.message });
    if (error instanceof CursorError)
      return reply.code(400).send({ message: error.message });
    if (error instanceof AuthenticationError)
      return reply.code(401).send({ message: error.message });
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    )
      return reply
        .code(409)
        .send({ message: 'The record already exists. Refresh and try again.' });
    if (error instanceof ConflictError)
      return reply.code(409).send({ message: error.message });
    if (error instanceof NotFoundError)
      return reply.code(404).send({ message: error.message });
    if (error instanceof Error && 'validation' in error)
      return reply.code(400).send({ message: 'Request validation failed.' });
    const status =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number(error.statusCode)
        : 500;
    if (status >= 400 && status < 500)
      return reply.code(status).send({
        message:
          status === 429
            ? 'Too many requests. Try again shortly.'
            : 'Request rejected.',
      });
    request.log.error(error, 'Request failed');
    return reply.code(500).send({
      message: 'The service could not complete this request. Try again.',
    });
  });
};
