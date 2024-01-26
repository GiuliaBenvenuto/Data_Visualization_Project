
  var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

  // The svg
  var svg = d3.select("#my_map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // Map and projection
  var path = d3.geoPath();
  var projection = d3.geoMercator()
    .center([13, 52])
    .scale(600)
    .translate([width / 2, height / 2]);



  /*
  var colorScale = d3.scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(d3.schemeBlues[7]); */

  var colorScale = d3.scaleLinear();
  colorScale.domain([0, 60])
  colorScale.range(['#bbf7d0', '#15803d']) 

  var populationData = {};

  var geoJsonUrl = "./json/europe.geojson"
  var csvUrl = "./csv/map_processed_2015.csv"

  // Load external data and boot
  d3.queue()
    .defer(d3.json, geoJsonUrl)
    .defer(d3.csv, csvUrl, function(d) {
        // Store population data with country code as key
        if(d.pop !== "") {
            populationData[d.code] = +d.pop;
        }
    })
    .await(ready);
    // .defer(d3.csv, csvUrl, function(d) { data.set(d.code, +d.pop); })

  console.log("DATA MAP", populationData)

  function ready(error, topo) {
  if (error) throw error;

  let mouseOver = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5);

    // Highlight the border of the hovered country
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black") // Ensure this is visible against the map
      .style("stroke-width", "2px"); // Adjust the width as needed
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
      .style("stroke", "none")
      .style("stroke-width", "0px");  // Reset the stroke width
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
    .html("<strong>Country: </strong>" + (d.properties.NAME) + "<br><strong>Percentage: </strong> " + 
    (d.total ? d.total + "%" : "No data")
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

  // Draw the map
  svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", function (d) {
          // Use ISO3 code from GeoJSON properties to get the population data
          d.total = populationData[d.properties.ISO3] || 0;
          return colorScale(d.total);
      })
      /*
        .attr("fill", function (d) {
            // Get population data
            d.total = populationData[d.id] || 0;
            return colorScale(d.total);
        })*/
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", 1)

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
    }