export function updateLinechart(checkedValues) {

    const countryMapping = {
        'AL': {'name': 'Albania', 'color': '#FF6347'},
        'AT': {'name': 'Austria', 'color': '#4682B4'},
        'BE': {'name': 'Belgium', 'color': '#32CD32'},
        'BG': {'name': 'Bulgaria', 'color': '#ffc107'},
        'CY': {'name': 'Cyprus', 'color': '#DC143C'},
        'CZ': {'name': 'Czechia', 'color': '#FF69B4'},
        'DE': {'name': 'Germany', 'color': '#8B4513'},
        'DK': {'name': 'Denmark', 'color': '#9ACD32'},
        'EE': {'name': 'Estonia', 'color': '#4169E1'},
        'EL': {'name': 'Greece', 'color': '#8A2BE2'},
        'ES': {'name': 'Spain', 'color': '#FF8C00'},
        'EU28': {'name': 'European Union', 'color': '#2E8B57'},
        'FI': {'name': 'Finland', 'color': '#C71585'},
        'FR': {'name': 'France', 'color': '#6A5ACD'},
        'HR': {'name': 'Croatia', 'color': '#008B8B'},
        'HU': {'name': 'Hungary', 'color': '#BDB76B'},
        'IE': {'name': 'Ireland', 'color': '#556B2F'},
        'IS': {'name': 'Iceland', 'color': '#9932CC'},
        'IT': {'name': 'Italy', 'color': '#8B0000'},
        'LT': {'name': 'Lithuania', 'color': '#E9967A'},
        'LU': {'name': 'Luxembourg', 'color': '#483D8B'},
        'LV': {'name': 'Latvia', 'color': '#2F4F4F'},
        'ME': {'name': 'Montenegro', 'color': '#00CED1'},
        'MK': {'name': 'North Macedonia', 'color': '#9400D3'},
        'MT': {'name': 'Malta', 'color': '#FF4500'},
        'NL': {'name': 'Netherlands', 'color': '#98FB98'},
        'NO': {'name': 'Norway', 'color': '#AFEEEE'},
        'PL': {'name': 'Poland', 'color': '#DB7093'},
        'PT': {'name': 'Portugal', 'color': '#CD853F'},
        'RO': {'name': 'Romania', 'color': '#FFC0CB'},
        'RS': {'name': 'Serbia', 'color': '#DDA0DD'},
        'SE': {'name': 'Sweden', 'color': '#BC8F8F'},
        'SI': {'name': 'Slovenia', 'color': '#4169E1'},
        'SK': {'name': 'Slovakia', 'color': '#8B4513'},
        'TR': {'name': 'Türkiye', 'color': '#FA8072'},
        'UK': {'name': 'United Kingdom', 'color': '#A0522D'},
        'XK': {'name': 'Kosovo*', 'color': '#C0C0C0'}
    }
    

    let countries = checkedValues;
    // console.log("Checked Countries: " + countries);

    // set the dimensions and margins of the graph
    var margin = {top: 80, right: 400, bottom: 80, left: 400},
        width = 1600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_linechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Legend
    // Create a legend container
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width + 20) + ", 20)"); // Adjust the translation as needed



    d3.csv('./csv/linechart_processed.csv', function(data) {

        // Assuming the first row of the dataset contains the column names
        var allColumns = Object.keys(data[0]);
        // console.log("All Columns:", allColumns);

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


        // Function to process data for a given country
        function processDataForCountry(countryCode) {
            var countryData = data.filter(function(d) { return d.geo === countryCode; })[0];
        
            return yearColumns.map(year => {
                // Check if the value is not a number (NaN) or is ":" and replace it with 0
                var value = countryData[year];
                if (value === ":" || isNaN(value)) {
                    value = 0;
                } else {
                    // Ensure the value is a number
                    value = +value;
                }
        
                return { date: year, value: value };
            });
        }
        

        function addLineToChart(processedData, country) {
            // Custom line generator
            var lineGenerator = d3.line()
                .defined(function(d) { return d.value !== 0; }) // Define where the line is drawn
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.value); });
        
            // Draw the line for defined areas
            svg.append("path")
                .datum(processedData)
                .attr("fill", "none")
                .attr("stroke", countryMapping[country]["color"])
                .attr("stroke-width", 1.5)
                .attr("d", lineGenerator);
        
            // Draw a dotted line for undefined areas
            svg.append("path")
                .datum(processedData)
                .attr("fill", "none")
                .attr("stroke", countryMapping[country]["color"])
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "3,3") // This creates the dotted effect
                .attr("d", lineGenerator.defined(function(d) { return d.value === 0; })); // Define where the dotted line is drawn
        }
        

        // Function to add a dots to the chart
        function addDotsToChart(processedData, country) {
            // console.log("Processed Data:", processedData);
            svg.append("g")
            .selectAll("dot")
            .data(processedData)
            .enter()
            .append("circle")
                .attr("cx", function(d) { return x(d.date) } )
                .attr("cy", function(d) { return y(d.value) } )
                .attr("r", 5)
                .attr("fill", countryMapping[country]["color"])
                .attr("stroke", "#fff")

            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0.9);
                    tooltip.html(
                        "<span style='color: #333;'> <strong>State: </strong> " + countryMapping[country]["name"] + "</span><br>" + 
                        "<span style='color: #333;'> <strong>Percentage: </strong> " + 
                        (d.value === 0 ? "Data not available" : d.value + "%") + "</span><br>"
                    )
                    
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });
        }

        // Function to update the legend based on the selected years
        function updateLegend(allCountriesData) {
            // Remove existing legend items
            legend.selectAll("*").remove();
        
            // Add a colored square and text for each country in allCountriesData
            var legendItems = legend.selectAll(".legend-item")
                .data(allCountriesData)
                .enter().append("g")
                .attr("class", "legend-item")
                .attr("transform", function(d, i) {
                    return "translate(0, " + (i * 20) + ")";
                });
        
            legendItems.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", function(d) { return countryMapping[d.country]["color"]; }) // Use color from the data
                .style("stroke", "#293241") // Add black border
                .style("stroke-width", 1);
                
            legendItems.append("text")
                .attr("x", 20)
                .attr("y", 10)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .style("color", "#293241")
                .style("font", "15px Montserrat")
                .text(function(d) { return countryMapping[d.country]["name"]; }); // Use country name from the data
        }
        

        var allCountriesData = [];

        // Iterate over each country and add a line for each
        countries.forEach(function(country, index) {
            var countryDataProcessed = processDataForCountry(country);
            // console.log("Country Data Processed:", countryDataProcessed);

            // Assign a unique color for each line
            // var color = d3.schemeCategory10[index % 10]; // Change or expand this for more than 10 countries

            addLineToChart(countryDataProcessed, country);
            addDotsToChart(countryDataProcessed, country);

            // Add the processed data to the allCountriesData array
            allCountriesData.push({ country: country, data: countryDataProcessed });
            
        });
        updateLegend(allCountriesData);
        
            
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
}