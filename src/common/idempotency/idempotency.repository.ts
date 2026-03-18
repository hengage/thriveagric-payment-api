import { Transaction } from 'sequelize';
import { IdempotencyKey } from './idempotencyKey.model';

export const idempotencyRepository = {
  async findByKey(key: string): Promise<IdempotencyKey | null> {
    return IdempotencyKey.findByPk(key);
  },

  async create(
    key: string,
    resource: string,
    resourceId: number,
    response: object,
    transaction?: Transaction
  ): Promise<IdempotencyKey> {
    return IdempotencyKey.create(
      { key, resource, resourceId, response },
      { transaction }
    );
  },
};
