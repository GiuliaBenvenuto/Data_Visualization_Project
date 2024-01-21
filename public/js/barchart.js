export function updateBarchart(year) {

    // Year basing on which i want to update the barchart
    let yearColumn = year;
    console.log("Year: " + yearColumn);

    // Select the chart container and clear its content
    var chartContainer = d3.select("#my_barchart");
    chartContainer.selectAll("*").remove();

    var margin = {top: 30, right: 60, bottom: 110, left: 60},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_barchart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // load the data
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vRH4eOpVXSGv8yQFKn3wm5a6yZX8H1uafXM0VjCDKiObj--4cGOnayvqd3aO25kB2DPHZklTK8Gtl2t/pub?gid=1229357561&single=true&output=csv", function(data) {
    d3.csv('./csv/barchart_processed.csv', function(data) {

        console.log("Col" + yearColumn);

        // X axis
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) { return d.geo; }))
            .padding(0.2);

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

        // Process each row
        data.forEach(function(row) {
            // Check each year's column
            for (let year = 2012; year <= 2023; year++) {
                // Convert the value to a number and update maxValue if it's larger
                const value = +row[year]; // Unary plus '+' is shorthand for converting strings to numbers
                if (value > maxValue) {
                    maxValue = value;
                }
            }
        });

        // Log or use the max value as needed
        console.log(`The maximum value from 2012 to 2023 is: ${maxValue}`);

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, maxValue + 5]) 
            .range([ height, 0]);

        // Call the Y axis on the svg
        svg.append("g")
            .call(d3.axisLeft(y));

        // Create Y grid lines
        svg.selectAll(".horizontal-grid-line")
            .data(y.ticks(10)) // This controls the number of ticks/grid lines
            .enter()
            .append("line")
            .attr("class", "horizontal-grid-line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", function(d) { return y(d); })
            .attr("y2", function(d) { return y(d); })
            .attr("stroke", "#ccc") // Color of the grid lines
            .attr("stroke-dasharray", "3,3") // Style of the grid lines
            .attr("shape-rendering", "crispEdges");
        
        

        var colorScale = d3.scaleLinear();
            colorScale.domain([0, maxValue])
            colorScale.range(['#bbf7d0', '#15803d'])

        // Define the div for the tooltip (show value in a small div on mouse hover)
        // var tooltip = addTooltip(d3.select('body'));

        // Bars
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.geo); })
            // .attr("y", function(d) { return y(0); })
            .attr("y", function(d) { return y(+d[yearColumn]); })
            .attr("width", x.bandwidth())
            // .attr("height", function(d) { return height - y(0); })
            .attr("height", function(d) { return height - y(+d[yearColumn]); })
            .attr("fill", function(d) { return colorScale(+d[yearColumn]); })
            .on("mouseover", function(d) {
                tooltip.transition()
                .duration(100)
                .style("opacity", 0.9);
                tooltip.html("<strong>Value:</strong> " + d.value)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", 0);
            });

        // Add title
        // addTitle(svg, "Top-20 number of trees per state", "20px", "#14532d", width / 2, -10);

        /* Animation
        svg.selectAll("rect")
            .transition()
            .duration(400)
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .delay(function(d,i){console.log(i) ; return(i*100)})
        */
    })
}

