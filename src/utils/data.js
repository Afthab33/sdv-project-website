import * as d3 from 'd3';

// Utility function to load and parse CSV data
export const loadData = async () => {
  try {
    const data = await d3.csv('/src/assets/Combined_Health_and_Labels_Data.csv');
    
    // Convert numeric columns from strings to numbers
    data.forEach(d => {
      // Convert relevant columns to numeric values
      d['Total Sleep'] = d['Total Sleep'] ? +d['Total Sleep'] : null;
      d['Sleep Analysis [REM] (hr)'] = d['Sleep Analysis [REM] (hr)'] ? +d['Sleep Analysis [REM] (hr)'] : null;
      d['Sleep Analysis [Deep] (hr)'] = d['Sleep Analysis [Deep] (hr)'] ? +d['Sleep Analysis [Deep] (hr)'] : null;
      d['Sleep Analysis [Core] (hr)'] = d['Sleep Analysis [Core] (hr)'] ? +d['Sleep Analysis [Core] (hr)'] : null;
      d['Sleep Analysis [Awake] (hr)'] = d['Sleep Analysis [Awake] (hr)'] ? +d['Sleep Analysis [Awake] (hr)'] : null;
    });
    
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};