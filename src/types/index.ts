export type Escrow = {
  address: string;
  initializer: string;
  initializerAmount: number;
  mintA: string;
  mintB: string;
  takerAmount: number;
};

export enum EscrowActionType {
  NOT_CONNECTED = "NOT_CONNECTED",
  CLOSE = "CLOSE",
  ACCEPT = "ACCEPT",
}

export type TokenMeta = {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  image: string;
};
