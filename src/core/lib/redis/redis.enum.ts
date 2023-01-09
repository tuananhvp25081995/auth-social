export const IORedisKey = 'IORedis';

export const userOnlineKey = (userId: number) => `UserOnline:${userId}`;

export const userVerifiedKey = (username: string) => `UserVerified:${username}`;

export const userVerifiedTokenKey = (username: string) => `UserVerifiedToken:${username}`;

export const userResetPassTokenKey = (username: string) => `UserResetPassToken:${username}`;

export const userResetPassKey = (username: string) => `UserResetPass:${username}`;

export const genNFTEnergy = (nftId: number) => `NFTEnergy:${nftId}`;

export const genTxDepositStakeNeedSign = (userId: number, depositId: number) =>
  `DepositStakeNeedSign:${userId}:${depositId}`;
