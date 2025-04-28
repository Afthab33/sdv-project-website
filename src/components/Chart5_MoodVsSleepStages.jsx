import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart5_MoodVsSleepStages = () => {
  const chartRef = useRef();
  // Generate a unique ID for this component instance
  const chartId = useId();

  useEffect(() => {
    // Keep track of whether the component is mounted
    let isMounted = true;

    const createChart = async () => {
      if (!chartRef.current || !isMounted) return;

      // Clear any existing SVG more thoroughly
      d3.select(chartRef.current).selectAll('svg').remove();

      // Load data
      const data = await loadData();
      
      // Check if component is still mounted after async operation
      if (!isMounted) return;
      
      // Filter out rows with missing values
      const filteredData = data.filter(
        d => (
          d['Sleep Analysis [REM] (hr)'] !== null && 
          d['Sleep Analysis [Deep] (hr)'] !== null && 
          d['Sleep Analysis [Core] (hr)'] !== null && 
          d['How was your mood after waking up?']
        )
      );

      if (filteredData.length === 0) {
        console.error('No valid data for this chart');
        return;
      }

      // Set dimensions
      const margin = { top: 50, right: 150, bottom: 80, left: 80 };
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      // Create SVG with unique ID
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('id', `mood-sleep-stages-chart-${chartId}`)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Group data by mood
      const moodGroups = d3.group(filteredData, d => d['How was your mood after waking up?']);
      
      // Define sleep stages
      const sleepStages = ['REM', 'Deep', 'Core'];
      
      // Create stacked bar data
      const moodData = Array.from(moodGroups, ([mood, values]) => {
        const avgSleepStages = {
          mood,
          'REM': d3.mean(values, d => d['Sleep Analysis [REM] (hr)']),
          'Deep': d3.mean(values, d => d['Sleep Analysis [Deep] (hr)']),
          'Core': d3.mean(values, d => d['Sleep Analysis [Core] (hr)']),
          count: values.length
        };
        return avgSleepStages;
      });

      // Define mood categories and their order
      const moodOrder = ['Negative', 'Neutral', 'Positive'];
      
      // Sort by mood order
      moodData.sort((a, b) => {
        return moodOrder.indexOf(a.mood) - moodOrder.indexOf(b.mood);
      });

      // Create scales
      const xScale = d3.scaleBand()
        .domain(moodData.map(d => d.mood))
        .range([0, width])
        .padding(0.3);

      // Create color scale for sleep stages
      const colorScale = d3.scaleOrdinal()
        .domain(sleepStages)
        .range(['#ff6b6b', '#48dbfb', '#1dd1a1']);

      // Stack the data
      const stack = d3.stack()
        .keys(sleepStages)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const stackedData = stack(moodData);

      // Find the maximum y value for the scale
      const yMax = d3.max(stackedData, layer => d3.max(layer, d => d[1]));

      // Create y scale
      const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.1])
        .range([height, 0])
        .nice();

      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('font-size', '12px');

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '12px');

      // Add X axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Mood After Waking Up')
        .style('font-size', '14px');

      // Add Y axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Average Hours')
        .style('font-size', '14px');

      // Add title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Mood vs Sleep Stages');

      // Add count labels above bars
      svg.selectAll('.count-label')
        .data(moodData)
        .enter()
        .append('text')
        .attr('class', 'count-label')
        .attr('x', d => xScale(d.mood) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.REM + d.Deep + d.Core) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(d => `n=${d.count}`);

      // Create stacked bars
      const barGroups = svg.selectAll('.bar-group')
        .data(stackedData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .style('fill', (d, i) => colorScale(sleepStages[i]));

      barGroups.selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.data.mood))
        .attr('y', d => yScale(d[1]))
        .attr('height', d => yScale(d[0]) - yScale(d[1]))
        .attr('width', xScale.bandwidth())
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('opacity', 0.8);

      // Add legend
      const legend = svg.append('g')
        .attr('transform', `translate(${width + 20}, 20)`);

      sleepStages.forEach((stage, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(0, ${i * 20})`);
        
        legendRow.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', colorScale(stage));
        
        legendRow.append('text')
          .attr('x', 20)
          .attr('y', 10)
          .attr('text-anchor', 'start')
          .style('font-size', '12px')
          .text(`${stage} Sleep`);
      });

      // Add value labels for each segment
      moodData.forEach(moodItem => {
        let y0 = 0;
        sleepStages.forEach(stage => {
          const value = moodItem[stage];
          const y1 = y0 + value;
          
          // Only add label if segment is large enough
          if (value > 0.2) {
            svg.append('text')
              .attr('x', xScale(moodItem.mood) + xScale.bandwidth() / 2)
              .attr('y', yScale(y0 + value / 2))
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .style('font-size', '11px')
              .style('fill', 'white')
              .style('font-weight', 'bold')
              .text(value.toFixed(1));
          }
          
          y0 = y1;
        });
      });
    };

    createChart();

    // Improved cleanup function
    return () => {
      isMounted = false;
      if (chartRef.current) {
        d3.select(chartRef.current).selectAll('svg').remove();
      }
    };
  }, [chartId]); // Add chartId to dependencies

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div className="chart-container overflow-x-auto" ref={chartRef}></div>
    </div>
  );
};

export default Chart5_MoodVsSleepStages;