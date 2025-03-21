<script>
	import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_GOOGLE_REDIRECT } from '$env/static/public';
</script>

<div class="login-container">
	<div class="login-content">
		<h1>YouTube Tools</h1>
		<p class="subtitle">Analyze your YouTube playlists and get insights</p>
		
		<a
			href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${PUBLIC_GOOGLE_REDIRECT}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline&prompt=consent`}
			class="google-btn"
		>
			<img src="https://www.google.com/favicon.ico" alt="Google" class="google-icon" />
			Login with Google
		</a>
	</div>
</div>

<style>
	.login-container {
		min-height: calc(100vh - 80px); /* Account for header height */
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
	}

	.login-content {
		text-align: center;
		max-width: 400px;
		width: 100%;
		padding: var(--spacing-2xl);
		background-color: var(--color-white);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
	}

	h1 {
		font-size: 2.5rem;
		color: var(--color-text-dark);
		margin-bottom: var(--spacing-sm);
	}

	.subtitle {
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-2xl);
		font-size: 1.1rem;
	}

	.google-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		background-color: var(--color-white);
		color: var(--color-text-dark);
		padding: var(--spacing-md) var(--spacing-xl);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		text-decoration: none;
		font-weight: 500;
		transition: all var(--transition-fast);
		width: 100%;
		max-width: 300px;
	}

	.google-btn:hover {
		background-color: var(--color-gray-100);
		box-shadow: var(--shadow-sm);
	}

	.google-icon {
		width: 18px;
		height: 18px;
	}
</style>
