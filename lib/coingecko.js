export async function getCoinList() {
	const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
	if (!response.ok) {
		throw new Error(`CoinGecko API error: ${response.status}`);
	}
	return response.json();
}
