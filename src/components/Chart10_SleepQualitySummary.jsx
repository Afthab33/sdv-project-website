import { useEffect, useRef, useId } from 'react';
import * as d3 from 'd3';
import { loadData } from '../utils/data';

const Chart10_SleepQualitySummary = () => {
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
        d => d['How well-rested do you feel upon waking up?']
      );

      if (filteredData.length === 0) return;

      // Get container dimensions for responsiveness
      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = Math.min(containerWidth * 0.6, 400);

      // Set margins with more space for labels
      const margin = { top: 30, right: 30, bottom: 30, left: 30 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create SVG with viewBox for responsiveness
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('id', `sleep-quality-summary-chart-${chartId}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Group data by sleep quality
      const qualityGroups = d3.group(
        filteredData, 
        d => d['How well-rested do you feel upon waking up?']
      );
      
      // Create a dataset for the pie chart
      const pieData = Array.from(qualityGroups, ([quality, values]) => {
        return {
          quality,
          count: values.length,
          percentage: (values.length / filteredData.length) * 100
        };
      });

      // Define sleep quality categories and their order
      const qualityOrder = ['Tired', 'Moderately Rested', 'Well Rested'];
      
      // Sort by sleep quality order
      pieData.sort((a, b) => {
        return qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality);
      });

      // Create color scale with dashboard-consistent colors
      const colorScale = d3.scaleOrdinal()
        .domain(qualityOrder)
        .range(['#f87171', '#fbbf24', '#34d399']);

      // Set up pie chart
      const radius = Math.min(width, height) / 2.5;
      
      // Create pie layout
      const pie = d3.pie()
        .value(d => d.count)
        .sort(null); // Don't sort, maintain our explicit order
      
      // Create arc generator with padding between slices
      const arc = d3.arc()
        .innerRadius(radius * 0.5) // Create a donut chart
        .outerRadius(radius)
        .padAngle(0.02);
        
      // Create outer arc for labels
      const outerArc = d3.arc()
        .innerRadius(radius * 1.1)
        .outerRadius(radius * 1.1);
        
      // Move center of pie to center of SVG
      const pieG = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
      
      // Add gradients for better visual appeal
      const defs = svg.append('defs');
      
      // Create gradient for each slice
      pieData.forEach((d, i) => {
        const gradientId = `gradient-${chartId}-${i}`;
        const gradient = defs.append('linearGradient')
          .attr('id', gradientId)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '100%');
          
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', d3.color(colorScale(d.quality)).brighter(0.2).toString());
          
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', d3.color(colorScale(d.quality)).darker(0.2).toString());
      });
      
      // Create slices with animations
      const slices = pieG.selectAll('path')
        .data(pie(pieData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => `url(#gradient-${chartId}-${i})`)
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('opacity', 0.9)
        .style('filter', 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))')
        .attr('transform', 'scale(0.8)') // Start small
        .style('opacity', 0)
        .transition() // Add animation
        .duration(800)
        .delay((d, i) => i * 150)
        .attr('transform', 'scale(1)') // Scale to normal size
        .style('opacity', 0.9);

      // Add percentage labels inside slices with animations
      pieG.selectAll('text.percentage')
        .data(pie(pieData))
        .enter()
        .append('text')
        .attr('class', 'percentage')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .style('opacity', 0)
        .text(d => `${Math.round(d.data.percentage)}%`)
        .transition()
        .duration(600)
        .delay((d, i) => i * 150 + 400)
        .style('opacity', 1);
        
      // Add outer labels with polylines - improved positioning
      pieG.selectAll('text.label')
        .data(pie(pieData))
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('transform', d => {
          const pos = outerArc.centroid(d);
          pos[0] = radius * (midAngle(d) < Math.PI ? 1.3 : -1.3);
          return `translate(${pos})`;
        })
        .attr('dy', '.35em')
        .attr('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
        .style('font-size', '12px')
        .style('fill', '#475569')
        .style('font-weight', '500')
        .style('opacity', 0)
        .text(d => `${d.data.quality} (${d.data.count})`)
        .transition()
        .duration(600)
        .delay((d, i) => i * 150 + 600)
        .style('opacity', 1);
        
      // Add polylines between slices and labels with animation
      pieG.selectAll('polyline')
        .data(pie(pieData))
        .enter()
        .append('polyline')
        .attr('points', d => {
          const pos = outerArc.centroid(d);
          pos[0] = radius * (midAngle(d) < Math.PI ? 1.2 : -1.2);
          return [arc.centroid(d), outerArc.centroid(d), pos];
        })
        .style('fill', 'none')
        .style('stroke', '#94a3b8')
        .style('stroke-width', '1px')
        .style('opacity', 0)
        .transition()
        .duration(600)
        .delay((d, i) => i * 150 + 500)
        .style('opacity', 0.7);

      // Add center text with total count
      pieG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .style('font-size', '14px')
        .style('fill', '#475569')
        .style('opacity', 0)
        .text('Total')
        .transition()
        .duration(800)
        .style('opacity', 1);
        
      pieG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#334155')
        .style('opacity', 0)
        .text(filteredData.length)
        .transition()
        .duration(800)
        .delay(300)
        .style('opacity', 1);
        
      // Helper function to calculate the middle angle of an arc
      function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      }

      // Add a legend
      const legendG = svg.append('g')
        .attr('transform', `translate(${width/2}, ${height - 20})`);
        
      // Create a legend background
      legendG.append('rect')
        .attr('x', -120)
        .attr('y', -15)
        .attr('width', 240)
        .attr('height', 30)
        .attr('rx', 4)
        .attr('fill', 'white')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))');
      
      // Add legend items
      const legendItems = pieData.map(d => ({
        quality: d.quality,
        color: colorScale(d.quality)
      }));
      
      // Position legend items
      const legendWidth = 240;
      const itemWidth = legendWidth / legendItems.length;
      
      legendItems.forEach((item, i) => {
        const legendItem = legendG.append('g')
          .attr('transform', `translate(${-legendWidth/2 + itemWidth/2 + i*itemWidth}, 0)`);
          
        legendItem.append('circle')
          .attr('r', 5)
          .attr('fill', item.color);
          
        legendItem.append('text')
          .attr('x', 0)
          .attr('y', -20)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', '#475569')
          .text(item.quality);
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

export default Chart10_SleepQualitySummary;