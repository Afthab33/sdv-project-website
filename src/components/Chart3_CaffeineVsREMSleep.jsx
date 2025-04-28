import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart3_CaffeineVsREMSleep = () => {
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
          d['Sleep Analysis [REM] (hr)'] !== null && 
          d['Did you consume caffeine or alcohol before bed?']
        )
      );

      if (filteredData.length === 0) return;

      // Get container dimensions for responsiveness
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = Math.min(containerWidth * 0.6, 400);

      // Set margins with more space for axis labels
      const margin = { top: 40, right: 30, bottom: 50, left: 70 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create SVG with viewBox for responsiveness
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('id', `caffeine-rem-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Group data by caffeine intake (Yes/No)
      const caffeineGroups = d3.group(filteredData, d => d['Did you consume caffeine or alcohol before bed?']);
      
      // Create a datastructure for the boxplot
      const boxplotData = [];
      
      for (const [category, values] of caffeineGroups) {
        const remValues = values.map(d => d['Sleep Analysis [REM] (hr)']).sort(d3.ascending);
        
        if (remValues.length > 0) {
          const q1 = d3.quantile(remValues, 0.25);
          const median = d3.quantile(remValues, 0.5);
          const q3 = d3.quantile(remValues, 0.75);
          const iqr = q3 - q1;
          const min = Math.max(d3.min(remValues), q1 - 1.5 * iqr);
          const max = Math.min(d3.max(remValues), q3 + 1.5 * iqr);
          
          boxplotData.push({
            category,
            min,
            q1,
            median,
            q3,
            max,
            outliers: remValues.filter(v => v < min || v > max)
          });
        }
      }

      // Create scales
      const xScale = d3.scaleBand()
        .domain(boxplotData.map(d => d.category))
        .range([0, width])
        .padding(0.4);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(boxplotData, d => Math.max(d.max, ...d.outliers)) * 1.1])
        .range([height, 0])
        .nice();

      // Create color scale with softer colors
      const colorScale = d3.scaleOrdinal()
        .domain(['Yes', 'No'])
        .range(['#f87171', '#4ade80']);

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
        .attr('y', height + 35)
        .text('Caffeine or Alcohol Before Bed')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add Y axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('REM Sleep (Hours)')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Draw boxplots with animations
      const boxWidth = xScale.bandwidth();
      
      // Draw each boxplot with enter animations
      boxplotData.forEach(box => {
        const x = xScale(box.category);
        const color = colorScale(box.category);
        const boxGroup = svg.append('g')
          .attr('class', 'boxplot')
          .attr('transform', `translate(${x},0)`);
        
        // Draw vertical line (min to max)
        boxGroup.append('line')
          .attr('x1', boxWidth / 2)
          .attr('x2', boxWidth / 2)
          .attr('y1', yScale(box.min))
          .attr('y2', yScale(box.max))
          .attr('stroke', '#475569')
          .attr('stroke-width', 1)
          .style('opacity', 0)
          .transition()
          .duration(500)
          .style('opacity', 1);
          
        // Draw min horizontal line
        boxGroup.append('line')
          .attr('x1', boxWidth / 4)
          .attr('x2', boxWidth * 3 / 4)
          .attr('y1', yScale(box.min))
          .attr('y2', yScale(box.min))
          .attr('stroke', '#475569')
          .attr('stroke-width', 1)
          .style('opacity', 0)
          .transition()
          .duration(500)
          .delay(100)
          .style('opacity', 1);
          
        // Draw max horizontal line
        boxGroup.append('line')
          .attr('x1', boxWidth / 4)
          .attr('x2', boxWidth * 3 / 4)
          .attr('y1', yScale(box.max))
          .attr('y2', yScale(box.max))
          .attr('stroke', '#475569')
          .attr('stroke-width', 1)
          .style('opacity', 0)
          .transition()
          .duration(500)
          .delay(100)
          .style('opacity', 1);
          
        // Draw the box with animation
        boxGroup.append('rect')
          .attr('x', 0)
          .attr('y', yScale(box.q3))
          .attr('width', boxWidth)
          .attr('height', 0) // Start with zero height
          .attr('fill', color)
          .attr('opacity', 0.7)
          .attr('stroke', '#475569')
          .attr('stroke-width', 1)
          .transition()
          .duration(700)
          .delay(200)
          .attr('height', yScale(box.q1) - yScale(box.q3)); // Animate to final height
          
        // Draw median line with animation
        boxGroup.append('line')
          .attr('x1', 0)
          .attr('x2', 0) // Start with zero width
          .attr('y1', yScale(box.median))
          .attr('y2', yScale(box.median))
          .attr('stroke', '#1e293b')
          .attr('stroke-width', 2)
          .transition()
          .duration(500)
          .delay(400)
          .attr('x2', boxWidth); // Animate to full width
          
        // Draw outliers with delayed animation
        box.outliers.forEach((outlier, i) => {
          boxGroup.append('circle')
            .attr('cx', boxWidth / 2)
            .attr('cy', yScale(outlier))
            .attr('r', 0) // Start with radius 0
            .attr('fill', '#1e293b')
            .attr('opacity', 0.7)
            .transition()
            .duration(300)
            .delay(500 + i * 50) // Stagger the appearance of outliers
            .attr('r', 3); // Grow to final radius
        });
      });

      // Add legend with better styling
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 120}, 10)`);
        
      // Add background rectangle for legend
      legend.append('rect')
        .attr('width', 110)
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
        .text('Consumed Before Bed');

      // Add legend items
      ['Yes', 'No'].forEach((category, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 20 + 30})`);
        
        legendRow.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', colorScale(category))
          .attr('opacity', 0.7)
          .attr('stroke', '#475569')
          .attr('stroke-width', 0.5);
        
        legendRow.append('text')
          .attr('x', 20)
          .attr('y', 8)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(category);
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

export default Chart3_CaffeineVsREMSleep;