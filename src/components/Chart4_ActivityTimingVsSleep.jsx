import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart4_ActivityTimingVsSleep = () => {
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
      
      // Filter out rows with missing activity timing values
      const filteredData = data.filter(d => (
        d['If you have done any physical activity. What time have you done?'] &&
        d['Total Sleep'] !== null &&
        d['How well-rested do you feel upon waking up?']
      ));

      if (filteredData.length === 0) return;

      // Group data by activity timing
      const activityGroups = d3.group(filteredData, d => d['If you have done any physical activity. What time have you done?']);
      
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
        .attr('id', `activity-timing-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Define activity timing categories and their order 
      const activityTimingOrder = ['Morning', 'Afternoon', 'Evening'];
      
      // Create color scale for sleep quality
      const colorScale = d3.scaleOrdinal()
        .domain(['Tired', 'Moderately Rested', 'Well Rested'])
        .range(['#f87171', '#fbbf24', '#34d399']);

      // Process data to calculate averages for each timing category
      const processedData = [];
      
      for (const timing of activityTimingOrder) {
        const timingData = activityGroups.get(timing);
        
        if (timingData && timingData.length > 0) {
          const avgSleep = d3.mean(timingData, d => d['Total Sleep']);
          
          // Count sleep quality distribution
          const qualityCounts = {
            'Tired': 0,
            'Moderately Rested': 0,
            'Well Rested': 0
          };
          
          timingData.forEach(d => {
            qualityCounts[d['How well-rested do you feel upon waking up?']]++;
          });
          
          processedData.push({
            timing,
            avgSleep,
            count: timingData.length,
            qualityCounts,
            data: timingData
          });
        }
      }

      // Create X scale (activity timing)
      const xScale = d3.scaleBand()
        .domain(activityTimingOrder)
        .range([0, width])
        .padding(0.3);

      // Create Y scale (sleep duration)
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.avgSleep) * 1.1 || 10])
        .range([height, 0])
        .nice();

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
        .text('Activity Timing')
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

      // Add bars for each timing category with animations
      processedData.forEach((group, i) => {
        // Add bar
        svg.append('rect')
          .attr('x', xScale(group.timing))
          .attr('y', height) // Start from bottom
          .attr('width', xScale.bandwidth())
          .attr('height', 0) // Start with height 0
          .attr('fill', '#6366f1') // Indigo color to match theme
          .attr('opacity', 0.7)
          .attr('stroke', '#4f46e5')
          .attr('stroke-width', 1)
          .transition()
          .duration(800)
          .delay(i * 100)
          .attr('y', yScale(group.avgSleep))
          .attr('height', height - yScale(group.avgSleep));
          
        // Add value label above bar
        svg.append('text')
          .attr('x', xScale(group.timing) + xScale.bandwidth() / 2)
          .attr('y', yScale(group.avgSleep) - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .style('font-weight', '500')
          .style('fill', '#475569')
          .style('opacity', 0)
          .text(`${group.avgSleep.toFixed(1)}h`)
          .transition()
          .duration(500)
          .delay(i * 100 + 500)
          .style('opacity', 1);
      });

      // Add individual data points
      processedData.forEach(group => {
        group.data.forEach((d, i) => {
          const jitterWidth = xScale.bandwidth() * 0.8;
          const jitterAmount = (Math.random() - 0.5) * jitterWidth;
          
          svg.append('circle')
            .attr('cx', xScale(group.timing) + xScale.bandwidth() / 2 + jitterAmount)
            .attr('cy', yScale(d['Total Sleep']))
            .attr('r', 0) // Start with radius 0
            .attr('fill', colorScale(d['How well-rested do you feel upon waking up?']))
            .attr('opacity', 0.7)
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .transition()
            .duration(400)
            .delay(800 + i * 10) // Staggered delay
            .attr('r', 4); // Grow to final size
        });
      });

      // Add legend with better styling
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 110}, 10)`);
        
      // Add background rectangle for legend
      legend.append('rect')
        .attr('width', 100)
        .attr('height', 80)
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
        .text('Sleep Quality');

      // Add legend items
      const sleepQualities = ['Tired', 'Moderately Rested', 'Well Rested'];
      sleepQualities.forEach((quality, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(10, ${i * 20 + 30})`);
        
        legendRow.append('circle')
          .attr('r', 4)
          .attr('fill', colorScale(quality));
        
        legendRow.append('text')
          .attr('x', 12)
          .attr('y', 4)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(quality);
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

export default Chart4_ActivityTimingVsSleep;