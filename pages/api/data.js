import { getData } from '../../lib/data.js';

export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.json(await getData());
}
