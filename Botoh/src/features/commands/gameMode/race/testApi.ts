import { sendStandingsToApi } from "./standingsApi";

/**
 * Test function to verify API integration
 * This can be called manually to test the API connection
 */
export async function testStandingsApi(): Promise<void> {
  console.log("Testing standings API integration...");
  
  try {
    const success = await sendStandingsToApi();
    
    if (success) {
      console.log("✅ API test successful - standings sent to haxball-league.vercel.app");
    } else {
      console.log("❌ API test failed - could not send standings");
    }
  } catch (error) {
    console.error("❌ API test error:", error);
  }
}

// Uncomment the following line to test the API immediately when this file is imported
// testStandingsApi();
