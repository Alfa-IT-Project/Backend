import { createReward, getAllRewards, getRewardById, updateReward, deleteReward, redeemPoints, getAllTiers} from '../repositeries/rewards_repositery.js';
  
  const RewardsService = {
    //how to auto generate time as create 
    createReward: async (data) => await createReward(data),
    getAllRewards: async () => await getAllRewards(),
    getRewardById: async (id) => await getRewardById(id),
    updateReward: async (id, data) => await updateReward(id, data),
    deleteReward: async (id) => await deleteReward(id),
    redeemPoints: async (userId, points) => await redeemPoints(userId, points),
    getAllTiers: async () => await getAllTiers()
  };
  
  export default RewardsService;
  