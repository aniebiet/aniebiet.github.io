//Generate colours for the visualisation
var colorgen = d3.scale.ordinal()
			    		.range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
            					"#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
            					"#cab2d6","#6a3d9a","#ffff99","#b15928"]);

//Change colours according to the agency name
var color = function(d) { return colorgen(d["Agency Name"]); };

//initialize parallel coordinates visualisation
var parcoords = d3.parcoords()("#visualisation")    
    .mode("queue") // progressive rendering
    .height(window.outerHeight*0.65)
    .margin({
      top: 36,
      left: 150,
      right: 20,
      bottom: 30
    });

// load csv file and create the chart
d3.csv('../dist/data/data.csv', function(data) {
  // Parse date
  var dateParse = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
  // Remove unecessary functionb
  data.forEach(function(d,i) {   	  	  	
  	d["Start Date"] = dateParse(d["Start Date"]);
  	d["Completion Date"] = dateParse(d["Completion Date"]);  	
  	delete d["Business Case ID"];
	delete d["Agency Code"];	
	delete d["Agency Project ID"];
	delete d["Planned Project Completion Date (B2)"];
	delete d["Projected/Actual Project Completion Date (B2)"];
	delete d["Schedule Variance (in days)"];
	delete d["Updated Date"];
	delete d["Updated Time"];
	delete d["Updated Date and Time"];	
	delete d["Unique Project ID"];
	delete d["Schedule Variance (%)"];
	d.id = d.id || i; 		// slickgrid needs each data element to have an id	
  });
  
  
  parcoords
    .data(data)    
    .hideAxis(["Unique Investment Identifier"])										
	.hideAxis(["Investment Title"])				
	.hideAxis(["Project ID"])				
	.hideAxis(["Project Name"])			
	.hideAxis(["Project Description"])										
	.hideAxis(["Projected/Actual Cost ($ M)"])									
	.hideAxis(["Schedule Variance (%)"])
	.hideAxis(["id"])
	.color(color)
    .alpha(0.25)
    .composite("darker")
	.render()
    .reorderable()
    .brushMode("1D-axes");

  parcoords.svg.selectAll("text")
    .style("font", "10px sans-serif");

  // setting up grid
  var column_keys = d3.keys(data[0]);
  var columns = column_keys.map(function(key,i) {
    return {
      id: key,
      name: key,
      field: key,
      sortable: true
    }
  });

  var options = {
    enableCellNavigation: true,
    enableColumnReorder: false,
    multiColumnSort: false
  };

  var dataView = new Slick.Data.DataView();
  var grid = new Slick.Grid("#grid", dataView, columns, options);
  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });

  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });

  // column sorting
  var sortcol = column_keys[0];
  var sortdir = 1;

  function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
  }
  
  // click header to sort grid column
  grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;

    if ($.browser.msie && $.browser.version <= 8) {
      dataView.fastSort(sortcol, args.sortAsc);
    } else {
      dataView.sort(comparer, args.sortAsc);
    }
  });

  // highlight row in chart
  grid.onMouseEnter.subscribe(function(e,args) {
    var i = grid.getCellFromEvent(e).row;
    var d = parcoords.brushed() || data;
    parcoords.highlight([d[i]]);
  });
  grid.onMouseLeave.subscribe(function(e,args) {
    parcoords.unhighlight();
  });

  // fill grid with data
  gridUpdate(data);

  // update grid on brush
  parcoords.on("brush", function(d) {
    gridUpdate(d);
  });

  function gridUpdate(data) {
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();
  };

});
