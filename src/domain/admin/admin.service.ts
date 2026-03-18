import { adminRepository } from './admin.repository';
import { toMajorUnits } from '../../utils/money.utils';

export const adminService = {
  async getBestProfession(start: Date, end: Date) {
    const result = await adminRepository.getBestProfession(start, end);
    
    if (!result) {
      return null;
    }

    return {
      profession: result.profession,
      totalEarned: toMajorUnits(Number(result.totalEarned)),
    };
  },

  async getBestClients(start: Date, end: Date, limit: number) {
    const results = await adminRepository.getBestClients(start, end, limit);
    
    return results.map((client) => ({
      id: client.id,
      fullName: client.fullName,
      paid: toMajorUnits(Number(client.paid)),
    }));
  },
};
