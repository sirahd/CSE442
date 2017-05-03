var category = ["Management in Business, Science, and Arts", "Business Operations Specialists", "Financial Specialists", "Computer and Mathematical", "Architecture and Engineering", "Technicians", "Life, Physical, and Social Science", "Community and Social Services", "Legal", "Education, Training, and Library", "Arts, Design, Entertainment, Sports, and Media", "Healthcare Practitioners and Technicians", "Healthcare Support", "Protective Service", "Food Preparation and Serving", "Building and Grounds Cleaning and Maintenance", "Personal Care and Service", "Sales and Related", "Office and Administrative Support", "Farming, Fisheries, and Forestry", "Construction", "Extraction", "Installation, Maintenance, and Repair", "Production", "Transportation and Material Moving", "Military"];
var margin = {
  top: 20,
  right: 40,
  bottom: 30,
  left: 100
};

var datearray = [];
var strokecolor = "#000000";

var width = 1000 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;
var barHeight = 100;

var x = d3.scaleUtc()
  .range([0, width]);

var y = d3.scaleLinear()
  .range([height - 10, 0]);

var z = d3.scaleOrdinal(d3.schemeCategory20);

var xAxis = d3.axisBottom(x)
  .ticks(7);

var yAxisLeft = d3.axisLeft(y)
  .tickFormat(d3.format(".0%"));
var yAxisRight = d3.axisRight(y)
  .tickFormat(d3.format(".0%"));

var stack = d3.stack()
  .offset(d3.stackOffsetExpand)
  .keys(category.sort().reverse())

var svg = d3.select(".chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("position", "absolute")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("out.csv", (error, data) => {
  var nest = d3.nest()
    .key((d) => d.year);

  data.forEach((d) => {
    d.year = Date.parse(d.year);
    d.count_category_all = +d.count_category_all;
  });
  var result = nest.entries(data);

  result.forEach(function(e) {
    e.values.forEach(function(i) {
      e[i.category] = i.percentage;
    })
  });

  var layers = stack(result);

  x.domain(d3.extent(data, (d) => d.year));
  var min = d3.min(layers, function(d) {
    return d3.min(d, function(d) {
      return d3.min(d);
    })
  });
  var max = d3.max(layers, function(d) {
    return d3.max(d, function(d) {
      return d3.max(d);
    })
  });
  y.domain([min, max]);

  var area = d3.area()
    .x(function(d) {
      return x(d.data.key);
    })
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  var path = svg.selectAll("path")
    .data(layers)
    .enter()
    .append("path")
    .attr("class", "layer")
    .attr("d", function(d) {
      return area(d);
    })
    .style("fill", (d, i) => z(i))
    .on("click", function(d) {
      // draw_histogram(d.key, d[0].data.values);
    });


  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + width + ", 0)")
    .call(yAxisRight);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxisLeft);

  svg.selectAll(".layer")
    .attr("opacity", 1)
    .on("mouseover", function(d, i) {
      svg.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(d, j) {
          return j != i ? 0.2 : 1;
        })
    })
    .on("mousemove", function(d, i) {
      var mouse = d3.mouse(this);
      var mouseX = mouse[0];
      var mouseY = mouse[1];

      var invertedx = x.invert(mouseX);
      var year = Math.round(invertedx.getUTCFullYear() / 10) * 10;
      var category = d.key

      var data;
      d.forEach(function(e) {
        if (Array.isArray(e)) {
          e.data.values.forEach(function(i) {
            var dataYear = new Date(+e.data.key);
            dataYear = dataYear.getUTCFullYear();
            if (year === dataYear && i.category === category) {
              data = i;
            }
          })
        }
      })

      d3.select(this)
        .classed("hover", true)

      var tooltip = d3.select("#tooltip")
        .classed("hidden", false)
        .style("left", (mouseX + margin.left + 5) + "px")
        .style("top", (mouseY + margin.top + 10) + "px")
      tooltip.select("#year").text(year);
      tooltip.select("#category").text(data.category);
      tooltip.select("#count").text(data.count_category_all.toLocaleString());
      tooltip.select("#population").text((+data.year_total).toLocaleString())
    })
    .on("mouseout", function(d, i) {
      svg.selectAll(".layer")
        .transition()
        .duration(250)
        .attr("opacity", "1");
      d3.select(this)
        .classed("hover", false)

      d3.select("#tooltip").classed("hidden", true);
    })

  // var histogramSvg = d3.selectAll(".histogram").append("svg")
  //   .attr("width", width + margin.left + margin.right)
  //   .attr("height", (barHeight + 10) + margin.top + margin.bottom)
  //   .append("g")
  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //
  // function draw_histogram(category, d) {
  //   var data = [];
  //
  //   d.forEach(function(d) {
  //     if (d.category === category) {
  //       data.push({
  //         salary: +d.salary,
  //         count: +d.count_all,
  //         job: d.occupation
  //       })
  //     }
  //   });
  //   var x = d3.scaleLinear()
  //     .domain(d3.extent(data, function(d) {
  //       return d.salary;
  //     }))
  //     .range([0, width]);
  //   var y = d3.scaleLinear()
  //     .range([barHeight, 0]);
  //
  //   var histogram = d3.histogram()
  //     .value(function(d) {
  //       return d.count;
  //     })
  //     .domain(x.domain())
  //     .thresholds(20);


  //   var bin = histogram(data);
  //
  //   bin.forEach(function(d) {
  //     d.count = 0;
  //   });
  //   data.forEach(function(d) {
  //     bin.forEach(function(e) {
  //       if (e.x0 <= d.salary && d.salary <= e.x1) {
  //         e.count += d.count;
  //       }
  //     })
  //   });
  //
  //   y.domain(d3.extent(bin, function(d) {
  //     return d.count
  //   }));
  //
  //   var bar = histogramSvg.selectAll(".bar")
  //     .data(bin, function(d) {}).enter().append("g")
  //     .attr("class", "bar")
  //     .attr("transform", function(d) {
  //       return "translate(" + x(d.x0) + ", " + y(d.count) + ")";
  //     })
  //   bar.append("rect")
  //     .attr("x", 1)
  //     .attr("width", function(d) {
  //       return x(bin[0].x1) - x(bin[0].x0) - 1
  //     })
  //     .attr("height", function(d) {
  //       return barHeight - y(d.count);
  //     });
  // }
});
