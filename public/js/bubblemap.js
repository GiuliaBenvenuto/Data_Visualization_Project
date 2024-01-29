
export function updateBubbleMap(use, selectedYear) {
    console.log("SELECTED USE js:", use);
    // console.log("SELECTED YEAR js:", year);

    /*
    const internetUseMapping = {
      "I_IHIF": "Health information",
      "I_IUIF": "Information for goods and services",
      "I_IUBK": "Internet banking",
      "I_IUJOB": "Looking for job / job application",
      "I_IUVOTE": "Voting or online consultation",
      "I_IUOLC": "Online course",
      "I_IUSNET": "Social networks",
      "I_IUSELL": "Selling goods or services",
      "I_IUEM": "Sending or receiving emails" 
    };*/

    const internetUseMapping = {
      "I_IHIF": { text: "Health information", color: "#53b5ce" }, // Azzurro
      "I_IUIF": { text: "Information for goods and services", color: "#75c359" }, //green
      "I_IUBK": { text: "Internet banking", color: "#ff69b4" }, // Pink
      "I_IUJOB": { text: "Looking for job / job application", color: "#9c27b0 " }, // Purple
      "I_IUVOTE": { text: "Voting or online consultation", color: "#255be3" }, // Blue
      "I_IUOLC": { text: "Online course", color: "#547a2a " }, // Dark Verde
      "I_IUSNET": { text: "Social networks", color: "#ff6700 " }, // Arancione
      "I_IUSELL": { text: "Selling goods or services", color: "#ffe505" }, // Yellow
      "I_IUEM": { text: "Sending or receiving emails", color: "#ff0000" } // Red
    };

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
  }

    var csvUrl = "./csv/bubblemap_processed.csv"
    var geoJsonUrl = "./json/europe.geojson"


    // Select the chart container and clear its content
    var mapContainer = d3.select("#my_bubblemap");
    mapContainer.selectAll("*").remove(); 

    // Fixed values
    var year = selectedYear;
    var internetUseKey = use;


    var margin = {top: 200, right: 50, bottom: 50, left: 50},
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    // The svg
    var svg = d3.select("#my_bubblemap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Map and projection
    var projection = d3.geoMercator()
      .center([13, 52])
      .scale(600)
      .translate([width / 2, height / 2]);
  

      // LEGEND
      var legendWidth = 90;
      var legendSpacing = 25;
      var legendX = margin.left - legendWidth; // Adjust the X position as needed
      var legendY = margin.top - 350; // Adjust the Y position as needed

      // Create a group for the legend
      var legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");

      // Data for legend items (5 items)
      var legendData = [
        { color: internetUseMapping[internetUseKey].color, label: internetUseMapping[internetUseKey].text },
      ];

      // Create legend items
      var legendItems = legendGroup.selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function (d, i) {
          return "translate(0," + (i * legendSpacing) + ")";
        });

      // Add colored squares
      legendItems
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) { return d.color; })
        .style("stroke", "#293241") // Add a black border
        .style("stroke-width", 1);

      // Add labels
      legendItems
        .append("text")
        .attr("x", 25)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("color", "#293241")
        .style("font", "18px Montserrat")
        .text(function (d) { return d.label; });



    // Load external data
    d3.queue()
    .defer(d3.json, geoJsonUrl)
    .defer(d3.csv, csvUrl)
    .await(ready);

    // console.log("DATA MAP", populationData)

    function ready(error, topo, data) {
        if (error) throw error;

        // Assuming `data` is an array of objects where each object represents a row from the CSV
        var filteredData = data.filter(function(d) {
            // Check only for "I_IHIF" and include all rows, regardless of the 2013 value
            return d["indic_is"] === use;
        }).map(function(d) {
            // Return a new object containing only the year 2013, code, and geo fields
            return {
                year: selectedYear,
                value: d[selectedYear], // This can be null
                code: d["code"],
                geo: d["geo"],
                state: countryMapping[d["geo"]]
            };
        });
        //console.log("Filtered Data:", filteredData);


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


      // Define the striped pattern inside your SVG
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
        .attr("fill", "white"); // Color of the stripes


      // Draw the map
        svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
            .attr("fill", "#b8b8b8") // Default fill color for countries
            .attr("d", d3.geoPath().projection(projection))
            .style("stroke", "black")
            .attr("class", function(d){ return "Country"; })
            .style("opacity", .3);



        // Use an exponential scale for the bubble sizes
        var size = d3.scalePow()
            .exponent(2) // Adjust the exponent as needed to make differences more visible
            //.domain([minValue, maxValue]) // Set the domain dynamically based on the data
            .domain([1, 100])
            .range([5, 50]);


        //console.log("SIZE", size)

        // Process GeoJSON data to calculate centroids
        var centroids = topo.features.map(function(feature) {
          var centroid = d3.geoPath().centroid(feature);
      
          // Check if the feature is Norway
          if (feature.properties.ISO3 === "NOR") {
              // Adjust the centroid by moving it 'down' (increase y-coordinate)
              centroid[1] += -3; // 'adjustmentValue' is the amount by which you want to move the centroid down
              centroid[0] += -5; // 
          }
          return {
              code: feature.properties.ISO3,
              name: feature.properties.NAME,
              centroid: projection(centroid)
          };
        });
      
        //console.log("CENTROIDS", centroids, centroids.name)

        // Create a map from `filteredData` for quick lookup based on 'code'
        var dataMap = filteredData.reduce(function(map, obj) {
            map[obj.code] = obj.value; // Use 'value' for the year 2013 data
            return map;
        }, {});
        //console.log("DATA MAP", dataMap)

        // Add the bubbles
        centroids.forEach(function(centroid) {
            var value = dataMap[centroid.code]; // Lookup the value for 2013 based on 'code'
            if (value > 0 && !isNaN(value)) { // Check if there's data for this 'code'
                // console.log("CENTROID", centroid.centroid[0], centroid.centroid[1])
                svg.append("circle")
                    .attr("cx", centroid.centroid[0])
                    .attr("cy", centroid.centroid[1])
                    .attr("r", size(value)) // Use 'size' function to determine the radius based on the 2013 value
                    // .style("fill", "rgba(0, 0, 255, 0.6)")
                    .style("fill", internetUseMapping[internetUseKey].color)
                    .style("opacity", 0.7)
                    .attr("stroke", "rgba(0, 0, 0, 0.2)")
                    .attr("stroke-width", 1)
                    .attr("class", "bubble")
                    .on("mouseover", function(d) { // Updated to use 'event' and 'd'
                      svg.selectAll(".bubble")
                      .transition()
                      .duration(200)
                      .style("opacity", 0.2);

                      d3.select(this)
                      .transition()
                      .duration(200)
                      .style("opacity", 0.7);

                      tooltip.transition()
                          .duration(200)
                          .style("opacity", .9);
                      tooltip.html(
                        `
                        <strong>State:</strong> ${centroid.name} <br>
                        <strong>Year:</strong> ${selectedYear} <br>
                        <strong>Percentage:</strong> ${value}% <br>
                        <strong>Use:</strong> ${internetUseMapping[internetUseKey].text }
                        `
                      )
                      .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 90) + "px" : (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 110) + "px" : (d3.event.pageY + 5) + "px");
                    })
                    .on("mousemove", function(d) {
                      svg.selectAll(".bubble")
                      .transition()
                      .duration(200)
                      .style("opacity", 0.2);

                      d3.select(this)
                      .transition()
                      .duration(200)
                      .style("opacity", 0.7);

          
                      tooltip
                      .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 90) + "px" : (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 110) + "px" : (d3.event.pageY + 5) + "px");
                    }) 
                    // Mouseout event
                    .on("mouseout", function(event, d) { // Updated to use 'event' and 'd'
                      svg.selectAll(".bubble")
                      .transition()
                      .duration(200)
                      .style("opacity", 0.7);

                      tooltip.transition()
                          .duration(500)
                          .style("opacity", 0);
                    });
            }


  });

    }
}