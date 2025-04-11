<script>
  // App state with proper Svelte 5 runes
  // const PLAYLIST_IDS = [
  //   'PLLnpHn493BHEEFzqQUKPqkb5kCjODDnCB',
  //   'PLLnpHn493BHGTMfQW80muoajR35mHZApM',
  //   'PLLnpHn493BHHHfwltu5BXXq7l9TFhw2kL',
  //   'PLLnpHn493BHFl_WfpbSJwZIEFyngkj_J_',
  //   'PLLnpHn493BHGBiEhXz-S7ni8swvP7ROWD',
  //   'PLLnpHn493BHFgYr9_pv60nDnsNFv7NIBR',
  //   'PLLnpHn493BHEzYBmj0NXkXOmDaNrajO31',
  //   'PLLnpHn493BHHtQvz4Y2SumwGzgjikMjNy',
  //   'PLLnpHn493BHFBCNpSFkW0K4bseDlP67c5',
  //   'PLLnpHn493BHH5MwR-ojd9eaeygK078AaQ',
  //   'PLLnpHn493BHHSnt6efgX0RR2bFhpVz84A',
	// 	'PLLnpHn493BHFaCVB41lKzhkZLpBVFmwi3',
	// 	'PLLnpHn493BHGx_nYeuNekwA-9-24suFx1'
  // ];
  
  const PLAYLIST_IDS = [
		'PLArHFG1pACBoKbgjcveEHDNmbBKYv19l3',
		'PLRkn2QTxcJf64P4uRCQcR_Z5Vj2Xb0x3X',
		'PLRsapyZqDs1o2_cfJNIxQzb-X1-mpYbdA',
		'PL0F93dv3eRtkH4Unslskx-JPfDEqbwjbD',
  ];
  
  let playlistIds = $state(PLAYLIST_IDS);
  let loading = $state(false);
  let results = $state([]);
  let error = $state('');
  let sortConfig = $state({
    column: 'totalViews',
    direction: 'desc'
  });
  
  // Initialize with input array
  function setPlaylistIds(idsArray) {
    if (Array.isArray(idsArray) && idsArray.length > 0) {
      playlistIds = [...idsArray];
    }
  }
  
  // Sorting function
  function sortResults(column) {
    if (sortConfig.column === column) {
      // If clicking the same column, toggle direction
      sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to descending
      sortConfig.column = column;
      sortConfig.direction = 'desc';
    }

    // Sort the results array
    results = [...results].sort((a, b) => {
      if (a.isError && !b.isError) return 1;
      if (!a.isError && b.isError) return -1;
      if (a.isError && b.isError) return 0;

      let aValue = a[column];
      let bValue = b[column];

      // Handle special cases
      if (column === 'engagementRate') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (column.includes('Duration')) {
        // Convert duration strings to seconds for comparison
        aValue = durationToSeconds(aValue);
        bValue = durationToSeconds(bValue);
      }

      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }

  // Helper function to convert duration string to seconds
  function durationToSeconds(duration) {
    const parts = duration.split(' ');
    let totalSeconds = 0;
    
    parts.forEach(part => {
      if (part.endsWith('h')) totalSeconds += parseInt(part) * 3600;
      if (part.endsWith('m')) totalSeconds += parseInt(part) * 60;
      if (part.endsWith('s')) totalSeconds += parseInt(part);
    });
    
    return totalSeconds;
  }

  // Get sort icon for column header
  function getSortIcon(column) {
    if (sortConfig.column !== column) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
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
      
      // Sort results by total views (descending), placing errors at the end
      sortResults('totalViews');
      
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
    return new Intl.NumberFormat().format(Math.round(num));
  }
  
  // Check if we have valid playlists
  let hasPlaylists = $derived(playlistIds.length > 0);
  let canAnalyze = $derived(hasPlaylists && !loading);

  // Helper function to update big number data-value
  function updateBigNumberValue(element, value) {
    element.setAttribute('data-value', value);
  }
</script>

<div class="container">
  <div class="cyber-overlay"></div>
  <div class="matrix-rain"></div>
  
  <div class="content">
    <h1 class="neon">YouTube Playlist Analytics</h1>
    
    {#if hasPlaylists}
      <div class="playlists-section glass-effect">
        <h2>Analyzing {playlistIds.length} Playlists</h2>
        <div class="playlist-ids">
          {#each playlistIds as id}
            <div class="playlist-badge">{id}</div>
          {/each}
        </div>
        
        <button
          on:click={analyzeAllPlaylists}
          disabled={!canAnalyze}
          class="btn-analyze"
        >
          {loading ? 'Analyzing...' : 'Analyze All Playlists'}
        </button>
      </div>
    {:else}
      <div class="waiting-message glass-effect">
        <p>Waiting for playlist IDs to be provided...</p>
      </div>
    {/if}
    
    {#if error}
      <div class="error-message glass-effect">
        <div class="error-content cyber-border">
          <span class="error-icon pulse">⚠️</span>
          {error}
        </div>
      </div>
    {/if}
    
    {#if results.length > 0}
      <div class="results-section">
        <h2 class="cyber-text neon">Results Overview</h2>
        
        <!-- Performance Overview -->
        <div class="performance-overview">
          <div class="overview-card glass-effect cyber-border">
            <h3 class="cyber-text">Top Performer</h3>
            <p class="big-number glow" data-value={results[0].totalViews.toLocaleString()}>{results[0].totalViews.toLocaleString()}</p>
            <p class="cyber-text">Total Views</p>
            <p class="playlist-title neon">{results[0].playlistTitle}</p>
          </div>
          
          <div class="overview-card glass-effect cyber-border">
            <h3 class="cyber-text">Total Views</h3>
            <p class="big-number glow" data-value={results
              .filter(r => !r.isError)
              .reduce((sum, r) => sum + r.totalViews, 0)
              .toLocaleString()}>
              {results
                .filter(r => !r.isError)
                .reduce((sum, r) => sum + r.totalViews, 0)
                .toLocaleString()}
            </p>
            <p class="cyber-text">Across all playlists</p>
          </div>
          
          <div class="overview-card glass-effect cyber-border">
            <h3 class="cyber-text">Total Videos</h3>
            <p class="big-number glow" data-value={results
              .filter(r => !r.isError)
              .reduce((sum, r) => sum + r.totalVideos, 0)
              .toLocaleString()}>
              {results
                .filter(r => !r.isError)
                .reduce((sum, r) => sum + r.totalVideos, 0)
                .toLocaleString()}
            </p>
            <p class="cyber-text">Across all playlists</p>
          </div>
        </div>
        
        <div class="table-container glass-effect">
          <table>
            <thead>
              <tr>
                <th class="cyber-text">Playlist</th>
                <th class="sortable cyber-text" on:click={() => sortResults('totalVideos')}>
                  Videos {getSortIcon('totalVideos')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('totalViews')}>
                  Total Views {getSortIcon('totalViews')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('avgViews')}>
                  Avg Views {getSortIcon('avgViews')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('medianViews')}>
                  Median Views {getSortIcon('medianViews')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('meanViewsWithSD')}>
                  Mean (SD Cutoff) {getSortIcon('meanViewsWithSD')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('topVideoViews')}>
                  Top Video Views {getSortIcon('topVideoViews')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('top3AvgViews')}>
                  Top 3 Avg Views {getSortIcon('top3AvgViews')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('engagementRate')}>
                  Engagement {getSortIcon('engagementRate')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('totalDuration')}>
                  Total Duration {getSortIcon('totalDuration')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('avgDuration')}>
                  Avg Duration {getSortIcon('avgDuration')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('medianDuration')}>
                  Median Duration {getSortIcon('medianDuration')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('totalLikes')}>
                  Total Likes {getSortIcon('totalLikes')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('avgLikes')}>
                  Avg Likes {getSortIcon('avgLikes')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('totalComments')}>
                  Total Comments {getSortIcon('totalComments')}
                </th>
                <th class="sortable cyber-text" on:click={() => sortResults('avgComments')}>
                  Avg Comments {getSortIcon('avgComments')}
                </th>
              </tr>
            </thead>
            <tbody>
              {#each results as result, index}
                {#if result.isError}
                  <tr class="error-row">
                    <td colspan="16">
                      <div class="error-result cyber-border">
                        <span class="error-icon pulse">⚠️</span>
                        <span>Error analyzing playlist {result.playlistId}: {result.error}</span>
                      </div>
                    </td>
                  </tr>
                {:else}
                  <tr class={index === 0 ? "top-performer feature-card" : "feature-card"}>
                    <td>
                      <div class="playlist-row-info">
                        {#if result.thumbnailUrl}
                          <img src={result.thumbnailUrl} alt="Thumbnail" class="playlist-thumb morph" />
                        {/if}
                        <div>
                          <div class="cyber-text">{result.playlistTitle}</div>
                          <div class="playlist-id-small neon">{result.playlistId}</div>
                        </div>
                      </div>
                    </td>
                    <td>{result.totalVideos}</td>
                    <td>{formatNumber(result.totalViews)}</td>
                    <td>{formatNumber(result.avgViews)}</td>
                    <td>{formatNumber(result.medianViews)}</td>
                    <td>{formatNumber(result.meanViewsWithSD)}</td>
                    <td>{formatNumber(result.topVideoViews)}</td>
                    <td>{formatNumber(result.top3AvgViews)}</td>
                    <td>{result.engagementRate}</td>
                    <td>{result.totalDuration}</td>
                    <td>{result.avgDuration}</td>
                    <td>{result.medianDuration}</td>
                    <td>{formatNumber(result.totalLikes)}</td>
                    <td>{formatNumber(result.avgLikes)}</td>
                    <td>{formatNumber(result.totalComments)}</td>
                    <td>{formatNumber(result.avgComments)}</td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </table>
        </div>
        
        <div class="playlist-cards">
          {#each results.filter(r => !r.isError) as result, index}
            <div class={`playlist-card glass-effect ${index === 0 ? "top-performer-card cyber-border" : "cyber-border"} feature-card`}>
              <div class="card-header">
                {#if result.thumbnailUrl}
                  <img src={result.thumbnailUrl} alt="Thumbnail" class="card-thumbnail morph" />
                {/if}
                <h3 class="cyber-text neon">{result.playlistTitle}</h3>
              </div>
              <p class="playlist-id-small cyber-text">{result.playlistId}</p>
              
              <div class="metrics-grid">
                <div class="metric cyber-border pulse">
                  <p class="metric-label cyber-text">Total Videos:</p>
                  <p class="metric-value glow">{result.totalVideos}</p>
                </div>
                <div class="metric cyber-border pulse">
                  <p class="metric-label cyber-text">Total Views:</p>
                  <p class="metric-value glow">{formatNumber(result.totalViews)}</p>
                </div>
                <div class="metric cyber-border pulse">
                  <p class="metric-label cyber-text">Avg Views:</p>
                  <p class="metric-value glow">{formatNumber(result.avgViews)}</p>
                </div>
                <div class="metric cyber-border pulse">
                  <p class="metric-label cyber-text">Engagement Rate:</p>
                  <p class="metric-value glow">{result.engagementRate}</p>
                </div>
                <div class="metric cyber-border pulse">
                  <p class="metric-label cyber-text">Total Duration:</p>
                  <p class="metric-value glow">{result.totalDuration}</p>
                </div>
                <div class="metric cyber-border pulse">
                  <p class="metric-label cyber-text">Avg Duration:</p>
                  <p class="metric-value glow">{result.avgDuration}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Base styles */
  :root {
    --primary: #ff00ff;
    --secondary: #00ffff;
    --accent: #ffff00;
    --bg: #000000;
    --glass-bg: rgba(0, 0, 0, 0.8);
  }

  /* Optimized animations */
  @keyframes cyber-scan {
    from { transform: translateY(-100%); }
    to { transform: translateY(100%); }
  }

  @keyframes glow-pulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  /* Container and overlay */
  .container {
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    overflow-x: hidden;
    perspective: 1000px;
  }

  .cyber-overlay {
    position: fixed;
    inset: 0;
    background: 
      linear-gradient(45deg, transparent 48%, rgba(255, 0, 255, 0.1) 50%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, rgba(0, 255, 255, 0.1) 50%, transparent 52%);
    background-size: 4px 4px;
    pointer-events: none;
    z-index: 1;
    opacity: 0.3;
  }

  .content {
    position: relative;
    z-index: 2;
    padding: 2rem;
  }

  /* Matrix rain effect (optimized) */
  .matrix-rain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  /* Title styles */
  h1 {
    font-family: "Press Start 2P", system-ui;
    font-size: 3rem;
    color: var(--primary);
    text-align: center;
    margin-bottom: 2rem;
    text-shadow: 
      0 0 10px var(--primary),
      0 0 20px var(--secondary);
    animation: glow-pulse 2s ease-in-out infinite;
  }

  /* Card and section styles */
  .glass-effect {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .playlist-badge {
    background: linear-gradient(45deg, var(--primary), var(--secondary));
    padding: 0.5rem 1rem;
    border-radius: 4px;
    color: white;
    font-family: monospace;
    margin: 0.5rem;
    display: inline-block;
    animation: float 3s ease-in-out infinite;
  }

  /* Button styles */
  .btn-analyze {
    background: linear-gradient(45deg, var(--primary), var(--secondary));
    border: none;
    padding: 1rem 2rem;
    color: white;
    font-family: "Press Start 2P", system-ui;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 4px;
    margin-top: 1rem;
  }

  .btn-analyze:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 0 10px var(--primary),
      0 0 20px var(--secondary);
  }

  .btn-analyze:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Table styles */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 2rem;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  th {
    background: var(--glass-bg);
    color: var(--secondary);
    font-family: "Press Start 2P", system-ui;
    font-size: 0.8rem;
  }

  tr:hover td {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(var(--primary), var(--secondary));
    border-radius: 5px;
  }

  /* Utility classes */
  .neon {
    text-shadow: 
      0 0 10px currentColor,
      0 0 20px currentColor;
  }

  /* Error message */
  .error-message {
    background: rgba(255, 0, 0, 0.2);
    border: 1px solid rgba(255, 0, 0, 0.3);
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
    color: #ff0000;
    animation: glow-pulse 2s ease-in-out infinite;
  }

  /* Performance metrics */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .metric {
    background: var(--glass-bg);
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease;
  }

  .metric:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 0 10px var(--primary),
      0 0 20px var(--secondary);
  }

  .metric-value {
    font-size: 1.5rem;
    color: var(--secondary);
    margin-top: 0.5rem;
  }
</style>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</svelte:head>