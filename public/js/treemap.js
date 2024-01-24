// Define the custom text for each name
var customTextMapping = {
    "H_XACC": "Too high access costs",
    "H_XEQU": "Too high equipment costs ",
    "H_XELSE": "Access elsewhere",
    "H_XNEED": "Not needed",
    "H_XSEC": "Privacy or security concerns",
    "H_XSKL": "Lack of skills",
    "H_XBBNA": "Broadband not available",
    "H_XWANT": "Not wanted",
    "H_XDIS": "Physical disability",
    "H_XOTH": "Other reasons"
};

var paletteColors = [
    "#3F51B5", // Indigo
    "#009688", // Teal
    "#FF7518", // Deep Orange
    "#8BC34A", // Light Green
    "#9C27B0", // Purple
    "#FFC107", // Amber
    "#03A9F4", // Light Blue
    "#7B3F00", // Brown
    "#FF3131", // Red
    "#FF69B4"  // Pink
];

  
// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 600 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_treemap")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Read data
// d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_hierarchy_1level.csv', function(data) {
d3.csv('./csv/treemap_processed.csv', function(data) {

    // Color scale
    var colorScale = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d.name; })) // Domain is set to the names
        .range(paletteColors); // Range is the pastel color palette

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
 
        
    // stratify the data: reformatting for d3.js
    var root = d3.stratify()
        .id(function(d) { return d.name; })   // Name of the entity (column name is name in csv)
        .parentId(function(d) { return d.parent; })   // Name of the parent (column name is parent in csv)
        (data);
    root.sum(function(d) { return +d.value })   // Compute the numeric value for each entity

    // Then d3.treemap computes the position of each element of the hierarchy
    // The coordinates are added to the root object above
    d3.treemap()
        .size([width, height])
        // space between rectangles
        .padding(8)
        (root)

    console.log(root.leaves())
    // use this information to add rectangles:
    svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      //.style("stroke", "black")
      // .style("stroke", "#293241") // Set the stroke color
      // .style("stroke-width", "5px") // Set the stroke width
      //.style("fill", "#69b3a2");
      .style("fill", function(d) { 
        return colorScale(d.data.name); // Fill with color based on the name
      })

      .on("mouseover", function(d) {      
    	tooltip.transition()        
      	   .duration(100)      
           .style("opacity", .9); 
           
           tooltip.html(
                "<span style='color: #333;'> <strong>Reason: </strong> " + customTextMapping[d.data.name] + "</span><br>" + 
                "<span style='color: #333;'> <strong>Value: </strong> " + d.value + "</span><br>" 
            )
            .style("left", (d3.event.pageX > window.innerWidth / 2) ? (d3.event.pageX - 180) + "px" : (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY > window.innerHeight / 2) ? (d3.event.pageY - 80) + "px" : (d3.event.pageY + 5) + "px");    
	    })   

      // fade out tooltip on mouse out               
      .on("mouseout", function(d) {       
          tooltip.transition()        
            .duration(100)      
            .style("opacity", 0);   
      });


      // Function to split text into chunks of two words
    function splitTextIntoChunks(text) {
        const words = text.split(' ');
        const chunks = [];
    
        for (let i = 0; i < words.length; i += 2) {
        chunks.push(words.slice(i, i + 2).join(' '));
        }
    
        return chunks;
    }

    

  /* and to add the text labels
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
      // .text(function(d){ return d.data.name})
      .text(function(d){ 
        // Use the mapping to get the custom text
        return customTextMapping[d.data.name] || d.data.name; // Fallback to name if no custom text found
      })
      .attr("font-size", "15px")
      .attr("fill", "white") */

    svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
        .attr("x", function(d){ return d.x0+5}) // Adjust starting x position
        .attr("y", function(d){ return d.y0+20}) // Adjust starting y position
        .each(function(d) {
        const textElement = d3.select(this);
        const labelText = customTextMapping[d.data.name] || d.data.name; // Get the label text
        const chunks = splitTextIntoChunks(labelText);

        chunks.forEach(function(chunk, index) {
            textElement.append("tspan")
            .attr("x", d.x0 + 5) // X position is same for all tspans
            .attr("dy", index ? "1.2em" : 0) // Add line spacing after the first line
            .text(chunk);
        });
        })
        .attr("font-family", "Montserrat")
        .attr("font-size", "16px")
        // .attr("font-weight", "bold")
        .attr("fill", "white");
})