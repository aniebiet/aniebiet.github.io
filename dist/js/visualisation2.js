

// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return d.totalCost; }
function y(d) { return d.plannedCost; }
function radius(d) { return d.count; }
function color(d) { return d.department; }
function key(d) { return d.name; }

// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
    width = 960 - margin.right,
    height = 500 - margin.top - margin.bottom;

// Various scales. These domains make assumptions of data, naturally.  //0.000001, 150000
var xScale = d3.scale.log().domain([0.000001, 150000]).range([0, width]),
    yScale = d3.scale.log().domain([0.000001, 150000]).range([height, 0]),
    radiusScale = d3.scale.linear().domain([0, 50]).range([5, 80]),
    colorScale = d3.scale.category20b();

// The x & y axes.
var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d")),
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(12, d3.format(",d"));

// Create the SVG container and set the origin.
var svg = d3.select("#visualisation").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add the x-axis.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Add the y-axis.
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", height)
    .attr("y2", 10)
    .attr("stroke-width", 2)
    .attr("stroke", "black");;

// Add an x-axis label.
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Planned Cost in Millions of Dollars");

// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Lifecycle Cost in Millions of dollars");

// Add the year label; the value is set on transition.
var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width)
    .text(1992);


d3.csv("../dist/data/data.csv", function(dataset) {
  reFormat();
  //reformat data for visualisation
  function reFormat() {  
    var investmentTitles = [];
    var dateParse = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
    var yearsInFile = [1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,
      2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014];

    //Get total cost of investment titles every year
    var nestedData = d3.nest()
      .key(function(d){
        return d["Investment Title"];
      })
      .key(function(d){
        var fullDate = new Date(dateParse(d["Start Date"]));        
        return fullDate.getFullYear();
      })
      .rollup(function (leaves){
        return{
          "totalCost": d3.sum(leaves, function(d){
            return parseFloat(d["Lifecycle Cost"]);
          }),
          "totalPlannedCost": d3.sum(leaves, function(d){
            return parseFloat(d["Planned Cost ($ M)"]);
          }),
          "count": leaves.length
        }
      })
      .entries(dataset);

      //Get departments in Investment Titles
      var deptData = d3.nest()
      .key(function(d){
        return d["Investment Title"];
      })
      .rollup(function (leaves){
        return{
          "department": leaves[0]["Agency Name"]
        }
      })
      .entries(dataset);

      var obj = {};
      for (var i = 0; i < nestedData.length; i++) {
        var investmentTitle = { "name": nestedData[i].key, 
                                "department": deptData[i].values.department,
                                "count": [],
                                "totalCost": [],
                                "plannedCost": []};

        for (var j = 0; j < yearsInFile.length; j++) {
          var tempCount = 1, tempCost = 1, tempPlannedCost = 1;
          for (var k = 0; k < nestedData[i].values.length; k++) {
            if (nestedData[i].values[k].key == yearsInFile[j]){
              tempCount = nestedData[i].values[k].values.count;     
              tempCost = nestedData[i].values[k].values.totalCost;    
              tempPlannedCost = nestedData[i].values[k].values.totalPlannedCost;    

            }
          };

          investmentTitle["count"].push([yearsInFile[j], tempCount]); 
          investmentTitle["totalCost"].push([yearsInFile[j], tempCost]); 
          investmentTitle["plannedCost"].push([yearsInFile[j], tempPlannedCost]); 
        };

       

        investmentTitles.push(investmentTitle);
      };
      dataset = investmentTitles;
     
    //var jsonData = JSON.stringify(investmentTitles);
    //console.log(jsonData);
    
}
  // A bisector since many investmentTitle's data is sparsely-defined.
  var bisect = d3.bisector(function(d) { return d[0]; });

  // Add a dot per investmentTitle. Initialize the data at 1992, and set the colors.
  var dot = svg.append("g")
      .attr("class", "dots")
    .selectAll(".dot")
      .data(interpolateData(1992))
    .enter().append("circle")
      .attr("class", "dot")
      .style("fill", function(d) { return colorScale(color(d)); })
      .call(position)
      .sort(order);

  // Add a title.
  dot.append("title")
      .text(function(d) { return "Investment Title: "+d.name + "\nAgency Name: "+ d.department ; });

  // Add an overlay for the year label.
  var box = label.node().getBBox();

  var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height)
        .on("mouseover", enableInteraction);

  // Start a transition that interpolates the data based on year.
  svg.transition()
      .duration(50000)
      .ease("linear")
      .tween("year", tweenYear)
      .each("end", enableInteraction);

  // Positions the dots based on data.
  function position(dot) {    
    dot .attr("cx", function(d) { return xScale(x(d)); })
        .attr("cy", function(d) { return yScale(y(d)); })
        .attr("r", function(d) { return radiusScale(radius(d)); });
  }

  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  // After the transition finishes, you can mouseover to change the year.
  function enableInteraction() {
    var yearScale = d3.scale.linear()
        .domain([1992, 2014])
        .range([box.x + 10, box.x + box.width - 10])
        .clamp(true);

    // Cancel the current transition, if any.
    svg.transition().duration(0);

    overlay
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);

    function mouseover() {
      label.classed("active", true);
    }

    function mouseout() {
      label.classed("active", false);
    }

    function mousemove() {
      displayYear(yearScale.invert(d3.mouse(this)[0]));
    }
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateNumber(1992, 2014);
    return function(t) { displayYear(year(t)); };
  }

  // Updates the display to show the specified year.
  function displayYear(year) {
    dot.data(interpolateData(year), key).call(position).sort(order);
    label.text(Math.round(year));
  }

  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year) {
    return dataset.map(function(d) {      
      return {
        name: d.name,
        department: d.department,
        // totalCost: d.totalCost[1],
        // count: d.count[1],
        // plannedCost: d.plannedCost[1]
        totalCost: interpolateValues(d.totalCost, year),
        count: interpolateValues(d.count, year),
        plannedCost: interpolateValues(d.plannedCost, year)
      };
    });
  }

  // Finds (and possibly interpolates) the value for the specified year.
  function interpolateValues(values, year) {
    var i = bisect.left(values, year, 0, values.length - 1),
        a = values[i];
    if (i > 0) {
      var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  }
});


