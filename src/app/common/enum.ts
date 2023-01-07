export enum DefaultPaging {
  PAGE = 1,
  LIMIT = 10,
}

export enum TokenType {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export enum KYCStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export enum ReadNotifyType {
  READ_ALL = 1,
  READ_MANY = 2,
}

export enum SocketEventName {
  NewNotification = 'new-notification',
  Notification = 'notification',
}

export enum NotifyReceiverType {
  USER = 'user',
  ADMIN = 'admin',
}

export enum NotifyResourceType {
  TRANSACTION = 'transaction',
  BONUS_LEVEL = 'bonus-level',
  SYSTEM = 'system',
  NEWS = 'news',
}

export enum NotifyType {
  WITHDRAWAL_APPROVED = 'withdrawal-approved',
  WITHDRAWAL_REJECTED = 'withdrawal-rejected',
  BONUS_LEVEL = 'bonus-level',
}

export enum CommissionType {
  DIRECT_COMMISSION = 1,
  REVENUE_COMMISSION = 2,
}

export enum QueueJob {
  STAKING_QUEUE_JOB = 'staking-queue-job',
  USER_QUEUE_JOB = 'user-queue-job',
}

export enum QueueJobProcessor {
  DAILY_STAKING_PROFIT = 'daily-staking-profit',
  DAILY_BINARY_COMMISSION = 'daily-binary-commission',
}

export const CommonJobConcurrency = 1;

export enum TransactionType {
  DEPOSIT = 1,
  WITHDRAW = 2,
}

export enum LogBonusLevelStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export enum TransactionStatus {
  PENDING = 1,
  CONFIRMED = 2,
  REJECTED = 3,
  FAILED = 4,
}

export enum SystemConfigKey {
  MINIMUM_WITHDRAWAL = 'minimum_withdrawal',
  MAXIMUM_WITHDRAWAL = 'maximum_withdrawal',
  WITHDRAWAL_FEE = 'withdrawal_fee',
  DEPOSIT_CONFIG = 'deposit_config',
  SCF_PRICE = 'scf_price',
  PAY_WITHDRAW_WALLET_PRIVATE_KEY = 'pay_withdraw_wallet_private_key',
}

export const defaultDepositConfig = {
  depositAddress: '6VY9a2KhWo9T2t1pjh5AsCHAeCuoKYPw7CWKDGakCwUU',
};

export const defaultWithdrawalConfig = {
  withdrawPrivatekey: 'dc874f2f95b66c41786fe266861298f6e69a5da72e709d987915b80760a3e10e',
};

export const AdminRoles = {
  MASTER_ADMIN: 'masterAdmin',
  ADMIN: 'admin',
};

export const POOLS = { RENTING: 'Renting Pool' };
export const HARVEST_DURATION = 86400;

export const saltRounds = 10;

export enum Currency {
  USDT = 1,
  SCF = 2,
  BUSD = 3,
}

export enum NFTStatus {
  ACTIVE = 0,
  RENTING = 1,
  TERMINATED = 2,
}
