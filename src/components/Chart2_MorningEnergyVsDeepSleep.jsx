import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart2_MorningEnergyVsDeepSleep = () => {
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
        d => (
          d['Sleep Analysis [Deep] (hr)'] !== null && 
          d['How was your energy level in the Morning?'] && 
          d['Total Sleep'] !== null
        )
      );

      if (filteredData.length === 0) return;

      // Get container dimensions for responsiveness
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = Math.min(containerWidth * 0.6, 400);

      // Set margins
      const margin = { top: 40, right: 30, bottom: 60, left: 70 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('id', `morning-energy-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Define energy level categories and their order
      const energyLevelOrder = ['Low', 'Moderate', 'High'];
      
      // Create color scale with pleasing colors
      const colorScale = d3.scaleOrdinal()
        .domain(energyLevelOrder)
        .range(['#f87171', '#fbbf24', '#34d399']);

      // Calculate size scale for bubbles based on total sleep
      const sizeScale = d3.scaleLinear()
        .domain([d3.min(filteredData, d => d['Total Sleep']), 
                 d3.max(filteredData, d => d['Total Sleep'])])
        .range([4, 12]);

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d['Sleep Analysis [Deep] (hr)']) * 1.1])
        .range([0, width]);

      const yScale = d3.scalePoint()
        .domain(energyLevelOrder)
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

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(yScale)
          .tickSize(0)
        )
        .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
        .call(g => g.selectAll('text')
          .attr('x', -10)
          .style('font-size', '11px')
          .style('fill', '#64748b')
          .style('text-anchor', 'end')
        );

      // Add X axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .text('Deep Sleep (Hours)')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add Y axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Morning Energy Level')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add jitter for better visualization
      const jitter = height * 0.03;

      // Add dots (bubbles) with transition
      svg.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d['Sleep Analysis [Deep] (hr)']))
        .attr('cy', d => yScale(d['How was your energy level in the Morning?']) + (Math.random() * jitter - jitter/2))
        .attr('r', 0) // Start with radius 0
        .style('fill', d => colorScale(d['How was your energy level in the Morning?']))
        .style('opacity', 0.7)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .transition()
        .duration(600)
        .delay((d, i) => i * 5)
        .attr('r', d => sizeScale(d['Total Sleep']));

      // Calculate optimal legend position
      const legendX = width - 120;
      const legendY = 10;

      // Add unified legend with background
      const legend = svg.append('g')
        .attr('transform', `translate(${legendX}, ${legendY})`);
        
      // Add background rectangle for legend
      legend.append('rect')
        .attr('width', 110)
        .attr('height', 120)
        .attr('rx', 4)
        .attr('fill', 'white')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))');

      // Add color legend title
      legend.append('text')
        .attr('x', 8)
        .attr('y', 15)
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#475569')
        .text('Energy Level');

      // Add color legend items
      energyLevelOrder.forEach((level, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 20 + 30})`);
        
        legendRow.append('circle')
          .attr('r', 5)
          .attr('fill', colorScale(level));
        
        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 4)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(level);
      });

      // Add size legend title
      legend.append('text')
        .attr('x', 8)
        .attr('y', 85)
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#475569')
        .text('Total Sleep');

      // Add size legend with minimal items
      const minSleep = Math.round(d3.min(filteredData, d => d['Total Sleep']));
      const maxSleep = Math.round(d3.max(filteredData, d => d['Total Sleep']));

      [minSleep, maxSleep].forEach((sleep, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 20 + 100})`);
        
        legendRow.append('circle')
          .attr('r', sizeScale(sleep))
          .style('fill', '#94a3b8')
          .style('opacity', 0.7);
        
        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 4)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(`${sleep}h`);
      });
    };

    createChart();

    // Handle window resize with debounce
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

export default Chart2_MorningEnergyVsDeepSleep;