import 'modern-normalize/modern-normalize.css';
import '../styles/globals.css';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
	return (
		<>
			<Component {...pageProps} />
			<Script
				defer
				data-api="https://metrics.lu.ke/api/event"
				data-domain="howmanyconfs.com"
				src="https://metrics.lu.ke/js/script.js"
				strategy="afterInteractive"
			/>
		</>
	);
}
