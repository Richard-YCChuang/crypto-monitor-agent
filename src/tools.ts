import axios from "axios";

export async function get_price(coin: string): Promise<{ price: number; lastUpdated: string }> {
  const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}`);
  const price = res.data.market_data?.current_price?.usd;
  const lastUpdated = res.data.market_data?.last_updated;
  if (price === undefined) throw new Error(`找不到 ${coin} 的價格`);
  return {
    price,
    lastUpdated,
  };
}