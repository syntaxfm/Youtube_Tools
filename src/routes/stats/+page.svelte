<script>
  // App state with proper Svelte 5 runes
  const PLAYLIST_IDS = [
    'PLLnpHn493BHEEFzqQUKPqkb5kCjODDnCB',
    'PLLnpHn493BHGTMfQW80muoajR35mHZApM',
    'PLLnpHn493BHHHfwltu5BXXq7l9TFhw2kL',
    'PLLnpHn493BHFl_WfpbSJwZIEFyngkj_J_',
    'PLLnpHn493BHGBiEhXz-S7ni8swvP7ROWD',
    'PLLnpHn493BHFgYr9_pv60nDnsNFv7NIBR',
    'PLLnpHn493BHEzYBmj0NXkXOmDaNrajO31',
    'PLLnpHn493BHHtQvz4Y2SumwGzgjikMjNy',
    'PLLnpHn493BHFBCNpSFkW0K4bseDlP67c5',
    'PLLnpHn493BHH5MwR-ojd9eaeygK078AaQ',
    'PLLnpHn493BHHSnt6efgX0RR2bFhpVz84A',
  ];
  
  let playlistIds = $state(PLAYLIST_IDS);
  let loading = $state(false);
  let results = $state([]);
  let error = $state('');
  
  // Initialize with input array
  function setPlaylistIds(idsArray) {
    if (Array.isArray(idsArray) && idsArray.length > 0) {
      playlistIds = [...idsArray];
    }
  }
  
  // Batch analyze all playlists
  async function analyzeAllPlaylists() {
    if (playlistIds.length === 0) {
      error = 'No playlist IDs provided';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playlistIds })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze playlists');
      }
      
      results = await response.json();
      
      // Handle any playlists with errors
      const errorCount = results.filter(r => r.isError).length;
      if (errorCount > 0) {
        error = `Analysis completed with ${errorCount} error${errorCount > 1 ? 's' : ''}`;
      }
    } catch (err) {
      error = err.message || 'Failed to analyze playlists';
      results = [];
    } finally {
      loading = false;
    }
  }
  
  // Format large numbers for display
  function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
  }
  
  // Check if we have valid playlists
  let hasPlaylists = $derived(playlistIds.length > 0);
  let canAnalyze = $derived(hasPlaylists && !loading);
</script>

<div class="container">
  <h1>YouTube Playlist Analytics</h1>
  
  {#if hasPlaylists}
    <div class="playlists-section">
      <h2>Analyzing {playlistIds.length} Playlists</h2>
      <div class="playlist-ids">
        {#each playlistIds as id}
          <div class="playlist-badge">{id}</div>
        {/each}
      </div>
      
      <button
        on:click={analyzeAllPlaylists}
        disabled={!canAnalyze}
        class="btn btn-analyze"
      >
        {loading ? 'Analyzing...' : 'Analyze All Playlists'}
      </button>
    </div>
  {:else}
    <div class="waiting-message">
      <p>Waiting for playlist IDs to be provided...</p>
    </div>
  {/if}
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  
  {#if results.length > 0}
    <div class="results-section">
      <h2>Results (Sorted by Performance)</h2>
      
      <!-- Performance Overview -->
      <div class="performance-overview">
        <div class="overview-card">
          <h3>Top Performer</h3>
          <p class="big-number">{results[0].totalViews.toLocaleString()}</p>
          <p>Total Views</p>
          <p class="playlist-title">{results[0].playlistTitle}</p>
        </div>
        
        <div class="overview-card">
          <h3>Total Views</h3>
          <p class="big-number">
            {results
              .filter(r => !r.isError)
              .reduce((sum, r) => sum + r.totalViews, 0)
              .toLocaleString()}
          </p>
          <p>Across all playlists</p>
        </div>
        
        <div class="overview-card">
          <h3>Total Videos</h3>
          <p class="big-number">
            {results
              .filter(r => !r.isError)
              .reduce((sum, r) => sum + r.totalVideos, 0)
              .toLocaleString()}
          </p>
          <p>Across all playlists</p>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Playlist</th>
              <th>Videos</th>
              <th>Total Views</th>
              <th>Avg Views</th>
              <th>Engagement</th>
              <th>Total Duration</th>
              <th>Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {#each results as result, index}
              {#if result.isError}
                <tr class="error-row">
                  <td colspan="7">
                    <div class="error-result">
                      <span class="error-icon">⚠️</span>
                      <span>Error analyzing playlist {result.playlistId}: {result.error}</span>
                    </div>
                  </td>
                </tr>
              {:else}
                <tr class={index === 0 ? "top-performer" : ""}>
                  <td>
                    <div class="playlist-row-info">
                      {#if result.thumbnailUrl}
                        <img src={result.thumbnailUrl} alt="Thumbnail" class="playlist-thumb" />
                      {/if}
                      <div>
                        {result.playlistTitle}
                        <div class="playlist-id-small">{result.playlistId}</div>
                      </div>
                    </div>
                  </td>
                  <td>{result.totalVideos}</td>
                  <td>{formatNumber(result.totalViews)}</td>
                  <td>{formatNumber(result.avgViews)}</td>
                  <td>{result.engagementRate}</td>
                  <td>{result.totalDuration}</td>
                  <td>{result.avgDuration}</td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
      
      <div class="playlist-cards">
        {#each results.filter(r => !r.isError) as result, index}
          <div class={`playlist-card ${index === 0 ? "top-performer-card" : ""}`}>
            <div class="card-header">
              {#if result.thumbnailUrl}
                <img src={result.thumbnailUrl} alt="Thumbnail" class="card-thumbnail" />
              {/if}
              <h3>{result.playlistTitle}</h3>
            </div>
            <p class="playlist-id-small">{result.playlistId}</p>
            
            <div class="metrics-grid">
              <div class="metric">
                <p class="metric-label">Total Videos:</p>
                <p class="metric-value">{result.totalVideos}</p>
              </div>
              <div class="metric">
                <p class="metric-label">Total Views:</p>
                <p class="metric-value">{formatNumber(result.totalViews)}</p>
              </div>
              <div class="metric">
                <p class="metric-label">Avg Views:</p>
                <p class="metric-value">{formatNumber(result.avgViews)}</p>
              </div>
              <div class="metric">
                <p class="metric-label">Engagement Rate:</p>
                <p class="metric-value">{result.engagementRate}</p>
              </div>
              <div class="metric">
                <p class="metric-label">Total Duration:</p>
                <p class="metric-value">{result.totalDuration}</p>
              </div>
              <div class="metric">
                <p class="metric-label">Avg Duration:</p>
                <p class="metric-value">{result.avgDuration}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* CSS Variables */
  :global(:root) {
    /* Colors */
    --color-primary: #198754;
    --color-primary-hover: #157347;
    --color-primary-light: #d1e7dd;
    --color-danger: #842029;
    --color-danger-bg: #f8d7da;
    --color-text: #333;
    --color-text-light: #6c757d;
    --color-text-dark: #212529;
    --color-text-muted: #495057;
    --color-border: #dee2e6;
    --color-bg: #f8f9fa;
    --color-white: #fff;
    --color-gray-100: #f8f9fa;
    --color-gray-200: #e9ecef;
    
    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 0.75rem;
    --spacing-lg: 1rem;
    --spacing-xl: 1.5rem;
    --spacing-2xl: 2rem;
    
    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    
    /* Transitions */
    --transition-fast: 0.15s ease-in-out;
    --transition-normal: 0.2s ease;
  }
  
  /* Base styles */
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.5;
    color: var(--color-text);
    background-color: var(--color-bg);
    margin: 0;
    padding: 0;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-xl);
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: var(--spacing-xl);
    color: var(--color-text-dark);
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-lg);
    color: var(--color-text-dark);
  }
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-dark);
  }
  
  /* Playlists section */
  .playlists-section {
    margin-bottom: var(--spacing-2xl);
  }
  
  .playlist-ids {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xl);
  }
  
  .playlist-badge {
    background-color: var(--color-gray-200);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-sm);
    font-family: monospace;
    font-size: 0.875rem;
  }
  
  /* Waiting message */
  .waiting-message {
    padding: var(--spacing-lg);
    background-color: var(--color-gray-200);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }
  
  /* Button styles */
  .btn {
    display: inline-block;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: 1rem;
    border-radius: var(--radius-sm);
    border: none;
    transition: background-color var(--transition-fast);
  }
  
  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  
  .btn-analyze {
    background-color: var(--color-primary);
    color: var(--color-white);
    width: 100%;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-md);
  }
  
  .btn-analyze:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }
  
  /* Error message */
  .error-message {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
    background-color: var(--color-danger-bg);
    color: var(--color-danger);
    border-radius: var(--radius-sm);
  }
  
  /* Performance overview */
  .performance-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);
  }
  
  .overview-card {
    background-color: var(--color-white);
    padding: var(--spacing-xl);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    text-align: center;
  }
  
  .big-number {
    font-size: 2.5rem;
    font-weight: 600;
    margin: var(--spacing-sm) 0;
    color: var(--color-primary);
  }
  
  .playlist-title {
    font-weight: 500;
    margin-top: var(--spacing-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Results section */
  .results-section {
    margin-top: var(--spacing-2xl);
  }
  
  .table-container {
    overflow-x: auto;
    margin-bottom: var(--spacing-xl);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-white);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
  }
  
  th, td {
    padding: var(--spacing-md);
    border: 1px solid var(--color-border);
    text-align: left;
  }
  
  th {
    background-color: var(--color-gray-100);
    font-weight: 600;
    position: sticky;
    top: 0;
  }
  
  .top-performer {
    background-color: var(--color-primary-light);
  }
  
  .error-row {
    background-color: var(--color-danger-bg);
  }
  
  .error-result {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--color-danger);
  }
  
  .error-icon {
    font-size: 1.25rem;
  }
  
  .playlist-row-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .playlist-thumb {
    width: 60px;
    height: 45px;
    object-fit: cover;
    border-radius: var(--radius-sm);
  }
  
  .playlist-id-small {
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--color-text-light);
  }
  
  /* Playlist cards */
  .playlist-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .playlist-card {
    padding: var(--spacing-lg);
    background-color: var(--color-white);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  }
  
  .playlist-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .top-performer-card {
    border-color: var(--color-primary);
    border-width: 2px;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
  
  .card-thumbnail {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--radius-sm);
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }
  
  .metric {
    margin-bottom: var(--spacing-xs);
  }
  
  .metric-label {
    font-size: 0.875rem;
    font-weight: 500;
    margin: 0;
    color: var(--color-text-muted);
  }
  
  .metric-value {
    font-size: 1.25rem;
    margin: var(--spacing-xs) 0 0 0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .playlist-cards {
      grid-template-columns: 1fr;
    }
    
    .performance-overview {
      grid-template-columns: 1fr;
    }
    
    .big-number {
      font-size: 2rem;
    }
  }
</style>