export const idParams = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};
export const emptyBody = {
  type: 'object',
  additionalProperties: false,
  properties: {},
};
