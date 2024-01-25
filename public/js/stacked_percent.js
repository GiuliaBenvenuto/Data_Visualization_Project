export function updateStacked(checkedValue) {
    // console.log("Checked value:", checkedValue);

    const countryMapping = {
        "AL": "Albania",
        "AT": "Austria",
        "BA": "Bosnia and Herzegovina",
        "BE": "Belgium",
        "BG": "Bulgaria",
        "CH": "Switzerland",
        "CY": "Cyprus",
        "CZ": "Czech Republic",
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
        "UK": "United Kingdom"
    };


    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 50, bottom: 40, left: 50},
        width = 1100 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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


        // Assuming 'data' is your dataset
        var subgroups = ['value', 'remaining'];
        var groups = d3.range(2012, 2024); // years from 2012 to 2023

        // Filtering data where 'geo' is 'AT'
        // Filtering data where 'geo' is 'AT'
        var filteredData = data.filter(function(row) {
            // return row['geo'] === 'AT';
            return row['geo'] === checkedValue;
        })[0];
        //console.log("Filtered data for checked value:", filteredData);

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        // var groups = d3.map(data, function(d){return(d.group)}).keys()

        // Add X axis
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style("font", "15px Montserrat")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
        svg.append("g")
            .style("font", "15px Montserrat")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#75c359','#ea5d55'])

        //Add grid
        svg.selectAll("yGrid")
            .data(y.ticks(10))
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", function(d) { return y(d); })
            .attr("y2", function(d) { return y(d); })
            .attr("stroke", "#aaaaaa")
            .attr("stroke-dasharray", 4);



        var transformedData = [];
        var years = d3.range(2012, 2024);

        years.forEach(function(year) {
            var valueStr = filteredData[year]; // Get the value as string
            var value = parseFloat(valueStr); // Attempt to parse it as a float
            if (!isNaN(value)) { // Check if the parsed value is not NaN
                transformedData.push({
                    year: year,
                    value: value,
                    remaining: 100 - value // Calculate the remaining part
                });
            }
        });

        // console.log("Transformed Data:", transformedData);


        var stackedData = d3.stack()
        .keys(subgroups)
        (transformedData);

        // Visualization code (assuming x, y, color, and svg are already defined)
        svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) {
                return x(d.data.year) + x.bandwidth() * 0.1; // Shift the bar right to center it
            })
            .attr("width", x.bandwidth() * 0.8) // Shrink the width of the bar by 20%
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
    
    })
}