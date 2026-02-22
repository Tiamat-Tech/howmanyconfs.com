const ANTMINER_S21_XP_WATTAGE = 3645;
const RTX_4090_WATTAGE = 260;
const RTX_4090_KAWPOW_WATTAGE = 330;
const RTX_4090_ZHASH_WATTAGE = 250;
const ANTMINER_L9_WATTAGE = 3570;
const AMD_RYZEN_9_9950X_WATTAGE = 170;
const ANTMINER_D9_WATTAGE = 2839;
const ANTMINER_Z15_PRO_WATTAGE = 2780;
const ANTMINER_DR7_WATTAGE = 2730;
const ANTMINER_K7_WATTAGE = 3080;

const rawHashes = (hashes, unit) => {
	const multiplier = {
		H: 1000 ** 0,
		KH: 1000 ** 1,
		MH: 1000 ** 2,
		GH: 1000 ** 3,
		TH: 1000 ** 4,
		PH: 1000 ** 5
	};

	return hashes * multiplier[unit];
};

export const getAlgorithms = () => [
	{ // https://support.bitmain.com/hc/en-us/articles/35383015643673-S21-XP-Specifications
		name: 'SHA-256',
		joulesPerHash: ANTMINER_S21_XP_WATTAGE / rawHashes(270, 'TH')
	},
	{ // https://whattomine.com/gpus/79-nvidia-geforce-rtx-4090
		name: 'Ethash',
		joulesPerHash: RTX_4090_WATTAGE / rawHashes(127, 'MH')
	},
	{ // https://support.bitmain.com/hc/en-us/articles/33850555425305-L9-Specifications
		name: 'Scrypt',
		joulesPerHash: ANTMINER_L9_WATTAGE / rawHashes(17, 'GH')
	},
	{ // https://pool.kryptex.com/device/cpu/AMD/ryzen-9-9950x
		name: 'RandomX',
		joulesPerHash: AMD_RYZEN_9_9950X_WATTAGE / rawHashes(27, 'KH')
	},
	{ // https://whattomine.com/gpus/79-nvidia-geforce-rtx-4090
		name: 'Etchash',
		joulesPerHash: RTX_4090_WATTAGE / rawHashes(127, 'MH')
	},
	{ // https://bt-miners.com/products/bitmain-antminer-d9-dash-miner-1770gh-s-bt-miners/
		name: 'X11',
		joulesPerHash: ANTMINER_D9_WATTAGE / rawHashes(1770, 'GH')
	},
	{ // https://www.asicminervalue.com/miners/bitmain/antminer-z15-pro
		name: 'Equihash',
		joulesPerHash: ANTMINER_Z15_PRO_WATTAGE / rawHashes(840, 'KH')
	},
	{ // https://miningnow.com/asic-miner/bitmain-antminer-dr7-127th-s/
		name: 'Blake (14r)',
		joulesPerHash: ANTMINER_DR7_WATTAGE / rawHashes(127, 'TH')
	},
	{ // https://whattomine.com/gpus/79-nvidia-geforce-rtx-4090
		name: 'Zhash',
		joulesPerHash: RTX_4090_ZHASH_WATTAGE / rawHashes(185, 'H')
	},
	{ // https://whattomine.com/gpus/79-nvidia-geforce-rtx-4090
		name: 'KawPow',
		joulesPerHash: RTX_4090_KAWPOW_WATTAGE / rawHashes(67, 'MH')
	},
	{ // https://www.asicminervalue.com/miners/bitmain/antminer-k7-63-5th
		name: 'Eaglesong',
		joulesPerHash: ANTMINER_K7_WATTAGE / rawHashes(63.5, 'TH')
	}
];
