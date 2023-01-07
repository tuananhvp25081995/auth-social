export const IORedisKey = 'IORedis';

export const userOnlineKey = (userId: number) => `UserOnline:${userId}`;

export const userVerifiedKey = (publicAddress: string) => `UserVerified:${publicAddress}`;

export const userVerifiedTokenKey = (publicAddress: string) => `UserVerifiedToken:${publicAddress}`;

export const userResetPassTokenKey = (publicAddress: string) => `UserResetPassToken:${publicAddress}`;

export const userResetPassKey = (publicAddress: string) => `UserResetPass:${publicAddress}`;

export const genNFTEnergy = (nftId: number) => `NFTEnergy:${nftId}`;

export const genTxDepositStakeNeedSign = (userId: number, depositId: number) =>
  `DepositStakeNeedSign:${userId}:${depositId}`;
