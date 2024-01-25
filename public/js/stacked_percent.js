// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_stacked_barchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
// d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv", function(data) {
d3.csv('./csv/stacked_percent_processed.csv', function(data) {

  // Dataset header
  var headers = data.columns;

  // Filtering out non-year columns
  var subgroups = headers.filter(function(header) {
      // Check if the header is a year in the range 2012 to 2023
      return header >= 2012 && header <= 2023;
  });
  console.log("AFTER:", subgroups);

  // Filtering data where 'geo' is 'AT'
  var filteredData = data.filter(function(row) {
    return row['geo'] === 'AT';
    });

    // Extracting year values for each filtered row
    var yearValues = filteredData.map(function(row) {
        return subgroups.map(function(year) {
            return row[year];
        });
    });

    console.log("Year values for 'AT':", yearValues);



  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = d3.map(data, function(d){return(d.group)}).keys()

  // Add X axis
  var x = d3.scaleBand()
      .domain(subgroups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e41a1c','#377eb8','#4daf4a'])

  // Normalize the data -> sum of each group must be 100!
  /* console.log("DATA", data)
  var dataNormalized = []
  data.forEach(function(d){
    // Compute the total
    var tot = 0
    var i = 0;
    for (i in subgroups){ name=subgroups[i] ; tot += +d[name] }
    // Now normalize
    for (i in subgroups){ name=subgroups[i] ; d[name] = d[name] / tot * 100}
  })*/

  // Compute totals and normalize for the filtered data
  filteredData.forEach(function(d) {
    var tot = 0;
    subgroups.forEach(function(name) {
        tot += +d[name];
    });
    subgroups.forEach(function(name) {
        d[name] = (d[name] / tot) * 100;
    });
});

  // Stack the data
    var stackedData = d3.stack()
        .keys(subgroups)
        (filteredData);

    // Visualization code (assuming x, y, color, and svg are already defined)
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth());
})