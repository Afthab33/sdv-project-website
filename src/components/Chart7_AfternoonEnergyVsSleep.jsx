import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart7_AfternoonEnergyVsSleep = () => {
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
          d['How was your energy level in the Afternoon?']
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
        .attr('id', `afternoon-energy-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Define energy level categories and their order
      const energyLevelOrder = ['Low', 'Moderate', 'High'];
      
      // Create color scale with dashboard-consistent colors
      const colorScale = d3.scaleOrdinal()
        .domain(energyLevelOrder)
        .range(['#f87171', '#fbbf24', '#34d399']);

      // Count data points by energy level and sleep duration for sizing circles
      const countByEnergyAndSleep = new Map();
      
      filteredData.forEach(d => {
        const energyLevel = d['How was your energy level in the Afternoon?'];
        const sleepHour = Math.round(d['Total Sleep'] * 2) / 2; // Round to nearest 0.5 hour
        
        const key = `${energyLevel}-${sleepHour}`;
        const count = countByEnergyAndSleep.get(key) || 0;
        countByEnergyAndSleep.set(key, count + 1);
      });
      
      // Create a dataset for scatter plot with sized points
      const scatterData = Array.from(countByEnergyAndSleep, ([key, count]) => {
        const [energyLevel, sleepHour] = key.split('-');
        return {
          energyLevel,
          sleepHour: +sleepHour,
          count
        };
      });

      // Calculate sleep range for x-axis
      const minSleep = d3.min(scatterData, d => d.sleepHour) || 5;
      const maxSleep = d3.max(scatterData, d => d.sleepHour) || 9;
      const sleepPadding = (maxSleep - minSleep) * 0.1;

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([minSleep - sleepPadding, maxSleep + sleepPadding])
        .range([0, width])
        .nice();

      const yScale = d3.scalePoint()
        .domain(energyLevelOrder)
        .range([height, 0])
        .padding(0.5);

      // Size scale for circles
      const sizeScale = d3.scaleSqrt()
        .domain([1, d3.max(scatterData, d => d.count)])
        .range([5, 18]);

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
        .text('Total Sleep (Hours)')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add Y axis label
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Afternoon Energy Level')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', '#475569');

      // Add dots with size based on count - with animations
      svg.selectAll('circle')
        .data(scatterData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.sleepHour))
        .attr('cy', d => yScale(d.energyLevel))
        .attr('r', 0) // Start with radius 0
        .style('fill', d => colorScale(d.energyLevel))
        .style('opacity', 0.7)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .transition()
        .duration(600)
        .delay((d, i) => i * 20)
        .attr('r', d => sizeScale(d.count));

      // Add count labels to larger circles with delay
      svg.selectAll('.count-label')
        .data(scatterData.filter(d => d.count > 1)) // Only show labels for counts > 1
        .enter()
        .append('text')
        .attr('class', 'count-label')
        .attr('x', d => xScale(d.sleepHour))
        .attr('y', d => yScale(d.energyLevel) + 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('fill', 'white')
        .style('font-weight', 'bold')
        .style('opacity', 0)
        .text(d => d.count)
        .transition()
        .duration(400)
        .delay((d, i) => i * 20 + 600)
        .style('opacity', 1);

      // Calculate mean sleep for each energy level
      const energyMeans = energyLevelOrder.map(energy => {
        const energyData = filteredData.filter(d => d['How was your energy level in the Afternoon?'] === energy);
        return {
          energy,
          mean: d3.mean(energyData, d => d['Total Sleep']) || 0,
          count: energyData.length
        };
      });

      // Add mean lines with animation
      energyMeans.forEach((energyData, i) => {
        if (energyData.count > 0) {
          // Add mean marker (vertical line)
          svg.append('line')
            .attr('x1', xScale(energyData.mean))
            .attr('x2', xScale(energyData.mean))
            .attr('y1', yScale(energyData.energy))
            .attr('y2', yScale(energyData.energy))
            .attr('stroke', colorScale(energyData.energy))
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '3,3')
            .style('opacity', 0)
            .transition()
            .duration(400)
            .delay(800 + i * 100)
            .attr('y1', yScale(energyData.energy) - 15)
            .attr('y2', yScale(energyData.energy) + 15)
            .style('opacity', 0.8);
            
          // Add mean label
          svg.append('text')
            .attr('x', xScale(energyData.mean))
            .attr('y', yScale(energyData.energy) - 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', '#475569')
            .style('font-weight', '500')
            .style('opacity', 0)
            .text(`Avg: ${energyData.mean.toFixed(1)}h`)
            .transition()
            .duration(400)
            .delay(1000 + i * 100)
            .style('opacity', 1);
        }
      });

      // Add unified legend with background
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 110}, 10)`);
        
      // Add background rectangle for legend
      legend.append('rect')
        .attr('width', 100)
        .attr('height', 120)
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
        .text('Energy Level');

      // Add color legend items
      energyLevelOrder.forEach((energy, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 20 + 30})`);
        
        legendRow.append('circle')
          .attr('r', 5)
          .attr('fill', colorScale(energy));
        
        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 4)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(energy);
      });
      
      // Add size legend title
      legend.append('text')
        .attr('x', 8)
        .attr('y', 85)
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#475569')
        .text('Count');
      
      // Add size legend items (only show min and max)
      const minCount = 1;
      const maxCount = d3.max(scatterData, d => d.count);
      
      [minCount, maxCount].forEach((count, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 20 + 100})`);
        
        legendRow.append('circle')
          .attr('r', sizeScale(count))
          .attr('fill', '#94a3b8')
          .attr('opacity', 0.7);
        
        legendRow.append('text')
          .attr('x', 20)
          .attr('y', 4)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(count);
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

export default Chart7_AfternoonEnergyVsSleep;