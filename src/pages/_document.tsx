/**
 * Custom Next.js Document
 *
 * This file customizes the HTML document structure that wraps all pages.
 * It runs only on the server and is used to modify the <html> and <body> tags.
 *
 * Key features:
 * - PWA manifest and icon configuration
 * - Dark mode initialization to prevent FOUC (Flash of Unstyled Content)
 * - Theme color meta tag for mobile browsers
 *
 * Note: This component is only rendered on the server, not in the browser.
 * Client-side code should not be added here.
 */
import {Html, Head, Main, NextScript} from 'next/document'

export default function Document() {
	return (
		<Html>
			<Head>
				{/* PWA Manifest - enables "Add to Home Screen" functionality */}
				<link rel='manifest' href='/manifest.json' />

				{/* Apple Touch Icon - icon shown when adding to iOS home screen */}
				<link rel='apple-touch-icon' href='/icon.png'></link>

				{/* Theme Color - sets the browser chrome color on mobile devices */}
				<meta name='theme-color' content='#fff' />

				{/**
				 * Dark Mode Initialization Script
				 *
				 * This script runs synchronously before React hydration to prevent
				 * a flash of unstyled content (FOUC) when dark mode is enabled.
				 *
				 * How it works:
				 * 1. Checks if localStorage is available (SSR-safe check)
				 * 2. Retrieves the app's storage key ('the-shed-storage')
				 * 3. Parses the stored state to check for dark_mode preference
				 * 4. If dark mode is enabled, adds the 'dark' class to <html> element
				 * 5. This class is used by Tailwind CSS to apply dark mode styles
				 *
				 * Why it's needed:
				 * Without this script, dark mode would only apply after React hydrates,
				 * causing a visible flash of light content. By running this in the
				 * initial HTML, the dark class is present from the first paint.
				 */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
              (function() {
                try {
                  // Check if we're in a browser environment with localStorage support
                  if (typeof window !== 'undefined' && window.localStorage) {
                    const stored = localStorage.getItem('the-shed-storage');
                    if (stored) {
                      const parsed = JSON.parse(stored);
                      // Apply dark mode class if user preference is stored
                      if (parsed?.state?.dark_mode === true) {
                        document.documentElement.classList.add('dark');
                      }
                    }
                  }
                } catch (e) {
                  // Silently fail if localStorage is not available or parsing fails
                  // This ensures the page still loads even if storage is unavailable
                }
              })();
            `,
					}}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
