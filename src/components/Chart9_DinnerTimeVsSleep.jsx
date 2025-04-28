import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart9_DinnerTimeVsSleep = () => {
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
          d['What time you had Dinner?']
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
        .attr('id', `dinner-time-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Extract dinner hour from the time string
      filteredData.forEach(d => {
        try {
          const timeStr = d['What time you had Dinner?'];
          if (timeStr) {
            const match = timeStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
            if (match) {
              let hour = parseInt(match[1]);
              const minutes = parseInt(match[2]);
              const ampm = match[4] ? match[4].toUpperCase() : null;
              
              // Convert to 24-hour format
              if (ampm === 'PM' && hour < 12) hour += 12;
              if (ampm === 'AM' && hour === 12) hour = 0;
              
              // Store as decimal hours for plotting
              d.dinnerHour = hour + (minutes / 60);
            }
          }
        } catch (e) {
          console.error('Error parsing time:', e);
        }
      });

      // Filter out any data points with invalid dinner hours
      const validData = filteredData.filter(d => d.dinnerHour !== undefined);

      if (validData.length === 0) return;

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([
          d3.min(validData, d => d.dinnerHour) - 0.5, 
          d3.max(validData, d => d.dinnerHour) + 0.5
        ])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(validData, d => d['Total Sleep']) * 1.1])
        .range([height, 0])
        .nice();

      // Add X axis with styled gridlines
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .tickFormat(d => {
            // Convert 24-hour to 12-hour format with AM/PM
            const hour = Math.floor(d);
            const minutes = Math.round((d - hour) * 60);
            let formattedHour = hour % 12;
            if (formattedHour === 0) formattedHour = 12;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            return `${formattedHour}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}${ampm}`;
          })
          .ticks(5)
          .tickSize(0)
        )
        .call(g => g.select('.domain').attr('stroke', '#e2e8f0'))
        .call(g => g.selectAll('text')
          .attr('dy', '0.6em')
          .style('font-size', '11px')
          .style('fill', '#64748b')
          .attr('transform', 'rotate(-30)')
          .style('text-anchor', 'end')
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
        .attr('y', height + 45)
        .text('Dinner Time')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add Y axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Total Sleep (Hours)')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Create color scale based on dinner time
      const colorScale = d3.scaleThreshold()
        .domain([19, 21]) // Boundaries at 7 PM and 9 PM
        .range(['#34d399', '#fbbf24', '#f87171']);

      // Add scatter points with animation
      svg.selectAll('circle')
        .data(validData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.dinnerHour))
        .attr('cy', d => yScale(d['Total Sleep']))
        .attr('r', 0) // Start with radius 0
        .style('fill', d => colorScale(d.dinnerHour))
        .style('opacity', 0.7)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .transition()
        .duration(600)
        .delay((d, i) => i * 5)
        .attr('r', 5); // Grow to final size

      // Compute regression line
      const xValues = validData.map(d => d.dinnerHour);
      const yValues = validData.map(d => d['Total Sleep']);

      // Simple linear regression
      const n = xValues.length;
      const xMean = d3.mean(xValues);
      const yMean = d3.mean(yValues);
      
      const ssxy = d3.sum(validData.map((d, i) => (d.dinnerHour - xMean) * (d['Total Sleep'] - yMean)));
      const ssxx = d3.sum(validData.map(d => Math.pow(d.dinnerHour - xMean, 2)));
      
      const slope = ssxy / ssxx;
      const intercept = yMean - slope * xMean;
      
      // Plot regression line with animation
      const x1 = d3.min(xValues);
      const x2 = d3.max(xValues);
      const y1 = intercept + slope * x1;
      const y2 = intercept + slope * x2;
      
      const line = svg.append('path')
        .datum([
          { x: x1, y: y1 },
          { x: x2, y: y2 }
        ])
        .attr('fill', 'none')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
        );
      
      // Animate the line
      const totalLength = line.node().getTotalLength();
      line.attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .delay(300)
        .attr('stroke-dashoffset', 0);

      // Add trend info with fade-in
      svg.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#475569')
        .style('opacity', 0)
        .text(`Trend: ${slope.toFixed(2)} hours of sleep per hour later dinner`)
        .transition()
        .duration(500)
        .delay(1000)
        .style('opacity', 1);

      // Add legend with better styling
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 110}, 10)`);
        
      // Add background rectangle for legend
      legend.append('rect')
        .attr('width', 100)
        .attr('height', 90)
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
        .text('Dinner Time');

      // Add legend items
      const legendItems = [
        { color: '#34d399', label: 'Before 7PM' },
        { color: '#fbbf24', label: '7-9PM' },
        { color: '#f87171', label: 'After 9PM' }
      ];

      legendItems.forEach((item, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 20 + 30})`);
        
        legendRow.append('circle')
          .attr('r', 4)
          .attr('fill', item.color)
          .style('opacity', 0.7);
        
        legendRow.append('text')
          .attr('x', 12)
          .attr('y', 4)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(item.label);
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

export default Chart9_DinnerTimeVsSleep;