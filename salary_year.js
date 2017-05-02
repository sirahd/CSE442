var svg = d3.select('svg'),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr('width') - margin.left - margin.right,
    height = +svg.attr('height') - margin.top - margin.bottom,
    g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var line = d3.line()
    .x((d) => x(+d.year))
    .y((d) => y(+d.avg_salary));

d3.csv('adjusted.csv', (d) => {
  d.year = +d.year;
  d.avg_salary = +d.avg_salary;
  return d;
}, (error, data) => {
  if (error) throw error;

  x.domain(d3.extent(data, (d) => d.year));
  y.domain(d3.extent(data, (d) => d.avg_salary));

  g.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
    .select('.domain')
      .remove();

  g.append('g')
      .call(d3.axisLeft(y))
    .append('text')
      .attr('fill', '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Price ($)');

  g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', line);
});