import Head from "next/head"; // Head + meta
import Link from "next/link"; // Routing
import state from "utils/state"; // Global state
import NextNProgress from "nextjs-progressbar"; // Navigation progress bar
import styles from "styles/components/Layout.module.scss"; // Component styles
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"; // Address avatar

export default function Layout({ children }) {
  return (
    <div>
      {/* Navigation progress bar */}
      <NextNProgress
        color="#282846"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        options={{
          showSpinner: false,
        }}
      />

      {/* HTML Meta + Header */}
      <Meta />
      <Header />

      {/* Inject child content */}
      <div className={styles.layout__content}>{children}</div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// HTML Head
function Meta() {
  return (
    <Head>
      {/* Google fonts */}
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
}

// Header (+ auth management)
function Header() {
  // Collect address and unlock function from global state
  const { address, unlock } = state.useContainer();

  return (
    <div className={styles.layout__header}>
      <div className="sizer">
        {/* Logo */}
        <div>
          <Link href="/">
            <a>
              <img src="/vectors/logo.svg" alt="logo" height="24" width="156" />
            </a>
          </Link>
        </div>

        {/* Auth button */}
        <div>
          <button onClick={unlock}>
            {address ? (
              // If authenticated
              <>
                {/* Render address */}
                <span>
                  {address.startsWith("0x")
                    ? // If ETH address, render truncated address
                      address.substr(0, 6) +
                      "..." +
                      address.slice(address.length - 4)
                    : // Else, render ENS name
                      address}
                </span>
                {/* Render avatar */}
                <Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
              </>
            ) : (
              // Else, display Connect Wallet prompt
              "Connect Wallet"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Footer
function Footer() {
  return (
    <div className={styles.layout__footer}>
      <div className="sizer">
        {/* Credits */}
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

        {/* Links */}
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
