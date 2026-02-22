import { getData } from '../../lib/data.js';

export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
	res.json(await getData());
}
