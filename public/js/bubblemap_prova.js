
export function updateBubbleMap(selectedYear) {
    // console.log("SELECTED YEAR js:", year);

    // var csvUrl = "./csv/map_processed_" + year + ".csv"
    var csvUrl = "./csv/bubblemap_processed.csv"
    var geoJsonUrl = "./json/europe.geojson"
    //console.log("CSV URL:", csvUrl);
    // var csvUrl = "./csv/map_processed_2015.csv"

    // Select the chart container and clear its content
    var mapContainer = d3.select("#my_bubblemap");
    mapContainer.selectAll("*").remove(); 

    // Fixed values
    var year = selectedYear;
    var internetUseKey = "I_IHIF";


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


    // var colorScale = d3.scaleSequential(d3.interpolateRdBu)
    var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([0, 65]);
    
      // MAX 2015: 55.89
      // MAX 2016: 54.15
      // MAX 2017: 58.31
      // MAX 2019: 61.57

      // LEGEND
      var legendWidth = 90;
      var legendSpacing = 25;
      var legendX = margin.left - legendWidth; // Adjust the X position as needed
      var legendY = margin.top - 400; // Adjust the Y position as needed

      // Create a group for the legend
      var legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");

      // Data for legend items (5 items)
      var legendData = [
        { color: colorScale(0), label: "0% - 13%" },
        { color: colorScale(13), label: "14% - 26%" },
        { color: colorScale(26), label: "27% - 39%" },
        { color: colorScale(39), label: "40% - 52%" },
        { color: colorScale(65), label: "53% - 65%" }, 
        { color: "url(#stripes)", label: "No data" }
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

        console.log("DATA MAP", data)

        // Assuming `data` is an array of objects where each object represents a row from the CSV
        var filteredData = data.filter(function(d) {
            // Check only for "I_IHIF" and include all rows, regardless of the 2013 value
            return d["indic_is"] === "I_IHIF";
        }).map(function(d) {
            // Return a new object containing only the year 2013, code, and geo fields
            return {
                year: selectedYear,
                value: d[selectedYear], // This can be null
                code: d["code"],
                geo: d["geo"]
            };
        });
        console.log("Filtered Data:", filteredData);



    
        let mouseOver = function(d) {
            d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .5);

            // Highlight the border of the hovered country
            d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1.5)
            .style("stroke", "black") // Ensure this is visible against the map
            .style("stroke-width", "1.5px"); // Adjust the width as needed
        }

        let mouseLeave = function(d) {
            d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8);

            // Reset the border of the hovered country
            d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "black")
            .style("stroke-width", "1px");  // Reset the stroke width
        }

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

        // Function to show the tooltip
        function showTooltip(d) {
            tooltip
            .transition()
            .duration(100)
            .style("opacity", 0.9);
            tooltip
            .html(
            "<strong>State: </strong>" + (d.properties.NAME) + "<br>"+
            "<strong>Year: </strong>" + year + "<br>"+
            "<strong>Percentage: </strong> " + (d.total ? d.total + "%" : "No data")
            )

            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        }

        // Function to move the tooltip
        function moveTooltip(d) {
            tooltip
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        }

        // Function to hide the tooltip
        function hideTooltip(d) {
            tooltip
            .transition()
            .duration(100)
            .style("opacity", 0);
        }

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

        svg.selectAll(".Country")
        .on("mouseover", function(d) {
          mouseOver.call(this, d);
          showTooltip(d);
        })
        .on("mousemove", moveTooltip)
        .on("mouseleave", function(d) {
          mouseLeave.call(this, d);
          hideTooltip(d);
        });


        // Use an exponential scale for the bubble sizes
        var size = d3.scalePow()
            .exponent(2) // Adjust the exponent as needed to make differences more visible
            //.domain([minValue, maxValue]) // Set the domain dynamically based on the data
            .domain([25, 85])
            .range([5, 50]);


        console.log("SIZE", size)

        // Process GeoJSON data to calculate centroids
        var centroids = topo.features.map(function(feature) {
            var centroid = d3.geoPath().centroid(feature);
            return {
            code: feature.properties.ISO3, // Assuming each feature has a 'code' property
            centroid: projection(centroid)
            };
        });
        // console.log("CENTROIDS", centroids)

        // Create a map from `filteredData` for quick lookup based on 'code'
        var dataMap = filteredData.reduce(function(map, obj) {
            map[obj.code] = obj.value; // Use 'value' for the year 2013 data
            return map;
        }, {});
        console.log("DATA MAP", dataMap)

        // Add the bubbles
        centroids.forEach(function(centroid) {
            var value = dataMap[centroid.code]; // Lookup the value for 2013 based on 'code'
            if (value > 0 && !isNaN(value)) { // Check if there's data for this 'code'
                // console.log("CENTROID", centroid.centroid[0], centroid.centroid[1])
                svg.append("circle")
                    .attr("cx", centroid.centroid[0])
                    .attr("cy", centroid.centroid[1])
                    .attr("r", size(value)) // Use 'size' function to determine the radius based on the 2013 value
                    .style("fill", "rgba(0, 0, 255, 0.6)")
                    .attr("stroke", "rgba(0, 0, 0, 0.2)")
                    .attr("stroke-width", 1)
                    .attr("class", "bubble")
                    .on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html("State: " + dataMap[centroid.code] + "<br/>" + "Value: " + value)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    // Mouseout event
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            }


  });

    }
}