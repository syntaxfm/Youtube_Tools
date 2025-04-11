<script>
	import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_GOOGLE_REDIRECT } from '$env/static/public';
</script>

<div class="login-container gradient-bg">
	<div class="login-content glass-effect morph">
		<h1 class="float neon">YouTube Tools</h1>
		<p class="subtitle">Analyze your YouTube playlists and get insights</p>
		
		<a
			href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${PUBLIC_GOOGLE_REDIRECT}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline&prompt=consent`}
			class="google-btn cool-button cyber-border"
		>
			<img src="https://www.google.com/favicon.ico" alt="Google" class="google-icon pulse" />
			Login with Google
		</a>

		<div class="features">
			<div class="feature feature-card tilt">
				<svg xmlns="http://www.w3.org/2000/svg" class="feature-icon pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5"></path>
					<path d="M3 12v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"></path>
					<line x1="12" y1="17" x2="12" y2="7"></line>
				</svg>
				<span>Playlist Analysis</span>
			</div>
			<div class="feature feature-card tilt">
				<svg xmlns="http://www.w3.org/2000/svg" class="feature-icon pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="20" x2="18" y2="10"></line>
					<line x1="12" y1="20" x2="12" y2="4"></line>
					<line x1="6" y1="20" x2="6" y2="14"></line>
				</svg>
				<span>Detailed Stats</span>
			</div>
			<div class="feature feature-card tilt">
				<svg xmlns="http://www.w3.org/2000/svg" class="feature-icon pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="7 10 12 15 17 10"></polyline>
					<line x1="12" y1="15" x2="12" y2="3"></line>
				</svg>
				<span>Export Data</span>
			</div>
		</div>
	</div>
</div>

<style>
	.login-container {
		min-height: calc(100vh - 80px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
		position: relative;
		overflow: hidden;
	}

	.login-container::before {
		content: '';
		position: absolute;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%);
		opacity: 0.3;
		animation: float 8s ease-in-out infinite;
		z-index: 0;
	}

	.login-container::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%232563eb' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
		opacity: 0.5;
		z-index: 0;
	}

	.login-content {
		text-align: center;
		max-width: 480px;
		width: 100%;
		padding: var(--spacing-3xl);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xl);
		position: relative;
		z-index: 1;
		transform-style: preserve-3d;
		perspective: 1000px;
		background: rgba(255, 255, 255, 0.9);
	}

	h1 {
		font-size: var(--text-4xl);
		color: var(--color-text-dark);
		margin-bottom: var(--spacing-sm);
		font-weight: 800;
		letter-spacing: -0.025em;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
	}

	.subtitle {
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-2xl);
		font-size: var(--text-lg);
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
	}

	.google-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		background-color: var(--color-white);
		color: var(--color-text-dark);
		padding: var(--spacing-md) var(--spacing-xl);
		border-radius: var(--radius-lg);
		text-decoration: none;
		font-weight: 500;
		transition: all var(--transition-fast);
		width: 100%;
		max-width: 300px;
		box-shadow: var(--shadow-sm);
		position: relative;
		overflow: hidden;
	}

	.google-btn:hover {
		background-color: var(--color-gray-100);
		box-shadow: var(--shadow-md);
		transform: translateY(-2px) scale(1.02);
	}

	.google-icon {
		width: 20px;
		height: 20px;
	}

	.features {
		margin-top: var(--spacing-3xl);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-xl);
		padding-top: var(--spacing-2xl);
		border-top: 1px solid var(--color-border);
	}

	.feature {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
		background: rgba(255, 255, 255, 0.5);
	}

	.feature:hover {
		background-color: var(--color-primary-light);
		transform: translateY(-4px) scale(1.05);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}

	.feature-icon {
		width: 32px;
		height: 32px;
		color: var(--color-primary);
	}

	.feature span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: 500;
	}
</style>
