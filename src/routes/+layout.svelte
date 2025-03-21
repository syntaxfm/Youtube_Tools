<script>
  import '../app.css';
  import { enhance } from '$app/forms';
  
  let { data } = $props();
</script>

<header class="header">
  <div class="container">
    <div class="header-content">
      <div class="header-left">
        <a href="/" class="logo">YouTube Tools</a>
        {#if data.isLoggedIn}
          <nav class="nav-links">
            <a href="/stats">Stats</a>
            <a href="/tools">Tools</a>
          </nav>
        {/if}
      </div>
      {#if data.isLoggedIn}
        <form method="POST" action="/?/logout" use:enhance>
          <button type="submit" class="logout-btn">Logout</button>
        </form>
      {/if}
    </div>
  </div>
</header>

<slot />

<style>
  .header {
    background-color: var(--color-white);
    box-shadow: var(--shadow-sm);
    padding: var(--spacing-lg) 0;
    margin-bottom: var(--spacing-xl);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-xl);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-dark);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: var(--spacing-lg);
  }

  .nav-links a {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--transition-fast);
  }

  .nav-links a:hover {
    color: var(--color-primary);
  }

  .logout-btn {
    background-color: transparent;
    color: var(--color-black);
    border: none;
		box-shadow: 1px 1px 4px rgb(0 0 0 / 0.1);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color var(--transition-fast);
  }

  .logout-btn:hover {
    background-color: #6a1a21;
  }
</style> 