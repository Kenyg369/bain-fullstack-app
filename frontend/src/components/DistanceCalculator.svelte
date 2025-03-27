<script lang="ts">
  import { DistancesService } from '../distances/distances.service';
  import { logger } from '../libs/logger';
  
  export let onError: (message: string) => void;

  // State variables
  let sourceAddress = '';
  let destinationAddress = '';
  let distanceInMiles = '';
  let distanceInKm = '';
  let unit = 'both'; 
  let isLoading = false;
  
  const service = new DistancesService();
  
  // Validate address input
  function validateAddress(address: string): { valid: boolean; message: string } {
    logger.debug('Validating address', { address: address?.substring(0, 15) + '...' });
    
    if (!address.trim()) {
      logger.warn('Empty address detected');
      return { valid: false, message: 'Address cannot be empty' };
    }
    
    if (address.trim().length < 3) {
      logger.warn('Address too short', { length: address.trim().length });
      return { valid: false, message: 'Address is too short' };
    }
    
    if (address.trim().length > 200) {
      logger.warn('Address too long', { length: address.trim().length });
      return { valid: false, message: 'Address is too long (max 200 characters)' };
    }
    
    // Check for potentially dangerous characters
    const dangerousPattern = /[<>{}]/;
    if (dangerousPattern.test(address)) {
      logger.warn('Address contains dangerous characters', { address: address?.substring(0, 15) + '...' });
      return { valid: false, message: 'Address contains invalid characters' };
    }
    
    logger.debug('Address validation passed');
    return { valid: true, message: '' };
  }
  
  const calculateDistance = async () => {
    logger.info('Distance calculation initiated');
    
    // Client-side validation
    const sourceValidation = validateAddress(sourceAddress);
    if (!sourceValidation.valid) {
      logger.warn('Source address validation failed', { message: sourceValidation.message });
      onError(sourceValidation.message);
      return;
    }
    
    const destValidation = validateAddress(destinationAddress);
    if (!destValidation.valid) {
      logger.warn('Destination address validation failed', { message: destValidation.message });
      onError(destValidation.message);
      return;
    }

    logger.debug('Validation passed, proceeding with calculation');
    isLoading = true; // Set loading state

    try {
      logger.debug('Calling distance service');
      const data = await service.calculateDistance(sourceAddress, destinationAddress);
      
      distanceInMiles = parseFloat(data.distanceInMiles).toFixed(2);
      // Convert miles to kilometers (1 mile = 1.60934 km)
      distanceInKm = (parseFloat(distanceInMiles) * 1.60934).toFixed(2);
      
      logger.info('Distance calculation completed', { 
        distanceInMiles, 
        distanceInKm,
        unit 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong and the calculation failed.';
      logger.error('Error during calculation', { message: errorMessage });
      onError(errorMessage);
      console.error(err);
    } finally {
      logger.debug('Calculation process finished');
      isLoading = false;
    }
  };
</script>

<div class="main-section">
  <div class="form-row">
    <div class="text-input">
      <label class="title-label" for="sourceAddress">Source Address</label>
      <input
        type="text"
        id="sourceAddress"
        bind:value={sourceAddress}
        placeholder="Input address"
      />
    </div>
    
    <div class="text-input">
      <label class="title-label" for="destinationAddress">Destination Address</label>
      <input
        type="text"
        id="destinationAddress"
        bind:value={destinationAddress}
        placeholder="Input address"
      />
    </div>
    
    <div class="radio-btn-group">
      <div class="radio-options">
        <div class="title-label">Unit</div>
        <label class="radio-label">
          <input type="radio" bind:group={unit} value="miles" />
          <span>Miles</span>
        </label>
        <label class="radio-label">
          <input type="radio" bind:group={unit} value="kilometers" />
          <span>Kilometers</span>
        </label>
        <label class="radio-label">
          <input type="radio" bind:group={unit} value="both" checked />
          <span>Both</span>
        </label>
      </div>
    </div>
    
    <div class="distance-column">
      <div class="title-label" >Distance</div>
      <div class="distance-values">
        {#if distanceInMiles && (unit === 'miles' || unit === 'both')}
          <div class="distance-value">{distanceInMiles} mi </div>
        {/if}
        {#if distanceInKm && (unit === 'kilometers' || unit === 'both')}
          <div class="distance-value">{distanceInKm} km </div>
        {/if}
      </div>
    </div>
  </div>

  <button 
    class="calculate-btn" 
    on:click={calculateDistance}
    disabled={isLoading}
  >
    Calculate Distance
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"></rect>
      <line x1="8" y1="6" x2="16" y2="6"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
      <line x1="8" y1="18" x2="16" y2="18"></line>
      <line x1="12" y1="6" x2="12" y2="18"></line>
    </svg>
  </button>
</div>

<style>
  .main-section {
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    height: 212px;
    padding: 16px;
    gap: 32px;
  }

  .form-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    /* display: grid;
    grid-template-columns: 1fr 1fr 0.8fr 0.8fr; */
    height: 100px;
    gap: 32px;
    align-items: start;
  }

  .text-input {
    display: flex;
    flex-direction: column;
    width: 413.5px;
    height: 64px;
    gap: 4px;
  }

  .title-label{
    height: 20px;
    padding-bottom: 4px;
    font-family: Inter, sans-serif; 
    font-weight: 400;               
    font-size: 12px;
    line-height: 16px;              
    letter-spacing: 0.32px;
  }

  label {
    display: block;
    font-size: 14px;
    color: #555;
  }

  input[type="text"] {
    width: 100%;
    height: 40px;
    padding: 11px 16px;
    gap: 16px;
    border-bottom: 1px solid #7D7D7C;
    font-family: Inter, sans-serif; 
    font-weight: 400;               
    font-size: 14px;
    line-height: 18px;              
    letter-spacing: 0.16px;
    background-color: #F8F8F6;
  }

  input[type="text"]:focus {
    border-color: #888;
  }

  .radio-btn-group{
    width: 101px;
    height: 100px;
 }

  .radio-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .radio-label {
    display: flex;
    align-items: center;
    height: 20px;
    gap: 8px;
    cursor: pointer;
  }

  .distance-column {
    width: 192px;
    height: 64px;
  }


  .distance-values {
    display: flex;
    flex-direction: row;
    height: 40px;
    padding: 11px 0px;
    gap: 16px;

  }

  .distance-value {
    width: 61px;
    height: 18px;
    font-family: Inter, sans-serif; 
    font-weight: 600;               
    font-size: 14px;
    line-height: 18px;              
    letter-spacing: 0.16px;
    color:#1B1A1A; 
  }

  .calculate-btn {
    width: 201px;
    height: 42px;
    background-color: #D10001;
    color: #FFFFFF;
    padding: 12px 13px;
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;              
    letter-spacing: 0.16px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
    margin-top: auto;
    align-self: flex-start;
    border-radius: 1px;
  }

  .calculate-btn:hover {
    background-color: #cc0000;
  }

  .calculate-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style> 