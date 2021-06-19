import Head from "next/head";
import Link from "next/link";
import styles from "@styles/components/Layout.module.scss";
import NextNProgress from "nextjs-progressbar"; // Navigation progress bar
import eth from "@state/eth";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

export default function Layout({ children }) {
	return (
		<div>
			{/* Navigation progress bar */}
			<NextNProgress
				color="#282846"
				startPosition={0.3}
				stopDelayMs={200}
				height="3"
				options={{
					showSpinner: false,
				}}
			/>

			<Meta />
			<Header />

			<div className={styles.layout__content}>{children}</div>

			<Footer />
		</div>
	);
}

function Meta() {
	return (
		<Head>
			<link rel="preconnect" href="https://fonts.gstatic.com" />
			<link
				href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
				rel="stylesheet"
			/>
		</Head>
	);
}

function Header() {
	const { address, unlock } = eth.useContainer();

	return (
		<div className={styles.layout__header}>
			<div className="sizer">
				<div>
					<Link href="/">
						<a>
							<img src="/logo.svg" alt="logo" height="24" width="156" />
						</a>
					</Link>
				</div>
				<div>
					<button onClick={unlock}>
						{address ? (
							<>
								<span>
									{address.startsWith("0x")
										? // If ETH address, render truncated address
										  address.substr(0, 6) +
										  "..." +
										  address.slice(address.length - 4)
										: // Else, render ENS name
										  address}
								</span>
								<Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
							</>
						) : (
							"Connect Wallet"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

function Footer() {
	return (
		<div className={styles.layout__footer}>
			<div className="sizer">
				<div>
					<span>
						Inspired by{" "}
						<a
							href="https://twitter.com/_Dave__White_/status/1405694036501954567?s=20"
							target="_blank"
							rel="noopener noreferrer"
						>
							Dave
						</a>
						. Developed by{" "}
						<a
							href="https://twitter.com/_anishagnihotri"
							target="_blank"
							rel="noopener noreferrer"
						>
							Anish
						</a>
						.
					</span>
				</div>
				<div>
					<ul>
						<li>
							<a
								href="https://github.com/anish-agnihotri/daochess.org"
								target="_blank"
								rel="noopener noreferrer"
							>
								GitHub
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
