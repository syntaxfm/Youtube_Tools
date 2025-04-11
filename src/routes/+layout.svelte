<script>
  import '../app.css';
  import { enhance } from '$app/forms';
  
  let { data } = $props();
</script>

<header class="header glass-effect">
  <div class="container">
    <div class="header-content">
      <div class="header-left">
        <a href="/" class="logo hover-lift pulse">YouTube Tools</a>
        {#if data.isLoggedIn}
          <nav class="nav-links">
            <a href="/stats" class="hover-lift feature-card">Stats</a>
            <a href="/tools" class="hover-lift feature-card">Tools</a>
          </nav>
        {/if}
      </div>
      {#if data.isLoggedIn}
        <form method="POST" action="/?/logout" use:enhance>
          <button type="submit" class="logout-btn hover-lift glow">Logout</button>
        </form>
      {/if}
    </div>
  </div>
</header>

<slot />

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: var(--spacing-md) 0;
    margin-bottom: var(--spacing-xl);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text-dark);
    text-decoration: none;
    letter-spacing: -0.025em;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .nav-links {
    display: flex;
    gap: var(--spacing-lg);
  }

  .nav-links a {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    font-size: var(--text-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
  }

  .nav-links a:hover {
    color: var(--color-primary);
    background-color: var(--color-primary-light);
    transform: translateY(-2px);
  }

  .nav-links a::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  .nav-links a:hover::before {
    left: 100%;
  }

  .logout-btn {
    background-color: var(--color-danger);
    color: var(--color-white);
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--text-sm);
    font-weight: 500;
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
  }

  .logout-btn:hover {
    background-color: var(--color-danger);
    opacity: 0.9;
    transform: translateY(-2px);
  }

  .logout-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  .logout-btn:hover::before {
    left: 100%;
  }
</style> 