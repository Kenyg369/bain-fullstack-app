<script lang="ts">
  import DistanceCalculator from '../components/DistanceCalculator.svelte';
  import HistoricalQueries from '../components/HistoricalQueries.svelte';
  import { onMount } from 'svelte';
  import { DistancesService } from '../distances/distances.service';
  import type { Query } from '../distances/distances.service';
  
  // State flag
  let showCalculator = true;
  
  // Error notification state
  let showErrorNotification = false;
  let errorMessage = '';

  
  let queries: Query[] = [];
  const service = new DistancesService();

  // Toggle view between calculator and historical queries
  const toggleView = async () => {
    if (showCalculator) {
      queries = await service.fetchQueries();
    }
    showCalculator = !showCalculator;
  };
  
  // Close error notification
  const closeErrorNotification = () => {
    showErrorNotification = false;
  };
  
  // Initial render
  onMount(() => {
    document.title = 'Distance Calculator';
  });
</script>

<main>
  <div class="calculator-container">
    <div class="header-section">
      <div class="header-wrapper">
        <div class="headline">
          <h1>Distance Calculator</h1>
          <p>Prototype web application for calculating the distance between addresses.</p>
        </div>

        {#if showCalculator}
          <button class="view-history-btn" on:click={toggleView}>
            <span>View Historical Queries</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
        {:else}
          <button class="back-button" on:click={toggleView}>
            <span>Back to Calculator</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"></rect>
              <line x1="8" y1="6" x2="16" y2="6"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="8" y1="18" x2="16" y2="18"></line>
              <line x1="12" y1="6" x2="12" y2="18"></line>
            </svg>
          </button>
        {/if}  
      </div>
    </div>

    {#if showCalculator}
      <DistanceCalculator onError={(message) => {
        errorMessage = message;
        showErrorNotification = true;
      }} />
    {:else}
      <HistoricalQueries {queries} />
    {/if}
  </div>

  {#if showErrorNotification}
    <div class="error-notification">
      <div class="error-icon">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7.5" fill="#D10001" stroke="#D10001"/>
          <path d="M5 5L11 11M5 11L11 5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="error-content">
        <div class="error-message">
          <div class="error-title">Calculation failed</div>
          <div class="error-description">{errorMessage}</div>
        </div>
      </div>
      <button class="close-button" on:click={closeErrorNotification} aria-label="Close notification">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12M4 4L12 12" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  {/if}
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    max-width: 1312px;
    margin: 0 auto;
    padding: 0;
    background-color: #F8F8F6;
    min-height: 800px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    position: relative;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #F8F8F6;
  }

  .calculator-container {
    border-radius: 0;
    margin: 0 auto;
    padding: 0px 32px;
    /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
    width: 1312px;
    height: 344px;
  }

  .header-section {
    height: 132px;
    padding: 16px 0;
  }

  .header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px;
    gap: 16px;
  }

  h1 {
    font-family: Inter, sans-serif; 
    font-weight: 300;               
    font-size: 32px;                
    line-height: 40px;              
    letter-spacing: 0px;            
    color: #222222;               
  }

  p {
    font-family: Inter, sans-serif; 
    font-weight: 400;               
    font-size: 14px;                
    line-height: 20px;              
    letter-spacing: 0.16px;            
    color: #4B4949;
  }

  .headline {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 963px;
    height: 68px;
    gap: 8px
  }

  .view-history-btn {
    background-color: #313030;
    width: 237px;
    height: 48px;
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 15px 16x;
    /* border: 1px solid #313030; */
    font-family: Inter, sans-serif; 
    font-weight: 400;               
    font-size: 14px;
    line-height: 18px;              
    letter-spacing: 0.16px;
    color: #FFFFFF;
  }

  .view-history-btn:hover {
    background-color: #FFFFFF;
    color: #313030;
  }

  .back-button {
    background-color: #FFFFFF;
    color: white;
    width: 204px;
    height: 48px;
    display: flex;
    align-items: center;
    padding: 15px 16px;
    gap: 32px;
    border: 1px solid #313030;
    font-weight: 400;               
    font-size: 14px;
    line-height: 18px;              
    letter-spacing: 0.16px;
    color: #313030;
  }
  
  .back-button:hover {
    background-color: #313030;
    color: #FFFFFF;

  }

  .error-notification {
    position: absolute;
    bottom: 20px;
    right: 32px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 288px;
    height: 85px;
    border-width: 1px;
    background: var(--Notification-notification-background-error, #FFF9ED);
    border: 1px solid #D100014D;
    border-left: 3px solid var(--Support-support-error, #F31710);
    box-shadow: 0px 2px 6px 0px #0000004D;
  }
  
  
  .error-icon {
    height: 85px;
    padding-top: 15px;
    padding-left: 12px;
    padding-right: 12px; 
  }
  .error-content {
    display: flex;
    padding-top: 15px;
    padding-bottom: 16px;
    width: 176px;
    height: 85px;
    gap: 24px;
  }
  
  .error-title {
  font-family: Inter;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.16px;
  color: var(--Text-text-primary, #1B1A1A);
  }
  .error-description {
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: 0.16px;
    color: var(--Text-text-primary, #1B1A1A);
  }
  
  .close-button {
    width: 48px;
    height: 48px;
    background: transparent;
    padding: 3px;
  }
</style>
