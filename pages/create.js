import { useState } from "react";
import Layout from "components/Layout";
import styles from "styles/pages/Create.module.scss";

export default function Create() {
	const [dao1Name, setDao1Name] = useState("");
	const [dao1Address, setDao1Address] = useState("");
	const [dao2Name, setDao2Name] = useState("");
	const [dao2Address, setDao2Address] = useState("");
	const [timeout, setTimeout] = useState(240);

	return (
		<Layout>
			<div className={styles.create}>
				<div className="sizer">
					<h3>Create game</h3>
					<p>Some description about this.</p>

					<div className={styles.create__form}>
						<div>
							<h4>DAO Competitor #1</h4>
							<span>
								Name and governance token address of first competing DAO.
							</span>
							<input
								type="text"
								placeholder="Gitcoin DAO"
								value={dao1Name}
								onChange={(e) => setDao1Name(e.target.value)}
							/>
							<input
								type="text"
								placeholder="0xde30da39c46104798bb5aa3fe8b9e0e1f348163f"
								value={dao1Address}
								onChange={(e) => setDao1Address(e.target.value)}
							/>
						</div>
						<div>
							<h4>DAO Competitor #1</h4>
							<span>
								Name and governance token address of second competing DAO.
							</span>
							<input
								type="text"
								placeholder="PleasrDAO"
								value={dao2Name}
								onChange={(e) => setDao2Name(e.target.value)}
							/>
							<input
								type="text"
								placeholder="0xba962a81f78837751be8a177378d582f337084e6"
								value={dao2Address}
								onChange={(e) => setDao2Address(e.target.value)}
							/>
						</div>
						<div>
							<h4>Turn timeout (minutes)</h4>
							<span>Some description about this</span>
							<input
								type="number"
								min="5"
								step="5"
								placeholder="240"
								value={timeout}
								onChange={(e) => setTimeout(e.target.value)}
							/>
						</div>

						<button>Create game</button>
					</div>
				</div>
			</div>
		</Layout>
	);
}
