import Layout from "components/Layout";
import Link from "next/link";
import Loader from "react-loader-spinner";
import styles from "styles/pages/Home.module.scss";

export default function Home() {
	const loading = false;
	const games = [];

	return (
		<Layout>
			<Capture />

			<div className="sizer">
				<div className={styles.home}>
					<h4>All Games</h4>

					<div className={styles.home__games}>
						{!loading ? (
							games.length > 0 ? (
								games.map((game, i) => {
									return <span>Test</span>;
								})
							) : (
								<div className={styles.home__games_empty}>
									<span>No Games Found</span>
								</div>
							)
						) : (
							<center>
								<Loader type="Oval" color="#007aff" height={50} width={50} />
							</center>
						)}
					</div>

					<Link href="/create">
						<a className={styles.home__create}>Create Game</a>
					</Link>
				</div>
			</div>
		</Layout>
	);
}

function Capture() {
	return (
		<div className={styles.home__capture}>
			<div className="sizer">
				<h3>Governance in action</h3>
				<p>
					daochess pits governance systems against each other in real-time games
					of Chess, testing mechanisms and coordination.
				</p>
			</div>
		</div>
	);
}
