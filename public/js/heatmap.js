export function updateHeatmap(checkedValue) {
    console.log("SELECTED COUNTRY js:", checkedValue);

    const internetUseMapping = {
        "I_IHIF": "Health related information",
        "I_IUIF": "Information for goods and services",
        "I_IUBK": "Internet banking",
        "I_IUJOB": "Looking for job / sending job application",
        "I_IUVOTE": "Voting or online consultation",
        "I_IUOLC": "Online course",
        "I_IUSNET": "Participating in social networks",
        "I_IUSELL": "Selling goods or services",
        "I_IUEM": "Sending or receiving emails" 
    };

    const countryMapping = {
        "AL": "Albania",
        "AT": "Austria",
        "BA": "Bosnia and Herzegovina",
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
        "TR": "Turkey",
        "UK": "United Kingdom"
    }



    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 30, left: 320},
    width = 1300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    // d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv", function(data) {
    d3.csv('./csv/heatmap_processed.csv', function(data) {
        //console.log("DATA:", data);

        var myYears = ["2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"]
        //console.log("myYears:", myYears); 

        // var internetUse = ["I_IUEM", "I_IUSELL", "I_IUSNET", "I_IUOLC", "I_IUVOTE", "I_IUJOB", "I_IUBK", "I_IUIF", "I_IHIF"]
        var internetUse = ["I_IHIF", "I_IUIF", "I_IUBK", "I_IUJOB", "I_IUVOTE", "I_IUOLC", "I_IUSNET", "I_IUSELL", "I_IUEM"]
        //console.log("internetUse:", internetUse);


        // const filteredData = data.filter(d => d.geo === "AT");
        const filteredData = data.filter(d => d.geo === checkedValue);
        //console.log("filteredData:", filteredData);


        var heatmapData = [];
        filteredData.forEach((obj, index) => {
            for (let year in obj) {
                if (obj.hasOwnProperty(year) && year !== "geo" && year !== "indic_is") {
                    heatmapData.push({
                        year: year,
                        category: internetUseMapping[internetUse[index]] || internetUse[index],
                        value: +obj[year] // convert string to number
                    });
                }
            }
        });
        console.log("HEATMAP DATA:", heatmapData);


        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([0, width])  // width of your SVG
            .domain(heatmapData.map(function(d) { return d.year; }))
            .padding(0.01);


        svg.append("g")
        .style("font", "15px Montserrat")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()


        var internetUseLabels = internetUse.map(useKey => internetUseMapping[useKey] || useKey);

        var y = d3.scaleBand()
            .range([height, 0])
            .domain(internetUseLabels)
            .padding(0.01);
        
            
        svg.append("g")
            .style("font", "15px Montserrat")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove()

        /* Build color scale
        var myColor = d3.scaleSequential()
            .interpolator(d3.interpolateInferno)
            .domain([1,100]) */
        var myColor = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([0, d3.max(heatmapData, d => d.value)])
            


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

        // Striped pattern
        svg.append("defs")
        .append("pattern")
            .attr("id", "stripes")
            .attr("width", 4)
            .attr("height", 4)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("patternTransform", "rotate(45)")
        .append("rect")
            .attr("width", 2)
            .attr("height", 4)
            .attr("transform", "translate(0,0)")
            .attr("fill", "#ccc"); // Color of the stripes

        svg.selectAll()
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.year); })
        .attr("y", function(d) { return y(d.category); })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        //.style("fill", function(d) { return myColor(d.value); })
        .style("fill", function(d) {
            // Check if the value is 0 and apply the stripes pattern
            if (d.value === 0) {
                return "url(#stripes)";
            } else {
                return myColor(d.value);
            }
        })
        .style("stroke-width", 2)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "#0e284e"); // Add border on hover

            tooltip.transition()
                .duration(100)
                .style("opacity", 0.9);
            tooltip.html(
                    
                    `
                    <strong>State:</strong> ${countryMapping[checkedValue]} <br>
                    <strong>Percentage:</strong> ${d.value ? `${d.value}%` : "No data available"} 
                    
                    `
                ) // Corrected to indic_is
                .style("visibility", "visible")
                .style("font", "15px Montserrat")
                .style("color", "#333")
                .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 90) + "px" : (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 90) + "px" : (d3.event.pageY + 5) + "px");
        })
        .on("mousemove", function(d) {
            d3.selectAll("rect").style("stroke", "none"); // First remove all borders
            d3.select(this).style("stroke", "#0e284e"); // Then add border to the current rect

            tooltip
            .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 90) + "px" : (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 90) + "px" : (d3.event.pageY + 5) + "px");
        })  
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", "none");

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })
    })
}
