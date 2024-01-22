// set the dimensions and margins of the graph
var margin = {top: 80, right: 80, bottom: 80, left: 80},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_linechart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



d3.csv('./csv/linechart_processed.csv', function(data) {

    // Assuming the first row of the dataset contains the column names
    var allColumns = Object.keys(data[0]);

    // Filter out the columns for the years 2006 to 2017
    var yearColumns = allColumns.filter(function(column) {
        var year = parseInt(column);
        return year >= 2006 && year <= 2017;
    });

    // console.log("Colonne:" + yearColumns);

    // X axis 
    var x = d3.scalePoint()
    .domain(yearColumns)
    .range([0, width]);


    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .style("font", "17px Montserrat")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font", "15px Montserrat");


    // Initialize max value
    let maxValue = Number.MIN_SAFE_INTEGER;

    // Find the maximum value in the dataset
    data.forEach(function(row) {
        // Iterate over each year column
        yearColumns.forEach(function(year) {
            // Convert the value to a number (assuming the data is numeric)
            const value = +row[year]; // Unary plus '+' is shorthand for converting strings to numbers
            if (value > maxValue) {
                maxValue = value;
            }
        });
    });

    // console.log("Maximum Value:", maxValue);

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, maxValue + 5]) 
        .range([ height, 0]);

    // Call the Y axis on the svg
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font", "15px Montserrat");


    // Filter out the 'AT' row
    var atData = data.filter(function(d) { return d.geo === 'AT'; })[0];
    // console.log("AT Data:", atData);

    // Process AT data for line chart
    var atDataProcessed = yearColumns.map(year => {
        return { date: year, value: +atData[year] };
    });
    // console.log("AT Data Processed:", atDataProcessed);

    // Add the line
    svg.append("path")
      .datum(atDataProcessed)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
        
        )
    // Add the points
    svg
      .append("g")
      .selectAll("dot")
      .data(atDataProcessed)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.date) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 4)
        .attr("fill", "#69b3a2")
        .attr("stroke", "#fff")
        
    // Add horizontal grid lines
    svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
        .tickSizeOuter(0) // Exclude the outer tick at the top
    );

    // Style the grid lines
    svg.selectAll(".grid line")
    .style("stroke", "#ccc")  // Grey color
    .style("stroke-dasharray", "3 3")  // Dashed line
    .style("opacity", 0.9);  // Opacity 
})