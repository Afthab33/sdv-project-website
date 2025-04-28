import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart6_WorkloadVsSleep = () => {
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
          d['If Yes, you worked today. How much work you did?']
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
        .attr('id', `workload-sleep-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Group data by workload
      const workloadGroups = d3.group(
        filteredData, 
        d => d['If Yes, you worked today. How much work you did?']
      );
      
      // Create dataset for chart
      const chartData = Array.from(workloadGroups, ([key, values]) => {
        return {
          workload: key,
          avgSleep: d3.mean(values, d => d['Total Sleep']),
          stdDev: d3.deviation(values, d => d['Total Sleep']) || 0,
          count: values.length,
          dataPoints: values.map(d => ({
            totalSleep: d['Total Sleep'],
            wellRested: d['How well-rested do you feel upon waking up?']
          }))
        };
      });

      // Order by workload intensity
      const workloadOrder = ['Low Work', 'Medium Work', 'High Work'];
      chartData.sort((a, b) => {
        return workloadOrder.indexOf(a.workload) - workloadOrder.indexOf(b.workload);
      });

      // Create scales
      const xScale = d3.scaleBand()
        .domain(chartData.map(d => d.workload))
        .range([0, width])
        .padding(0.4);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d['Total Sleep']) * 1.1])
        .range([height, 0])
        .nice();

      // Create color scale for sleep quality
      const colorScale = d3.scaleOrdinal()
        .domain(['Tired', 'Moderately Rested', 'Well Rested'])
        .range(['#f87171', '#fbbf24', '#34d399']);

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
        .text('Workload Intensity')
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

      // Add error bars (standard deviation) with animation
      chartData.forEach((group, i) => {
        if (group.stdDev > 0) {
          // Vertical line for error bar
          svg.append('line')
            .attr('x1', xScale(group.workload) + xScale.bandwidth() / 2)
            .attr('x2', xScale(group.workload) + xScale.bandwidth() / 2)
            .attr('y1', yScale(group.avgSleep))
            .attr('y2', yScale(group.avgSleep))
            .attr('stroke', '#475569')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0)
            .transition()
            .duration(600)
            .delay(i * 100 + 300)
            .attr('y1', yScale(group.avgSleep - group.stdDev))
            .attr('y2', yScale(group.avgSleep + group.stdDev))
            .attr('opacity', 0.7);
          
          // Top cap of error bar
          svg.append('line')
            .attr('x1', xScale(group.workload) + xScale.bandwidth() / 2)
            .attr('x2', xScale(group.workload) + xScale.bandwidth() / 2)
            .attr('y1', yScale(group.avgSleep + group.stdDev))
            .attr('y2', yScale(group.avgSleep + group.stdDev))
            .attr('stroke', '#475569')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0)
            .transition()
            .duration(400)
            .delay(i * 100 + 700)
            .attr('x1', xScale(group.workload) + xScale.bandwidth() / 2 - 6)
            .attr('x2', xScale(group.workload) + xScale.bandwidth() / 2 + 6)
            .attr('opacity', 0.7);
          
          // Bottom cap of error bar
          svg.append('line')
            .attr('x1', xScale(group.workload) + xScale.bandwidth() / 2)
            .attr('x2', xScale(group.workload) + xScale.bandwidth() / 2)
            .attr('y1', yScale(group.avgSleep - group.stdDev))
            .attr('y2', yScale(group.avgSleep - group.stdDev))
            .attr('stroke', '#475569')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0)
            .transition()
            .duration(400)
            .delay(i * 100 + 700)
            .attr('x1', xScale(group.workload) + xScale.bandwidth() / 2 - 6)
            .attr('x2', xScale(group.workload) + xScale.bandwidth() / 2 + 6)
            .attr('opacity', 0.7);
        }
      });

      // Add jittered data points with animation
      const jitterWidth = xScale.bandwidth() * 0.8;
      
      chartData.forEach((group, groupIndex) => {
        group.dataPoints.forEach((point, i) => {
          // Add jitter to x position
          const jitter = Math.random() * jitterWidth - jitterWidth / 2;
          
          svg.append('circle')
            .attr('cx', xScale(group.workload) + xScale.bandwidth() / 2 + jitter)
            .attr('cy', yScale(point.totalSleep))
            .attr('r', 0)
            .attr('fill', colorScale(point.wellRested || 'Moderately Rested'))
            .attr('opacity', 0)
            .attr('stroke', 'white')
            .attr('stroke-width', 0.5)
            .transition()
            .duration(500)
            .delay(groupIndex * 100 + i * 10) 
            .attr('r', 4.5)
            .attr('opacity', 0.7);
        });
      });

      // Add mean markers with animation
      chartData.forEach((group, i) => {
        svg.append('circle')
          .attr('cx', xScale(group.workload) + xScale.bandwidth() / 2)
          .attr('cy', yScale(group.avgSleep))
          .attr('r', 0)
          .attr('fill', '#1e293b')
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
          .transition()
          .duration(600)
          .delay(i * 100)
          .attr('r', 7);
          
        // Add count and mean labels with animation
        svg.append('text')
          .attr('x', xScale(group.workload) + xScale.bandwidth() / 2)
          .attr('y', yScale(group.avgSleep + group.stdDev + 0.5))
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .style('font-weight', '500')
          .style('opacity', 0)
          .text(`${group.avgSleep.toFixed(1)}h (n=${group.count})`)
          .transition()
          .duration(400)
          .delay(i * 100 + 800)
          .style('opacity', 1);
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

export default Chart6_WorkloadVsSleep;