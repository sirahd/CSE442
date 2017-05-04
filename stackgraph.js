var category = ["Management in Business, Science, and Arts", "Business Operations Specialists", "Financial Specialists", "Computer and Mathematical", "Architecture and Engineering", "Technicians", "Life, Physical, and Social Science", "Community and Social Services", "Legal", "Education, Training, and Library", "Arts, Design, Entertainment, Sports, and Media", "Healthcare Practitioners and Technicians", "Healthcare Support", "Protective Service", "Food Preparation and Serving", "Building and Grounds Cleaning and Maintenance", "Personal Care and Service", "Sales and Related", "Office and Administrative Support", "Farming, Fisheries, and Forestry", "Construction", "Extraction", "Installation, Maintenance, and Repair", "Production", "Transportation and Material Moving", "Military", "No Occupation"];
var occupationList = occupation;
var margin = {
  top: 20,
  right: 40,
  bottom: 40,
  left: 100
};

var datearray = [];
var strokecolor = "#000000";

var width = 1200 - margin.left - margin.right;
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
  
var svg = d3.select(".chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("position", "absolute")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var nest = d3.nest();

var area = d3.area()
  .x(function(d) {
    return x(d.data.key);
  })
  .y0((d) => y(d[0]))
  .y1((d) => y(d[1]));

var maxOfMax = function(d) {
  return d3.max(d, function(e) {
    return d3.max(e);
  })
};
var minOfMin = function(d) {
  return d3.min(d, function(e) {
    return d3.min(e);
  })
};

var zoomOut = d3.csv("out.csv", (error, data) => {
  nest.key((d) => d.year);
  stack.keys(category.sort().reverse())
    .offset(d3.stackOffsetExpand)

  data.forEach((d) => {
    d.year = Date.parse(d.year);
    d.count_category_all = +d.count_category_all;
  });

  var result = nest.entries(data);
  result.forEach(function(d) {
    category.forEach(function(e) {
      d[e] = 0;
    })
    d.values.forEach(function(f) {
      d[f.category] = +f.count_category_all;
    })
  });

  var layers = stack(result);

  x.domain(d3.extent(data, (d) => d.year));
  var min = d3.min(layers, minOfMin);
  var max = d3.max(layers, maxOfMax);
  y.domain([min, max]);

  var path = svg.selectAll(".layer")
    .data(layers, function(d) {
      return d.key;
    })
    .enter()
    .append("path")
    .attr("class", "layer")
    .attr("d", function(d) {
      return area(d);
    })
    .style("fill", (d, i) => z(i))
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
        .classed("hover", true);

      var tooltip = d3.select("#tooltip")
        .classed("hidden", false)
        .style("left", (mouseX + margin.left + 5) + "px")
        .style("top", (mouseY + margin.top + 10) + "px");

      tooltip.select("#year").select("span").text(year);
      tooltip.select("#category").select("span").text(data.category);
      tooltip.select("#count").select("span").text(data.count_category_all.toLocaleString());
      tooltip.select("#population").select("span").text((+data.year_total).toLocaleString())
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
    .on("click", function(d, i) {
      zoomIn(data, d.key)
    });

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .attr("id", "right-axis")
    .attr("transform", "translate(" + width + ", 0)")
    .call(yAxisRight);

  svg.append("g")
    .attr("class", "y axis")
    .attr("id", "left-axis")
    .call(yAxisLeft);

  svg.selectAll(".layer")
    .attr("opacity", 1)

//  svg.append("text")
//     .attr("text-anchor", "middle")
//     .attr("tranform", "translate(0, 100)")
//     .style("font-size", "15px")
//     .text("Year")

  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + -(margin.left - 50) + ", " + (height / 2) + ")rotate(-90)")
    .style("font-size", "15px")
    .text("Percentage over population")

  svg.append("text")
    .attr("text-anchor", "middle") 
    .attr("transform", "translate(" + width / 2 + ", " + (height + margin.bottom) + ")")
    .style("font-size", "15px")
    .text("Year")

 
});

var zoomIn = function(data, category) {
  var result = nest.entries(data)
  var jobList = occupationList[category];

  result.forEach(function(d) {
    jobList.forEach(function(e) {
      d[e] = 0;
    })
    d.values.forEach(function(f) {
      if (f.category === category) d[f.occupation] = +f.count_all;
    })
  });

  stack.keys(jobList.sort().reverse())
      .offset(d3.stackOffsetNone)
  var newLayers = stack(result);

  var min = d3.min(newLayers, minOfMin);
  var max = d3.max(newLayers, maxOfMax);
  y.domain([min, max]);
  
  var path = svg.selectAll(".layer")
    .data(newLayers, function(d) {
      return d.key;
    })
  path.exit()
    .attr("opacity", 0)
    .remove()
  
  var layer = path.enter()
    .append("path")
    .attr("class", "layer")
    .attr("opacity", 0)
  
  layer.transition()
    .attr("d", function(d) {
      return area(d);
    })
    .style("fill", (d, i) => z(i))
    .attr("opacity", 1)
    

  layer.on("mouseover", function(d, i) {
      d3.select(this)
        .classed("hover", true);
      svg.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(d, j) {
          return j != i ? 0.2 : 1;
        })
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
    .on("mousemove", function(d, i) {
      var data;
      var mouse = d3.mouse(this);
      var mouseX = mouse[0];
      var mouseY = mouse[1];

      var invertedx = x.invert(mouseX);
      var year = Math.round(invertedx.getUTCFullYear() / 10) * 10;
      var occupation = d.key

      d.forEach(function(e) {
        if (Array.isArray(e)) {
          e.data.values.forEach(function(i) {
            var dataYear = new Date(+e.data.key);
            dataYear = dataYear.getUTCFullYear();
            if (year === dataYear && i.occupation === occupation) {
              data = i;
            }
          })
        }
      })
      var tooltip = d3.select("#tooltip")
        .classed("hidden", false)
        .style("left", (mouseX + margin.left + 5) + "px")
        .style("top", (mouseY + margin.top + 10) + "px");

      tooltip.select("#population").classed("hidden", true);
      tooltip.select("#count").classed("hidden", true);
      tooltip.select("#year").select("span").text(year);
      tooltip.select("#category").select("span").text(data.category);
      tooltip.select("#job").classed("hidden", false).select("span").text(data.occupation);
      tooltip.select("#count_job").classed("hidden", false).select("span").text((+data.count_all).toLocaleString());
    })
  
  var yearPercentage = [];

  result.forEach(function(d) {
    d.values.forEach(function(e) {
      if (e.category === category) {
        yearPercentage.push(+e.count_category_all / +e.year_total);
      }
    })
  })
  
  y.domain([0, Math.max.apply(Math, yearPercentage)]);
  var domainWidth = y.domain();

  if ((domainWidth[1] - domainWidth[0]) / 0.01 < 8) {
    yAxisLeft.tickFormat(d3.format(".2%"));
    yAxisRight.tickFormat(d3.format(".2%"));
  } else {
    yAxisLeft.tickFormat(d3.format(".1%"));
    yAxisRight.tickFormat(d3.format(".1%"));
  }
  
  svg.select("#left-axis") 
    .transition()
    .duration(750)
    .call(yAxisLeft);

  svg.selectAll("#right-axis") 
    .transition()
    .duration(750)
    .call(yAxisRight);

  
}
