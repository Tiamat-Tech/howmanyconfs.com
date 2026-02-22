import { getCoinData } from './coins.js';
import { getAlgorithms } from './algorithms.js';

const algorithms = getAlgorithms();

const getCoinAlgorithm = coin => {
	return algorithms.find(algorithm => algorithm.name.toLowerCase() === coin.algorithm.toLowerCase());
};

export const getData = async () => {
	const coins = await getCoinData();

	const data = coins
		.filter(coin => getCoinAlgorithm(coin))
		.map(coin => {
			const algorithm = getCoinAlgorithm(coin);
			coin.watts = (coin.hashrate * algorithm.joulesPerHash);

			return coin;
		});

	return data;
};
