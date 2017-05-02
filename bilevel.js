var margin = {top: 350, right: 480, bottom: 350, left: 480},
    radius = Math.min(margin.top, margin.right, margin.bottom, margin.left) - 10;

    var hue = d3.scaleOrdinal(d3.schemeCategory10);

var luminance = d3.scaleSqrt()
    .domain([0, 1e6])
    .clamp(true)
    .range([90, 20]);

var svg = d3.select("body").append("svg")
    .attr("width", margin.left + margin.right)
    .attr("height", margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var partition = d3.partition().size([2 * Math.PI, radius]);

var arc = d3.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .padAngle(.01)
    .padRadius(radius / 3)
    .innerRadius(function(d) { return radius / 3 * d.depth; })
    .outerRadius(function(d) { return radius / 3 * (d.depth + 1) - 1; });

d3.json("flare.json", function(error, data) {
  if (error) throw error;

  // Compute the initial layout on the entire tree to sum sizes.
  // Also compute the full name and fill color for each node,
  // and stash the children so they can be restored as we descend.
  var root = d3.hierarchy(data)
      .sum(function(d) { return d.size; })
      .each(function(d) {
        d._children = d.children;
        d.sum = d.value;
        d.key = key(d);
        d.fill = fill(d);
      });

  var center = svg.append("circle")
      .attr("r", radius / 3)
      .style("fill", "white")
      .on("click", zoomOut);

  center.append("title")
      .text("zoom out");

  var path = svg.selectAll("path")
      .data(partition(root).descendants().slice(1))
    .enter().append("path")
      .each(function(d) { d.dx = d.x1 - d.x0; d.x = d.x0;})
      .attr("d", arc)
      .style("fill", function(d) { return d.fill; })
      .each(function(d) { this._current = updateArc(d); })
      .on("click", zoomIn)

  function zoomIn(p) {
    if (p.depth > 1) p = p.parent;
    if (!p.children) return;
    zoom(p, p);
  }

  function zoomOut(p) {
    if (!p.parent) return;
    zoom(p.parent, p);
  }

  // Zoom to the specified new root.
  function zoom(root, p) {
    if (document.documentElement.__transition__) return;

    // Rescale outside angles to match the new layout.
    var enterArc,
        exitArc,
        outsideAngle = d3.scaleLinear().domain([0, 2 * Math.PI]);

    function insideArc(d) {
      if (p.key > d.key) return {depth: d.depth - 1, x: 0, dx: 0};
      else if (p.key < d.key) return {depth: d.depth - 1, x: 2 * Math.PI, dx: 0};
      else return {depth: 0, x: 0, dx: 2 * Math.PI};
      // return {depth: d.depth - 1, x: 0, dx: 0};
    }

    function outsideArc(d) {
      return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
    }

    center.datum(root);

    // When zooming in, arcs enter from the outside and exit to the inside.
    // Entering outside arcs start from the old layout.
    if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

    path = path.data(partition(root).descendants().slice(1), function(d) { return d.key });

    // path = path.data(partition(root).descendants().slice(1), function(d) { return d.key; });

    // When zooming out, arcs enter from the inside and exit to the outside.
    // Exiting outside arcs transition to the new layout.
    if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

    d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
      path.exit()
          .each(function(d) { d.dx = d.x1 - d.x0; d.x = d.x0; })
          .transition()
          .style("fill-opacity", function(d) { return d.depth === 1 + (root === p) ? 1 : 0; })
          .attrTween("d", function(d) {
            var i = d3.interpolateObject(this._current, exitArc(d));
            this._current = i(0);
            return function(t) {
              return arc(i(t));
            };
          })
          .remove();
      console.log(path)
      path.enter().append("path")
          .style("fill-opacity", function(d) { return d.depth === 2 - (root === p) ? 1 : 0; })
          .style("fill", function(d) { return d.fill; })
          .each(function(d) {
            this._current = enterArc(d);
          })
          .on("click", zoomIn);


      path.transition()
          .style("fill-opacity", 1)
          // .attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); })
          .attrTween("d", function(d) {
            var i = d3.interpolateObject(this._current, updateArc(d));
            this._current = i(0);
            return function(t) {
              return arc(i(t));
            };
          });
    // });
  });
}
})

function key(d) {
  var k = [], p = d;
  while (p.depth) k.push(p.data.name), p = p.parent;
  return k.reverse().join(".");
}

function fill(d) {
  var p = d;
  while (p.depth > 1) p = p.parent;
  var c = d3.lab(hue(p.data.name));
  c.l = luminance(d.sum);
  return c;
}

function arcTween(b) {
  var i = d3.interpolateObject(b, this._current);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

function updateArc(d) {
  return {depth: d.depth, x: d.x, dx: d.dx};
}

d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");
