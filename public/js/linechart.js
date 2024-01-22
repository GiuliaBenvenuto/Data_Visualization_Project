export function updateLinechart(checkedValues) {

    const countryMapping = {
        "AL": "Albania",
        "AT": "Austria",
        "BE": "Belgium",
        "BG": "Bulgaria",
        "CY": "Cyprus",
        "CZ": "Czechia",
        "DE": "Germany",
        "DK": "Denmark",
        "EE": "Estonia",
        "EL": "Greece",
        "ES": "Spain",
        "EU28": "European Union",
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
        "ME": "Montenegro",
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
        "TR": "Türkiye",
        "UK": "United Kingdom",
        "XK": "Kosovo*"
    };
    

    let countries = checkedValues;
    // console.log("Checked Countries: " + countries);

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
                return { date: year, value: +countryData[year] };
            });
        }

        // Function to add a line to the chart
        function addLineToChart(processedData, color) {
            // console.log("Processed Data:", processedData);
            svg.append("path")
                .datum(processedData)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(d.value); })
                );
        }

        // Function to add a dots to the chart
        function addDotsToChart(processedData, color, country) {
            console.log("Processed Data:", processedData);
            svg.append("g")
            .selectAll("dot")
            .data(processedData)
            .enter()
            .append("circle")
                .attr("cx", function(d) { return x(d.date) } )
                .attr("cy", function(d) { return y(d.value) } )
                .attr("r", 4)
                .attr("fill", color)
                .attr("stroke", "#fff")

            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0.9);
                tooltip.html(
                    "<span style='color: #333;'> <strong>State: </strong> " + countryMapping[country] + "</span><br>" + 
                    "<span style='color: #333;'> <strong>Percentage: </strong> " + d.value + "%</span><br>"
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

        // Iterate over each country and add a line for each
        countries.forEach(function(country, index) {
            var countryDataProcessed = processDataForCountry(country);
            // console.log("Country Data Processed:", countryDataProcessed);

            // Assign a unique color for each line
            var color = d3.schemeCategory10[index % 10]; // Change or expand this for more than 10 countries

            addLineToChart(countryDataProcessed, color);
            addDotsToChart(countryDataProcessed, color, country);
        });
            
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