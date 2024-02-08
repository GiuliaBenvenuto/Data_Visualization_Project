export function updateLinechart(checkedValues) {

    const countryMapping = {
        'AL': {'name': 'Albania', 'color': '#FF6347'},
        'AT': {'name': 'Austria', 'color': '#4682B4'},
        'BE': {'name': 'Belgium', 'color': '#32CD32'},
        'BG': {'name': 'Bulgaria', 'color': '#ffc107'},
        'CY': {'name': 'Cyprus', 'color': '#DC143C'},
        'CZ': {'name': 'Czechia', 'color': '#FF69B4'},
        'DE': {'name': 'Germany', 'color': '#4ff5ff'},
        'DK': {'name': 'Denmark', 'color': '#9ACD32'},
        'EE': {'name': 'Estonia', 'color': '#4169E1'},
        'EL': {'name': 'Greece', 'color': '#9b56dc'},
        'ES': {'name': 'Spain', 'color': '#FF8C00'},
        'EU28': {'name': 'European Union', 'color': '#00a94a'},
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
        'MK': {'name': 'North Macedonia', 'color': '#6b0099'},
        'MT': {'name': 'Malta', 'color': '#FF4500'},
        'NL': {'name': 'Netherlands', 'color': '#98FB98'},
        'NO': {'name': 'Norway', 'color': '#AFEEEE'},
        'PL': {'name': 'Poland', 'color': '#DB7093'},
        'PT': {'name': 'Portugal', 'color': '#CD853F'},
        'RO': {'name': 'Romania', 'color': '#FFC0CB'},
        'RS': {'name': 'Serbia', 'color': '#DDA0DD'},
        'SE': {'name': 'Sweden', 'color': '#BC8F8F'},
        'SI': {'name': 'Slovenia', 'color': '#80c4fb'},
        'SK': {'name': 'Slovakia', 'color': '#ff6a00'},
        'TR': {'name': 'Türkiye', 'color': '#FA8072'},
        'UK': {'name': 'United Kingdom', 'color': '#A0522D'},
        'XK': {'name': 'Kosovo*', 'color': '#C0C0C0'}
    }
    

    let countries = checkedValues;

    // set the dimensions and margins of the graph
    var margin = {top: 80, right: 280, bottom: 80, left: 280},
        width = 1800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_linechart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // This makes the chart responsive
        .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Legend
    // Create a legend container
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width + 20) + ", 20)"); // Adjust the translation as needed



    d3.csv('./csv/linechart_processed.csv', function(data) {

        var allColumns = Object.keys(data[0]);
        var yearColumns = allColumns.filter(function(column) {
            var year = parseInt(column);
            return year >= 2006 && year <= 2017;
        });

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
            yearColumns.forEach(function(year) {
                const value = +row[year]; 
                if (value > maxValue) {
                    maxValue = value;
                }
            });
        });

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, maxValue + 5]) 
            .range([ height, 0]);

        // Call the Y axis on the svg
        svg.append("g")
            .call(d3.axisLeft(y))
            .style("font", "15px Montserrat");


        // Function to draw the EU28 average line
        function drawEU28AverageLine() {
            // Extract the data for EU28
            const eu28Data = data.find(d => d.geo === 'EU28');
            if (!eu28Data) return; 

            // Process the EU28 data similar to other countries
            const processedEU28Data = yearColumns.map(year => ({
                date: year,
                value: eu28Data[year] === ":" || isNaN(eu28Data[year]) ? 0 : +eu28Data[year]
            }));

            // Add the EU28 line to the chart
            svg.append("path")
                .datum(processedEU28Data)
                .attr("class", "eu28-average-line") // Class for styling and identification
                .attr("fill", "none")
                .attr("stroke", "red") // Red color for the EU28 average line
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5")
                .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.value))
                );

                // Add dots for each year on the EU28 line
                svg.selectAll(".eu28-dot")
                .data(processedEU28Data)
                .enter()
                .append("circle")
                .attr("class", "eu28-dot")
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.value))
                .attr("r", 5) // Radius of the dots
                .attr("fill", "red")
                .attr("stroke", "#fff")
                .on("mouseover", function (d) {
                    d3.selectAll("path").attr("stroke", "#ccc");
                    d3.selectAll("circle").attr("fill", "#ccc");
    
                    // Highlight the current dot
                    d3.select(d3.event.currentTarget).attr("fill", "red");
                    d3.select(d3.event.currentTarget).attr("r", 6);
    
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 0.9);
                        tooltip.html(
                            "<span style='color: #333;'> <strong>State: </strong> " + "European Union" + "<br>" +
                            "<span style='color: #333;'> <strong>Year: </strong> " + d.date + " </span><br>" +
                            "<span style='color: #333;'> <strong>Average percentage: </strong> " + d.value + "%</span>"
                        )
                        
                        .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 120) + "px" : (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 90) + "px" : (d3.event.pageY + 5) + "px");
    
                })
                .on("mouseout", function (d) {
                    svg.selectAll(".chart-line").remove();
                    svg.selectAll(".chart-dot").remove();
                    svg.selectAll(".eu28-dot").remove();

                    drawEU28AverageLine();
                    svg.selectAll(".eu28-dot").attr("fill", "red");
    
                    countries.forEach(function(country, index) {
                        var countryDataProcessed = processDataForCountry(country);
            
                        addLineToChart(countryDataProcessed, country);
                        addDotsToChart(countryDataProcessed, country);
            
                        // Add the processed data to the allCountriesData array
                        allCountriesData.push({ country: country, data: countryDataProcessed });
                        
                    });
        
    
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });

                // Find the last data point for positioning the label
                const lastDataPoint = processedEU28Data[0];
            
                svg.append("text")
                    .attr("x", x(lastDataPoint.date) - 33) // Position slightly to the right of the last data point
                    .attr("y", y(lastDataPoint.value)) // Align with the last data point's value on the y-axis
                    .attr("dy", ".35em") // Center vertically
                    .attr("text-anchor", "start") // Ensure the text grows to the right
                    .style("fill", "red") // Match the line color
                    .style("font", "15px Montserrat")
                    .text("avg"); // The label text
        }
        drawEU28AverageLine();


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
                var value = countryData[year];
                if (value === ":" || isNaN(value)) {
                    value = 0;
                } else {
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
                .attr("class", "chart-line")
                .attr("fill", "none")
                .attr("stroke", countryMapping[country]["color"])
                .attr("stroke-width", 2)
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
            svg.append("g")
            .selectAll("dot")
            .attr("class", "chart-dot")
            .data(processedData)
            .enter()
            .append("circle")
                .attr("cx", function(d) { return x(d.date) } )
                .attr("cy", function(d) { return y(d.value) } )
                .attr("r", 6)
                .attr("fill", countryMapping[country]["color"])
                .attr("stroke", "#fff")

            .on("mouseover", function (d) {
                d3.selectAll("path:not(.eu28-average-line)").attr("stroke", "#ccc");
                d3.selectAll("circle:not(.eu28-dot)").attr("fill", "#ccc");

                // Highlight the current dot
                d3.select(this).attr("fill", countryMapping[country]["color"]);

                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0.9);
                    tooltip.html(
                        "<span style='color: #333;'> <strong>State: </strong> " + countryMapping[country]["name"] + "</span><br>" + 
                        "<span style='color: #333;'> <strong>Year: </strong> " + d.date + " </span><br>" +
                        "<span style='color: #333;'> <strong>Percentage: </strong> " + 
                        (d.value === 0 ? "Data not available" : d.value + "%") + "</span><br>"
                    )
                    
                    .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");

            })
            .on("mouseout", function (d) {
                svg.selectAll(".chart-line").remove();
                svg.selectAll(".chart-dot").remove();

                countries.forEach(function(country, index) {
                    var countryDataProcessed = processDataForCountry(country);
        
                    addLineToChart(countryDataProcessed, country);
                    addDotsToChart(countryDataProcessed, country);
        
                    allCountriesData.push({ country: country, data: countryDataProcessed });
                    
                });
    
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });
        }

        // Function to update the legend based on the selected years
        function updateLegend(allCountriesData) {
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

            addLineToChart(countryDataProcessed, country);
            addDotsToChart(countryDataProcessed, country);

            allCountriesData.push({ country: country, data: countryDataProcessed });
            
        });
        updateLegend(allCountriesData);
        
            
        // Add horizontal grid lines
        svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
            .tickSizeOuter(0) 
        );

        // Style the grid lines
        svg.selectAll(".grid line")
        .style("stroke", "#aaaaaa")  // Grey color
        .style("stroke-dasharray", "3 6")  // Dashed line
        .style("opacity", 0.9);  // Opacity 


    })
}