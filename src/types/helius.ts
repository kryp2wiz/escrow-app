export type NativeBalance = {
  lamports: number;
};

export type TokenBalance = {
  id: string;
  token_info: {
    balance: number;
    decimals: number;
  };
};

export type SearchAssetsResponse = {
  items: TokenBalance[];
  nativeBalance: NativeBalance;
};

export type RpcResponse<T> = {
  result: T;
};
