import {Html, Head, Main, NextScript} from 'next/document'
export default function Document() {
	return (
		<Html>
			<Head>
				<link rel='manifest' href='/manifest.json' />
				<link rel='apple-touch-icon' href='/icon.png'></link>
				<meta name='theme-color' content='#fff' />
				<script
					dangerouslySetInnerHTML={{
						__html: `
              (function() {
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    const stored = localStorage.getItem('the-shed-storage');
                    if (stored) {
                      const parsed = JSON.parse(stored);
                      if (parsed?.state?.dark_mode === true) {
                        document.documentElement.classList.add('dark');
                      }
                    }
                  }
                } catch (e) {
                  // Silently fail if localStorage is not available
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
