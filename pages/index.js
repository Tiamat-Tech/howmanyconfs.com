import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { getData } from '../lib/data.js';
import coinBlackList from '../js/coin-blacklist';
import formatDollars from '../js/format-dollars';
import formatSeconds from '../js/format-seconds';
import formatUnits from '../js/format-units';
import getCoinName from '../js/get-coin-name';
import packageJson from '../package.json';

const BITCOIN_CONFIRMATIONS = 6;

function processCoins(rawCoins, availableIcons) {
	const bitcoin = rawCoins.find(coin => coin.symbol === 'BTC');
	if (!bitcoin) return [];

	return rawCoins
		.filter(coin => availableIcons.includes(coin.symbol.toLowerCase()) && !coinBlackList.includes(coin.symbol))
		.map(coin => {
			const multiplier = (bitcoin.watts / coin.watts);
			const workTime = (bitcoin.blockTimeInSeconds * BITCOIN_CONFIRMATIONS * multiplier);
			const confirmations = Math.ceil(workTime / coin.blockTimeInSeconds);
			const timeForConfs = (coin.blockTimeInSeconds * confirmations);

			return {
				...coin,
				multiplier,
				workTime,
				confirmations,
				timeForConfs
			};
		});
}

function sortCoins(coins, sortBy, sortOrder) {
	return [...coins].sort((a, b) => {
		if (sortOrder === 'asc') {
			return b[sortBy] - a[sortBy];
		}
		return a[sortBy] - b[sortBy];
	});
}

export default function Home({ initialCoins, availableIcons, version }) {
	const [coins, setCoins] = useState(initialCoins);
	const [sortBy, setSortBy] = useState('marketCap');
	const [sortOrder, setSortOrder] = useState('asc');

	useEffect(() => {
		fetch('/api/data')
			.then(response => response.json())
			.then(rawCoins => {
				const processed = processCoins(rawCoins, availableIcons);
				setCoins(sortCoins(processed, sortBy, sortOrder));
			})
			.catch(() => {});
	}, []);

	const handleSort = (newSortBy) => {
		let newSortOrder = 'asc';
		if (sortBy === newSortBy && sortOrder === 'asc') {
			newSortOrder = 'desc';
		}
		setSortBy(newSortBy);
		setSortOrder(newSortOrder);
		setCoins(sortCoins(coins, newSortBy, newSortOrder));
	};

	const sortedCoins = sortCoins(coins, sortBy, sortOrder);

	return (
		<>
			<Head>
				<title>How Many Confs?</title>
			</Head>
			<header className="header">
				<div className="wrapper">
					<div className="icons">
						<img className="bitcoin-logo" src="/crypto-icons/btc.svg" alt="btc" />
						<img className="arm" src="/arm.png" />
					</div>
					<h1>How many confirmations are equivalent<sup><a rel="noopener noreferrer" target="_blank" href="//github.com/lukechilds/howmanyconfs.com/blob/master/README.md#how-are-these-values-calculated">*</a></sup> to 6 Bitcoin confirmations?</h1>
				</div>
			</header>
			<section className="wrapper">
				<table className="results" data-sort-by={sortBy} data-sort-order={sortOrder}>
					{sortedCoins.length > 0 && (
						<>
							<thead>
								<tr>
									<td>Name</td>
									<td>
										<a data-sort="marketCap" {...(sortBy === 'marketCap' ? {'data-sort-active': ''} : {})} onClick={() => handleSort('marketCap')}>Market Cap</a>
									</td>
									<td>
										<a data-sort="multiplier" {...(sortBy === 'multiplier' ? {'data-sort-active': ''} : {})} onClick={() => handleSort('multiplier')}>Proof-of-Work</a>
									</td>
									<td>
										<a data-sort="confirmations" {...(sortBy === 'confirmations' ? {'data-sort-active': ''} : {})} onClick={() => handleSort('confirmations')}>Equivalent Confs</a>
									</td>
									<td>
										<a data-sort="timeForConfs" {...(sortBy === 'timeForConfs' ? {'data-sort-active': ''} : {})} onClick={() => handleSort('timeForConfs')}>Estimated Time</a>
									</td>
									<td>
										<a data-sort="multiplier" {...(sortBy === 'multiplier' ? {'data-sort-active': ''} : {})} onClick={() => handleSort('multiplier')}>Difference</a>
									</td>
								</tr>
							</thead>
							<tbody>
								{sortedCoins.map(coin => (
									<tr key={coin.symbol}>
										<td>
											<img src={`/crypto-icons/${coin.symbol.toLowerCase()}.svg`} alt={coin.symbol} />
											{`${getCoinName(coin)} (${coin.symbol})`}
										</td>
										<td>{formatDollars(coin.marketCap) || 'Unknown'}</td>
										<td>{`${coin.algorithm} @ ${formatUnits(coin.hashrate, 'H/s')}`} = {formatUnits(coin.watts, 'W')}</td>
										<td>{coin.confirmations.toLocaleString()} confs</td>
										<td>{formatSeconds(coin.timeForConfs)}</td>
										<td>{coin.symbol === 'BTC' ? '-' : `${Math.round(coin.multiplier).toLocaleString()}x slower`}</td>
									</tr>
								))}
							</tbody>
						</>
					)}
				</table>
			</section>
			<footer className="footer">
				<div className="wrapper">
					<span className="version">v{version}</span>
					{' - '}
					<a rel="noopener noreferrer" target="_blank" href="//github.com/lukechilds/howmanyconfs.com">Source code</a>
					{' - '}
					<a rel="noopener noreferrer" target="_blank" href="//github.com/lukechilds/howmanyconfs.com/issues">Report a bug</a>
					<div className="me">
						A thing by <a rel="noopener noreferrer" target="_blank" href="//lukechilds.co">@lukechilds</a>
					</div>
				</div>
			</footer>
		</>
	);
}

export async function getStaticProps() {
	const rawCoins = await getData();

	const iconsDir = path.join(process.cwd(), 'public', 'crypto-icons');
	let availableIcons = [];
	try {
		availableIcons = fs.readdirSync(iconsDir)
			.filter(f => f.endsWith('.svg'))
			.map(f => f.replace('.svg', ''));
	} catch {
		// Icons dir may not exist yet
	}

	const coins = processCoins(rawCoins, availableIcons);
	const sorted = sortCoins(coins, 'marketCap', 'asc');

	return {
		props: {
			initialCoins: sorted,
			availableIcons,
			version: packageJson.version
		}
	};
}
