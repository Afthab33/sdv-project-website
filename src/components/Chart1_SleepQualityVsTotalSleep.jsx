import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart1_SleepQualityVsTotalSleep = () => {
  const chartRef = useRef();
  const chartId = useId();

  useEffect(() => {
    let isMounted = true;

    const createChart = async () => {
      if (!chartRef.current || !isMounted) return;

      // Clear any existing SVG
      d3.select(chartRef.current).selectAll('svg').remove();

      // Load data
      const data = await loadData();
      
      if (!isMounted) return;
      
      // Filter out rows with missing values
      const filteredData = data.filter(
        d => d['Total Sleep'] && d['How well-rested do you feel upon waking up?']
      );

      if (filteredData.length === 0) return;

      // Get container dimensions for responsiveness
      const containerWidth = chartRef.current.clientWidth;
      // Ensure minimum height to prevent crowding
      const containerHeight = Math.max(Math.min(containerWidth * 0.6, 400), 320); 

      // Adjust margins to prevent text overlap
      const margin = { top: 40, right: 35, bottom: 65, left: 80 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('id', `sleep-quality-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Define sleep quality categories and their order
      const sleepQualityOrder = ['Tired', 'Moderately Rested', 'Well Rested'];
      
      // Create color scale with pleasing colors
      const colorScale = d3.scaleOrdinal()
        .domain(sleepQualityOrder)
        .range(['#f87171', '#fbbf24', '#34d399']);

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([d3.min(filteredData, d => d['Total Sleep']) * 0.9, 
                 d3.max(filteredData, d => d['Total Sleep']) * 1.05])
        .range([0, width]);

      const yScale = d3.scalePoint()
        .domain(sleepQualityOrder)
        .range([height, 0])
        .padding(0.5);

      // Add X axis with styled gridlines
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d => `${d}h`)
          .tickSize(0)
        )
        .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
        .call(g => g.selectAll('text')
          .attr('dy', '0.5em')
          .style('font-size', '11px')
          .style('fill', '#64748b')
        );
        
      // Add X-axis gridlines
      svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickSize(-height)
          .tickFormat('')
        )
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line')
          .attr('stroke', '#e2e8f0')
          .attr('stroke-dasharray', '3,3')
        );

      // Add Y axis with adjusted text positioning
      svg.append('g')
        .call(d3.axisLeft(yScale)
          .tickSize(0)
        )
        .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
        .call(g => g.selectAll('text')
          .attr('x', -10) // Move labels away from axis
          .style('font-size', '11px')
          .style('fill', '#64748b')
          .style('text-anchor', 'end') // Ensure alignment for long labels
        );
        
      // Add X axis label with improved position
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .text('Total Sleep (Hours)')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add Y axis label with adjusted position
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 30)
        .attr('x', -height / 2)
        .text('Self-Reported Sleep Quality')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Create jitter for y-values to avoid perfect alignment
      // Reduce jitter amount to prevent overlapping with axis labels
      const jitter = height * 0.035;
      
      // Add dots with transition for each data point
      svg.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d['Total Sleep']))
        .attr('cy', d => yScale(d['How well-rested do you feel upon waking up?']) + (Math.random() * jitter - jitter/2))
        .attr('r', 0) // Start with radius 0
        .style('fill', d => colorScale(d['How well-rested do you feel upon waking up?']))
        .style('opacity', 0.7)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .transition() // Apply transition
        .duration(500)
        .delay((d, i) => i * 5)
        .attr('r', 5.5); // Slightly smaller dots to prevent crowding

      // Calculate optimal legend position based on chart size
      // Move legend to bottom right to avoid overlapping with data points
      const legendX = width - 135;
      const legendY = height - 80;
      
      // Add compact legend with better positioning
      const legend = svg.append('g')
        .attr('transform', `translate(${legendX}, ${legendY})`);
        
      // Add background rectangle for legend with shadow for clarity
      legend.append('rect')
        .attr('width', 130)
        .attr('height', 80)
        .attr('rx', 4)
        .attr('fill', 'white')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))');

      sleepQualityOrder.forEach((quality, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 22 + 15})`);
        
        legendRow.append('circle')
          .attr('r', 5)
          .attr('fill', colorScale(quality));
        
        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 4)
          .attr('text-anchor', 'start')
          .style('font-size', '11px')
          .style('fill', '#475569')
          .text(quality);
      });
    };

    createChart();

    // Handle window resize with debounce to prevent excessive redraws
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isMounted && chartRef.current) {
          createChart();
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        d3.select(chartRef.current).selectAll('svg').remove();
      }
    };
  }, [chartId]);

  // Return just the chart container without observations
  // This ensures the chart uses the full height of its container card
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        className="w-full h-full chart-container rounded-lg" 
        ref={chartRef}
        style={{ minHeight: "300px" }}
      ></div>
    </div>
  );
};

// Create a separate component for the observations
const SleepQualityObservations = () => {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Key Observations: Sleep Quality vs Total Sleep</h3>
      <p className="text-xs text-slate-600 leading-relaxed">
        According to the analysis, Participant X generally reported feeling "Well Rested" on days when total sleep duration ranged between 6 to 9 hours.
        When sleep dropped below 6.5 hours, Participant X often reported feeling "Tired" or "Moderately Rested."
        However, there were several instances where even after achieving 8–9 hours of sleep, Participant X did not feel fully well-rested, suggesting that sleep quality — not just total sleep quantity — plays a critical role in how refreshed they feel upon waking.
      </p>
    </div>
  );
};

export { SleepQualityObservations };
export default Chart1_SleepQualityVsTotalSleep;