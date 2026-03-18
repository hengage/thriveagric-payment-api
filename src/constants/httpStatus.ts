export const HTTP_STATUS = {
  OK:                  { code: 200, name: 'OK' },
  CREATED:             { code: 201, name: 'CREATED' },
  NO_CONTENT:          { code: 204, name: 'NO CONTENT' },
  BAD_REQUEST:         { code: 400, name: 'BAD REQUEST' },
  UNAUTHORIZED:        { code: 401, name: 'UNAUTHORIZED' },
  FORBIDDEN:           { code: 403, name: 'FORBIDDEN' },
  NOT_FOUND:           { code: 404, name: 'NOT FOUND' },
  CONFLICT:            { code: 409, name: 'CONFLICT' },
  UNPROCESSABLE:       { code: 422, name: 'UNPROCESSABLE ENTITY' },
  TOO_MANY_REQUESTS:   { code: 429, name: 'TOO MANY REQUESTS' },
  SERVER_ERROR:        { code: 500, name: 'SERVER ERROR' },
} as const;

export type HttpStatusEntry = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
