import { Op, fn, col, literal } from 'sequelize';
import { Profile } from '../profiles/profile.model';
import { Contract } from '../contracts/contract.model';
import { Job } from '../jobs/job.model';

interface BestProfessionResult {
  profession: string;
  totalEarned: string;
}

interface BestClientResult {
  id: number;
  fullName: string;
  paid: string;
}

export const adminRepository = {
  async getBestProfession(start: Date, end: Date): Promise<BestProfessionResult | null> {
    const results = await Job.findAll({
      attributes: [
        [fn('SUM', col('Job.price')), 'totalEarned'],
      ],
      where: {
        paid: true,
        paymentDate: { [Op.between]: [start, end] },
      },
      include: [
        {
          model: Contract,
          attributes: [],
          required: true,
          include: [
            {
              model: Profile,
              as: 'contractor',
              attributes: ['profession'],
              required: true,
            },
          ],
        },
      ],
      group: ['contract->contractor.id', 'contract->contractor.profession'],
      order: [[literal('"totalEarned"'), 'DESC']],
      limit: 1,
      raw: true,
    });

    if (!results.length) return null;

    const row = results[0] as any;
    return {
      profession: row['contract.contractor.profession'],
      totalEarned: row.totalEarned,
    };
  },

  async getBestClients(start: Date, end: Date, limit: number = 2): Promise<BestClientResult[]> {
    const results = await Job.findAll({
      attributes: [
        [fn('SUM', col('Job.price')), 'paid'],
      ],
      where: {
        paid: true,
        paymentDate: { [Op.between]: [start, end] },
      },
      include: [
        {
          model: Contract,
          attributes: [],
          required: true,
          include: [
            {
              model: Profile,
              as: 'client',
              attributes: ['id', 'firstName', 'lastName'],
              required: true,
            },
          ],
        },
      ],
      group: ['contract->client.id', 'contract->client.firstName', 'contract->client.lastName'],
      order: [[literal('"paid"'), 'DESC']],
      limit,
      raw: true,
    });

    return results.map((row: any) => ({
      id: row['contract.client.id'],
      fullName: `${row['contract.client.firstName']} ${row['contract.client.lastName']}`,
      paid: row.paid,
    }));
  },
};
