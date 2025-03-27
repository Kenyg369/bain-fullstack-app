<script lang="ts">
  import type { Query } from '../distances/distances.service';
  
  export let queries: Query[];
</script>

<div class="queries-section">
  <div class="crawl">
    <div class="queries-header">
      <h2>Historical Queries</h2>
      <p>History of the user's queries.</p>
    </div>

    {#if queries.length === 0}
      <div class="no-results">
        <p>No historical queries found.</p>
      </div>
    {:else}
      <div class="queries-table">
        <table>
          <thead>
            <tr>
              <th>Source Address</th>
              <th>Destination Address</th>
              <th>Distance in Miles</th>
              <th>Distance in Kilometers</th>
            </tr>
          </thead>
        </table>
        <div class="table-body-container">
          <table>
            <tbody>
              {#each queries as query}
                <tr>
                  <td>{query.sourceAddress}</td>
                  <td>{query.destinationAddress}</td>
                  <td>{parseFloat(query.distanceInMiles).toFixed(2)}</td>
                  <td>{(parseFloat(query.distanceInMiles) * 1.60934).toFixed(2)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>  
  h2 {
    font-family: Inter, sans-serif; 
    font-weight: 400;               
    font-size: 20px;                
    line-height: 24px;              
    letter-spacing: 0px;            
    color: #1B1A1A;
  }
  
  p {
    font-family: Inter, sans-serif; 
    font-weight: 400;               
    font-size: 14px;                
    line-height: 18px;              
    letter-spacing: 0.16px;            
    color: #4B4949;
  }
  
  .queries-section {
    height: 594px;
    gap: 32px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .crawl {
    padding: 16px;
    background-color: #FFFFFF;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  
  .queries-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 82px;
    padding: 16px 16px 24px 16px;
    flex-shrink: 0;
  }

  .queries-table {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
  }
  
  .table-body-container {
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(594px -32px - 82px);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  
  th, td {
    width: 304px;
    max-height: 40px;
    padding: 11px 16px;
    text-align: left;
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: Inter, sans-serif; 
    font-weight: 400;               
    font-size: 14px;                
    line-height: 18px;              
    letter-spacing: 0.16px;            
    color: #4B4949;
  }
  
  th {
    background-color: #DCDAD6;
    font-weight: 600;
    color: #1B1A1A;
    height: 40px;
    border-bottom: none;
  }
  
  tr {
    height: 40px;
  }

  tbody {
    background-color: #F8F8F6;
  }
  tbody tr {
    border-bottom: 1px solid #DCDAD6;
    box-sizing: border-box;
  }
  tbody tr:hover {
    background-color: #f5f5f5;
  }
  
  .no-results {
    padding: 20px;
    text-align: center;
    color: #666;
    font-style: italic;
    border: 1px solid #ddd;
    margin-top: 15px;
  }
</style> 