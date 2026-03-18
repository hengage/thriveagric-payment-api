import { contractsRepository } from './contracts.repository';

export const contractsService = {
  async getContractById(id: number, profileId: number) {
    return contractsRepository.findByIdForProfile(id, profileId);
  },

  async getContracts(profileId: number) {
    return contractsRepository.findAllForProfile(profileId);
  },
};
