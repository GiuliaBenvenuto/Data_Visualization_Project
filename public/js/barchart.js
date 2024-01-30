export function updateBarchart(year, selection) {
    console.log("Updating barchart for year " + year + " and selection " + selection);

    const countryMapping = {
        "AL": "Albania",
        "AT": "Austria",
        "BA": "Bosnia / Herzegovina",
        "BE": "Belgium",
        "BG": "Bulgaria",
        "CH": "Switzerland",
        "CY": "Cyprus",
        "CZ": "Czechia",
        "DE": "Germany",
        "DK": "Denmark",
        "EE": "Estonia",
        "EL": "Greece",
        "ES": "Spain",
        "EU27_2020": "European Union",
        "FI": "Finland",
        "FR": "France",
        "HR": "Croatia",
        "HU": "Hungary",
        "IE": "Ireland",
        "IS": "Iceland",
        "IT": "Italy",
        "LT": "Lithuania",
        "LU": "Luxembourg",
        "LV": "Latvia",
        "MK": "North Macedonia",
        "MT": "Malta",
        "NL": "Netherlands",
        "NO": "Norway",
        "PL": "Poland",
        "PT": "Portugal",
        "RO": "Romania",
        "RS": "Serbia",
        "SE": "Sweden",
        "SI": "Slovenia",
        "SK": "Slovakia",
        "TR": "Turkey",
        "UK": "United Kingdom",
        "XK": "Kosovo"
    };

    
    // Year basing on which i want to update the barchart
    let yearColumn = year;

    // Select the chart container and clear its content
    var chartContainer = d3.select("#my_barchart");
    chartContainer.selectAll("*").remove(); 

    var margin = {top: 30, right: 95, bottom: 150, left: 97},
        width = 1300 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_barchart")
    .append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // This makes the chart responsive
        .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // load the data
    d3.csv('./csv/barchart_processed.csv', function(data) {

        // PROVA
        // Pre-process data: Convert values to numbers and handle missing values
        data.forEach(function(d) {
            d[year] = d[year] === ":" ? null : +d[year]; // Convert to null if value is ":", else convert to number
        });

        // Sort data based on selection
        if (selection === "alphabet") {
            data.sort(function(a, b) {
                return (countryMapping[a.geo] || a.geo).localeCompare(countryMapping[b.geo] || b.geo);
            });
        } else if (selection === "value") {
            data.sort(function(a, b) {
                // Move null values to the end
                if (a[year] === null) return 1;
                if (b[year] === null) return -1;
                return b[year] - a[year]; // Descending order
            });
        }
        // ------------------------------
        
        // X axis
        var x = d3.scaleBand()
            .range([ 0, width ])
            // .domain(data.map(function(d) { return d.geo; }))
            .domain(data.map(function(d) { 
                // Use the countryMapping to convert geo codes to country names
                return countryMapping[d.geo] || d.geo; // Fallback to geo code if no mapping is found
            }))
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

        // Find the maximum value in the dataset
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


        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, maxValue + 5]) 
            .range([ height, 0]);

        // Call the Y axis on the svg
        svg.append("g")
            .call(d3.axisLeft(y))
            .style("font", "15px Montserrat");

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
            .attr("stroke", "#aaaaaa") // Color of the grid lines
            .style("opacity", 0.9)  // Opacity 
            .attr("stroke-dasharray", "3,6") // Style of the grid lines
            .attr("shape-rendering", "crispEdges");
        
        
        // Color scale
        var colorScale = d3.scaleLinear();
            colorScale.domain([0, maxValue])
            colorScale.range(['#B7E0F8','#3D5A80'])

        // Tooltip
        var tooltip = d3.select('body')
            .append("div")
            .style("position", "absolute")
            .style("background", "#f0f0f0") // Use a light grey color for the background
            .style("padding", "10px")
            .style("border", "1px solid #ccc") // Use a darker grey for the border
            .style("border-radius", "8px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("font", "15px Montserrat")
            .style("color", "#333");


        // Bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(countryMapping[d.geo]); })
            .attr("y", function(d) { return y(+d[yearColumn]); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(+d[yearColumn]); })
            //.attr("rx", 5) // rounded corners
            //.attr("ry", 5) // rounded corners
            .attr("fill", function(d) { return colorScale(+d[yearColumn]); })
            .on("mouseover", function(d) { 

                // Reduce opacity of all bars except the hovered one
                // d3.selectAll(".bar").style("opacity", o => (o === d ? 1.0 : 0.6));
                d3.selectAll(".bar")
                .transition()
                .duration(200)
                .attr("fill", function(o) {
                    return (o === d) ? colorScale(+d[yearColumn]) : "#ccc"; // #ccc is the color for non-hovered bars
                })
                

                tooltip.transition()        
                .duration(100)      
                .style("opacity", .9); 
                
                tooltip.html(
                    "<span style='color: #333;'> <strong>State: </strong> " + countryMapping[d.geo] + "</span><br>" + 
                    "<span style='color: #333;'> <strong>Year: </strong> " + yearColumn + " </span><br>" +
                    "<span style='color: #333;'> <strong>Percentage: </strong> " + d[yearColumn] + "% </span><br>" 
                )
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");   
            })   
            .on("mousemove", function(d) {
                tooltip
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");
            })         
            .on("mouseout", function(d) {  
                // Reset opacity of all bars
                // d3.selectAll(".bIar").style("opacity", 1.0);
                d3.selectAll(".bar")
                .transition()
                .duration(200)
                .attr("fill", function(d) { return colorScale(+d[yearColumn]); });
                

                tooltip.transition()        
                .duration(100)      
                .style("opacity", 0);   
            });
            

            // Calculate the average
            let sum = 0;
            let count = 0;
            data.forEach(function(d) {
                if (d[yearColumn] !== ":") { // Assuming ":" is used for missing values
                    sum += +d[yearColumn];
                    count += 1;
                }
            });
            let average = sum / count;

            // Add the average line after the Y axis
            svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(average))
            .attr("y2", y(average))
            .attr("stroke", "red") // Color of the average line
            .attr("stroke-width", "2") // Thickness of the average line
            .attr("stroke-dasharray", "5,5") 
            .attr("shape-rendering", "crispEdges")
            .style("z-index", "10"); 

            // Add a label for the average value at the end of the line
            svg.append("text")
            .attr("class", "average-label")
            .attr("x", width) 
            .attr("y", y(average)) 
            .attr("dy", "-0.5em") 
            .attr("text-anchor", "end") 
            .style("fill", "red") 
            .style("font-size", "14px") 
            .style("font-family", "Montserrat")
            .style("font-weight", 700)
            .text(`${average.toFixed(2)} %`); 

            svg.append("text")
            .attr("class", "average-label")
            .attr("x", width) 
            .attr("y", y(average) - 16) 
            .attr("dy", "-0.5em") 
            .attr("text-anchor", "end") 
            .style("fill", "red") 
            .style("font-size", "14px") 
            .style("font-family", "Montserrat")
            .style("font-weight", 700)
            .text(`average:`); 
    
        
    })
}

