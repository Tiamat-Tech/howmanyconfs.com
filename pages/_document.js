import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="shortcut icon" href="/arm.png" />
				<meta charSet="utf-8" />
				<meta name="description" content="How many confirmations are equivalent to 6 Bitcoin confirmations?" />
				<meta property="og:site_name" content="How Many Confs?" />
				<meta property="og:title" content="How Many Confs?" />
				<meta property="og:type" content="website" />
				<meta property="og:image" content="/card.png" />
				<meta property="og:description" content="How many confirmations are equivalent to 6 Bitcoin confirmations?" />
				<meta property="og:url" content="https://howmanyconfs.com" />
				<meta property="twitter:card" content="summary_large_image" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
