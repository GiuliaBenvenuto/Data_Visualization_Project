console.log("map.js loaded");

var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var svg = d3.select("#my_map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let europeProjection = d3.geoMercator()
    .center([13, 52])
    .scale(600)
    .translate([width / 2, height / 2]);

// The path generator uses the projection to convert the GeoJSON
// geometry to a set of coordinates that D3 can understand
let pathGenerator = null

// URL to the GeoJSON itself
let geoJsonUrl = ''


pathGenerator = d3.geoPath().projection(europeProjection)
geoJsonUrl = "./json/europe.json"

// Request the GeoJSON
// d3.json(geoJsonUrl).then(geojson => {
d3.json(geoJsonUrl, function(geojson) {
    // Tell D3 to render a path for each GeoJSON feature
    svg.selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator) // This is where the magic happens
      .attr("stroke", "grey") // Color of the lines themselves
      .attr("fill", "white") // Color uses to fill in the lines
  })

