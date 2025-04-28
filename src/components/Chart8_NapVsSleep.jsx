import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart8_NapVsSleep = () => {
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
          d['Total Sleep'] !== null && 
          d['Did you feel the need to take a nap during the day?']
        )
      );

      if (filteredData.length === 0) return;

      // Get container dimensions for responsiveness
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = Math.min(containerWidth * 0.6, 400);

      // Set margins with proper spacing
      const margin = { top: 40, right: 30, bottom: 60, left: 70 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create SVG with viewBox for responsiveness
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('id', `nap-sleep-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Group data by nap need
      const napGroups = d3.group(
        filteredData, 
        d => d['Did you feel the need to take a nap during the day?']
      );
      
      // Create a dataset for the bar chart
      const barData = Array.from(napGroups, ([key, values]) => {
        return {
          napNeed: key,
          avgSleep: d3.mean(values, d => d['Total Sleep']),
          stdDev: d3.deviation(values, d => d['Total Sleep']) || 0,
          count: values.length,
          // Group data by sleep quality
          qualityCounts: d3.rollup(
            values,
            v => v.length,
            d => d['How well-rested do you feel upon waking up?']
          )
        };
      });

      // Sort by nap need (Yes/No)
      barData.sort((a, b) => {
        return a.napNeed === 'Yes' ? -1 : 1; // Put 'Yes' first
      });

      // Create scales
      const xScale = d3.scaleBand()
        .domain(barData.map(d => d.napNeed))
        .range([0, width])
        .padding(0.3);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.avgSleep + d.stdDev) * 1.1])
        .range([height, 0])
        .nice();

      // Create color scale with dashboard-consistent colors
      const colorScale = d3.scaleOrdinal()
        .domain(['Yes', 'No'])
        .range(['#f87171', '#34d399']);

      // Add X axis with styled gridlines
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .tickSize(0)
        )
        .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
        .call(g => g.selectAll('text')
          .attr('dy', '0.5em')
          .style('font-size', '11px')
          .style('fill', '#64748b')
        );

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(yScale)
          .tickSize(0)
          .tickFormat(d => `${d}h`)
        )
        .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
        .call(g => g.selectAll('text')
          .attr('dx', '-0.5em')
          .style('font-size', '11px')
          .style('fill', '#64748b')
        );
        
      // Add Y-axis gridlines
      svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat('')
        )
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line')
          .attr('stroke', '#e2e8f0')
          .attr('stroke-dasharray', '3,3')
        );

      // Add X axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .text('Need to Nap During the Day')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add Y axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Average Sleep (Hours)')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add error bars (standard deviation) with animation
      barData.forEach((d, i) => {
        // Vertical line for error bar
        svg.append('line')
          .attr('x1', xScale(d.napNeed) + xScale.bandwidth() / 2)
          .attr('x2', xScale(d.napNeed) + xScale.bandwidth() / 2)
          .attr('y1', yScale(d.avgSleep))
          .attr('y2', yScale(d.avgSleep))
          .attr('stroke', '#475569')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .delay(i * 100 + 300)
          .attr('y1', yScale(d.avgSleep - d.stdDev))
          .attr('y2', yScale(d.avgSleep + d.stdDev))
          .attr('opacity', 0.7);
        
        // Top cap of error bar
        svg.append('line')
          .attr('x1', xScale(d.napNeed) + xScale.bandwidth() / 2)
          .attr('x2', xScale(d.napNeed) + xScale.bandwidth() / 2)
          .attr('y1', yScale(d.avgSleep + d.stdDev))
          .attr('y2', yScale(d.avgSleep + d.stdDev))
          .attr('stroke', '#475569')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0)
          .transition()
          .duration(300)
          .delay(i * 100 + 600)
          .attr('x1', xScale(d.napNeed) + xScale.bandwidth() / 2 - 8)
          .attr('x2', xScale(d.napNeed) + xScale.bandwidth() / 2 + 8)
          .attr('opacity', 0.7);
        
        // Bottom cap of error bar
        svg.append('line')
          .attr('x1', xScale(d.napNeed) + xScale.bandwidth() / 2)
          .attr('x2', xScale(d.napNeed) + xScale.bandwidth() / 2)
          .attr('y1', yScale(d.avgSleep - d.stdDev))
          .attr('y2', yScale(d.avgSleep - d.stdDev))
          .attr('stroke', '#475569')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0)
          .transition()
          .duration(300)
          .delay(i * 100 + 600)
          .attr('x1', xScale(d.napNeed) + xScale.bandwidth() / 2 - 8)
          .attr('x2', xScale(d.napNeed) + xScale.bandwidth() / 2 + 8)
          .attr('opacity', 0.7);
      });

      // Draw bars with animation
      svg.selectAll('.bar')
        .data(barData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.napNeed))
        .attr('y', height) // Start from bottom
        .attr('width', xScale.bandwidth())
        .attr('height', 0) // Start with height 0
        .attr('fill', d => colorScale(d.napNeed))
        .attr('opacity', 0.85)
        .attr('stroke', d => d3.color(colorScale(d.napNeed)).darker(0.2))
        .attr('stroke-width', 1)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('y', d => yScale(d.avgSleep))
        .attr('height', d => height - yScale(d.avgSleep));

      // Add value labels on bars with fade-in
      svg.selectAll('.value-label')
        .data(barData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => xScale(d.napNeed) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.avgSleep) + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'white')
        .style('font-weight', 'bold')
        .style('opacity', 0)
        .text(d => `${d.avgSleep.toFixed(1)}h`)
        .transition()
        .duration(400)
        .delay((d, i) => i * 100 + 800)
        .style('opacity', 1);

      // Add count labels above bars with fade-in
      svg.selectAll('.count-label')
        .data(barData)
        .enter()
        .append('text')
        .attr('class', 'count-label')
        .attr('x', d => xScale(d.napNeed) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.avgSleep + d.stdDev) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#64748b')
        .style('opacity', 0)
        .text(d => `n=${d.count}`)
        .transition()
        .duration(400)
        .delay((d, i) => i * 100 + 1000)
        .style('opacity', 1);

      // Add legend with better styling
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 70}, 10)`);
        
      // Add background rectangle for legend
      legend.append('rect')
        .attr('width', 60)
        .attr('height', 65)
        .attr('rx', 4)
        .attr('fill', 'white')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))');

      // Add legend title
      legend.append('text')
        .attr('x', 8)
        .attr('y', 15)
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#475569')
        .text('Nap Need');

      // Add legend items
      ['Yes', 'No'].forEach((napNeed, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 20 + 30})`);
        
        legendRow.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', colorScale(napNeed));
        
        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 9)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(napNeed);
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

export default Chart8_NapVsSleep;