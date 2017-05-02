var width = 800;
var height = 500;
var radius = 10;

var yearStart = 1950;
var yearEnd = 2010;

var yRange = []
for (var i = yearStart; i <= yearEnd; i+=10) {
  yRange.push((i - yearStart) / 10 * (radius * 3) + radius);
}
console.log(yRange)

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("adjusted.csv", function(error, data) {
  if (error) throw error;
  var max = d3.max(data, function(d) { return +d.avg_salary });

  data = data.filter(function(d) { return +d.year == 2010 })


  var xScale = d3.scaleLinear().domain([0, max]).range([10, width - 10]);
  var yScale = d3.scaleOrdinal(yRange);
  var xAxis = d3.axisBottom(xScale);

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var histogram = d3.histogram()
      .value(function(d) { return +d.avg_salary })
      .domain(xScale.domain())
  console.log(histogram(data))

})
