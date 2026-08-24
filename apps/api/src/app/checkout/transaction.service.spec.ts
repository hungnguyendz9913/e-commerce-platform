import {
  DatabaseService,
  TransactionService,
} from '@e-commerce-platform/database';

describe('TransactionService', () => {
  it('retries serialization conflicts and uses serializable isolation', async () => {
    const transaction = { id: 'tx' };
    const databaseService = {
      $transaction: jest
        .fn()
        .mockRejectedValueOnce({ code: 'P2034' })
        .mockImplementationOnce((callback) => callback(transaction)),
    };
    const service = new TransactionService(
      databaseService as unknown as DatabaseService,
    );
    const callback = jest.fn().mockResolvedValue('result');

    await expect(service.runSerializable(callback)).resolves.toBe('result');

    expect(databaseService.$transaction).toHaveBeenCalledTimes(2);
    expect(databaseService.$transaction).toHaveBeenNthCalledWith(2, callback, {
      isolationLevel: 'Serializable',
    });
    expect(callback).toHaveBeenCalledWith(transaction);
  });

  it('does not retry non-serialization errors', async () => {
    const error = new Error('database unavailable');
    const databaseService = {
      $transaction: jest.fn().mockRejectedValue(error),
    };
    const service = new TransactionService(
      databaseService as unknown as DatabaseService,
    );

    await expect(service.runSerializable(jest.fn())).rejects.toBe(error);
    expect(databaseService.$transaction).toHaveBeenCalledTimes(1);
  });
});
