// Helius API — free tier: 10k credits/day
const BASE = "https://api.helius.xyz/v0";
const RPC_BASE = "https://mainnet.helius-rpc.com";

function getApiKey() {
  return process.env.HELIUS_API_KEY || "";
}

export async function getTokenHolders(mint) {
  try {
    const key = getApiKey();
    if (!key) return getMockHolders();

    const res = await fetch(`${RPC_BASE}/?api-key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "holders",
        method: "getProgramAccounts",
        params: [
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          {
            encoding: "jsonParsed",
            filters: [
              { dataSize: 165 },
              { memcmp: { offset: 0, bytes: mint } }
            ]
          }
        ]
      })
    });
    if (!res.ok) return getMockHolders();
    const data = await res.json();
    const accounts = data.result || [];
    return accounts
      .map((acc) => ({
        account: acc.pubkey,
        amount: acc.account?.data?.parsed?.info?.tokenAmount?.amount || 0,
        decimals: acc.account?.data?.parsed?.info?.tokenAmount?.decimals || 0,
        uiAmount: acc.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0,
        uiAmountString: acc.account?.data?.parsed?.info?.tokenAmount?.uiAmountString || "0",
      }))
      .filter((h) => h.uiAmount > 0)
      .sort((a, b) => b.uiAmount - a.uiAmount)
      .slice(0, 20);
  } catch (e) {
    return getMockHolders();
  }
}

export async function getTransactionHistory(address, limit = 20) {
  try {
    const key = getApiKey();
    if (!key) return [];
    const res = await fetch(`${BASE}/addresses/${address}/transactions?api-key=${key}&limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function getWalletTokens(wallet) {
  try {
    const key = getApiKey();
    if (!key) return [];
    const res = await fetch(`${BASE}/addresses/${wallet}/balances?api-key=${key}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.tokens || [];
  } catch (e) {
    return [];
  }
}

function getMockHolders() {
  return Array.from({ length: 10 }, (_, i) => ({
    account: `Holder${i}${"1".repeat(30)}`,
    amount: Math.floor(Math.random() * 1000000000),
    decimals: 9,
    uiAmount: Math.random() * 100000,
    uiAmountString: (Math.random() * 100000).toFixed(2),
  }));
}
