export const credentials = {
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 254,
      examples: ['reviewer@example.test'],
    },
    password: {
      type: 'string',
      minLength: 12,
      maxLength: 128,
      examples: ['A unique local passphrase 123!'],
    },
  },
};
export const params = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      examples: ['11111111-1111-4111-8111-111111111111'],
    },
  },
};
export const pagination = {
  limit: {
    type: 'string',
    pattern: '^([1-9]|[1-4][0-9]|50)$',
    examples: ['12'],
    description: 'Page size 1–50. Tickets default to 12; history to 8.',
  },
  cursor: {
    type: 'string',
    minLength: 1,
    maxLength: 900,
    description:
      'Opaque nextCursor from the previous response. Omit to restart; never construct or modify it.',
  },
};
export const bodyEmpty = {
  type: 'object',
  additionalProperties: false,
  properties: {},
};
