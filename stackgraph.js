var category = ["Management in Business, Science, and Arts", "Business Operations Specialists", "Financial Specialists", "Computer and Mathematical", "Architecture and Engineering", "Technicians", "Life, Physical, and Social Science", "Community and Social Services", "Legal", "Education, Training, and Library", "Arts, Design, Entertainment, Sports, and Media", "Healthcare Practitioners and Technicians", "Healthcare Support", "Protective Service", "Food Preparation and Serving", "Building and Grounds Cleaning and Maintenance", "Personal Care and Service", "Sales and Related", "Office and Administrative Support", "Farming, Fisheries, and Forestry", "Construction", "Extraction", "Installation, Maintenance, and Repair", "Production", "Transportation and Material Moving", "Military"];
var margin = {
  top: 20,
  right: 40,
  bottom: 30,
  left: 30
};

var width = 1000 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;
var barHeight = 100;

var tooltip = d3.select("body")
  .append("div")
  .attr("class", "remove")
  .style("position", "absolute")
  .style("z-index", "20")
  .style("visibility", "hidden")
  .style("top", "30px")
  .style("left", "55px");

var x = d3.scaleTime()
  .range([0, width]);

var y = d3.scaleLinear()
  .range([height - 10, 0]);

var z = d3.scaleLinear()
  .domain([0, 22])
  .range([0, 1]);

var xAxis = d3.axisBottom(x)
  .ticks(d3.timeYear.every(10));

var yAxisLeft = d3.axisLeft(y);
var yAxisRight = d3.axisRight(y);

var stack = d3.stack()
  .offset(d3.stackOffsetExpand)
  .keys(category.sort())

var svg = d3.select(".chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("out.csv", (error, data) => {
  console.log(d3.extent(data, function(d) { return +d.salary; }))
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
    .curve(d3.curveCardinal)
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
    .style("fill", (d, i) => d3.interpolateRainbow(Math.random()))
    .on("click", function(d) {
      draw_histogram(d.key, d[0].data.values);
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
          return j != i ? 0.6 : 1;
        })
    })
  //   .on("mousemove", function(d, i) {
  //     mousex = d3.mouse(this);
  //     mousex = mousex[0];
  //     var invertedx = x.invert(mousex);
  //     invertedx = invertedx.getMonth() + invertedx.getDate();
  //     var selected = (d.values);
  //     for (var k = 0; k < selected.length; k++) {
  //       datearray[k] = selected[k].date
  //       datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
  //     }
  //
  //     mousedate = datearray.indexOf(invertedx);
  //     pro = d.values[mousedate].value;
  //
  //     d3.select(this)
  //     .classed("hover", true)
  //     .attr("stroke", strokecolor)
  //     .attr("stroke-width", "0.5px"),
  //     tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible");
  //
  //   })
  //   .on("mouseout", function(d, i) {
  //    svg.selectAll(".layer")
  //     .transition()
  //     .duration(250)
  //     .attr("opacity", "1");
  //     d3.select(this)
  //     .classed("hover", false)
  //     .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
  // })
  //
  // var vertical = d3.select(".chart")
  //       .append("div")
  //       .attr("class", "remove")
  //       .style("position", "absolute")
  //       .style("z-index", "19")
  //       .style("width", "1px")
  //       .style("height", "380px")
  //       .style("top", "10px")
  //       .style("bottom", "30px")
  //       .style("left", "0px")
  //       .style("background", "#fff");
  //
  // d3.select(".chart")
  //     .on("mousemove", function(){
  //        mousex = d3.mouse(this);
  //        mousex = mousex[0] + 5;
  //        vertical.style("left", mousex + "px" )})
  //     .on("mouseover", function(){
  //        mousex = d3.mouse(this);
  //        mousex = mousex[0] + 5;
  //        vertical.style("left", mousex + "px")});

  var histogramSvg = d3.selectAll(".histogram").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", (barHeight + 10) + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function draw_histogram(category, d) {
    var data = [];

    d.forEach(function(d) {
      if (d.category === category) {
        data.push({
          salary: +d.salary,
          count: +d.count_all,
          job: d.occupation
        })
      }
    });
    var x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) {
        return d.salary;
      }))
      .range([0, width]);
    var y = d3.scaleLinear()
      .range([barHeight, 0]);

    var histogram = d3.histogram()
      .value(function(d) {
        return d.count;
      })
      .domain(x.domain())
      .thresholds(20);


    var bin = histogram(data);

    bin.forEach(function(d) {
      d.count = 0;
    });
    data.forEach(function(d) {
      bin.forEach(function(e) {
        if (e.x0 <= d.salary && d.salary <= e.x1) {
          e.count += d.count;
        }
      })
    });

    y.domain(d3.extent(bin, function(d) { return d.count }));

    var bar = histogramSvg.selectAll(".bar")
        .data(bin, function(d) {  }).enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + ", " + y(d.count) + ")"; })
    bar.append("rect")
        .attr("x", 1)
        .attr("width", function(d) { return x(bin[0].x1) - x(bin[0].x0) - 1 } )
        .attr("height", function(d) { return barHeight - y(d.count); });
  }
});
