import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { getData } from '../lib/data.js';
import { getCoinList } from '../lib/coingecko.js';
import coinBlackList from '../js/coin-blacklist';
import formatDollars from '../js/format-dollars';
import formatSeconds from '../js/format-seconds';
import formatUnits from '../js/format-units';
import packageJson from '../package.json';

const BITCOIN_CONFIRMATIONS = 6;

function processCoins(rawCoins, symbolToSlug) {
	const bitcoin = rawCoins.find(coin => coin.symbol === 'BTC');
	if (!bitcoin) return [];

	const seen = new Set();
	return rawCoins
		.filter(coin => {
			if (seen.has(coin.symbol)) return false;
			seen.add(coin.symbol);
			return symbolToSlug[coin.symbol] && !coinBlackList.includes(coin.symbol);
		})
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

export default function Home({ initialCoins, symbolToSlug, coinNames, version }) {
	const [coins, setCoins] = useState(initialCoins);
	const [sortBy, setSortBy] = useState('marketCap');
	const [sortOrder, setSortOrder] = useState('asc');

	useEffect(() => {
		fetch('/api/data')
			.then(response => response.json())
			.then(rawCoins => {
				const processed = processCoins(rawCoins, symbolToSlug);
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
						<img className="bitcoin-logo" src="/crypto-icons/bitcoin.png" alt="btc" />
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
											<img src={`/crypto-icons/${symbolToSlug[coin.symbol]}.png`} alt={coin.symbol} />
											{coinNames[coin.symbol] || coin.name} <span className="ticker">{coin.symbol}</span>
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
	const [rawCoins, geckoCoins] = await Promise.all([
		getData(),
		getCoinList()
	]);

	// Load symbol→slug mapping from crypto-icons-plus
	const mapPath = path.join(process.cwd(), 'node_modules', 'crypto-icons-plus', 'map.min.json');
	let symbolSlugMap = {};
	try {
		symbolSlugMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
	} catch {
		// map file may not exist
	}

	// Read available icon filenames from disk
	const iconsDir = path.join(process.cwd(), 'public', 'crypto-icons');
	let availableIconSlugs = new Set();
	try {
		const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));
		for (const f of files) {
			availableIconSlugs.add(f.replace('.png', ''));
		}
	} catch {
		// Icons dir may not exist yet
	}

	// Build symbolToSlug: for each WhatToMine symbol, find a slug with an icon on disk
	const symbolToSlug = {};
	for (const coin of rawCoins) {
		const sym = coin.symbol.toUpperCase();
		const slugs = symbolSlugMap[sym];
		if (slugs) {
			const match = slugs.find(slug => availableIconSlugs.has(slug));
			if (match) {
				symbolToSlug[sym] = match;
			}
		}
	}

	// Build coinNames: look up by slug (which is a CoinGecko ID) for accurate names
	const geckoById = {};
	for (const entry of geckoCoins) {
		geckoById[entry.id] = entry.name;
	}
	const coinNames = {};
	for (const [sym, slug] of Object.entries(symbolToSlug)) {
		if (geckoById[slug]) {
			coinNames[sym] = geckoById[slug];
		}
	}

	// Deduplicate rawCoins by symbol (keep first = highest market cap)
	const seen = new Set();
	const dedupedCoins = rawCoins.filter(coin => {
		if (seen.has(coin.symbol)) return false;
		seen.add(coin.symbol);
		return true;
	});

	const coins = processCoins(dedupedCoins, symbolToSlug);
	const sorted = sortCoins(coins, 'marketCap', 'asc');

	return {
		props: {
			initialCoins: sorted,
			symbolToSlug,
			coinNames,
			version: packageJson.version
		}
	};
}
