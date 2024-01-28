const internetUseMapping = {
    "I_IHIF": { text: "Health information", color: "#E6194B" }, // Red
    "I_IUIF": { text: "Information for goods and services", color: "#3CB44B" }, // Green
    "I_IUBK": { text: "Internet banking", color: "#FFE119" }, // Yellow
    "I_IUJOB": { text: "Looking for job / job application", color: "#4363D8" }, // Blue
    "I_IUVOTE": { text: "Voting or online consultation", color: "#F58231" }, // Orange
    "I_IUOLC": { text: "Online course", color: "#911EB4" }, // Purple
    "I_IUSNET": { text: "Social networks", color: "#46F0F0" }, // Cyan
    "I_IUSELL": { text: "Selling goods or services", color: "#F032E6" }, // Magenta
    "I_IUEM": { text: "Sending or receiving emails", color: "#BCF60C" } // Lime
};



// set the dimensions and margins of the graph
var width = 700
var height = 400
var margin = 30

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
var svg = d3.select("#my_piechart_right")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv('./csv/heatmap_processed.csv', function(data) {

    var year = "2023";
    console.log("Original DATA:", data);

    // Filter data to keep only the 2013 column
    var filteredYearData = data.map(function(row) {
        return {
            '2023': row[year], // Keep only the 2013 data
            'indic_is': row['indic_is'], // Assuming you want to keep this as well
            'geo': row['geo'] // Assuming you want to keep this as well
        };
    });

    console.log("Filtered DATA for 2023:", filteredYearData);

    var state = "AT";
    var filteredStateData = filteredYearData.filter(d => d.geo === state);
    console.log("Filtered DATA for 2023 and AT:", filteredStateData);


    // Assuming 'filteredStateData' is your filtered dataset for 2013 and AT
    var data = filteredStateData;

    // Sort the data by the '2013' values in descending order and take the top 5
    var top5Data = data.sort(function(a, b) {
        return b['2023'] - a['2023']; // Sort in descending order
    }).slice(0, 5); // Take the top 5
    console.log("Top 5 DATA for 2023 and AT:", top5Data);

    // Set the color scale
    var color = d3.scaleOrdinal()
        .domain(top5Data.map(function(d) { return d.indic_is; })) // Use 'indic_is' for the domain
        .range(d3.schemeSet2);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .value(function(d) { return d['2023']; }); // Use the '2013' property for values

    var data_ready = pie(top5Data); // Use top5Data here

    // Shape helper to build arcs:
    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);


    // Build the pie chart for the top 5 values
    svg.selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    // .attr('fill', function(d){ return color(d.data.indic_is); }) // Use 'indic_is' to set fill color
    .attr('fill', function(d){ return internetUseMapping[d.data.indic_is].color; }) 
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

    // Add lines connecting the labels to the slices
    svg.selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('polyline')
    .attr('points', function(d) {
        var posA = arcGenerator.centroid(d) // line insertion in the slice
        var posB = arcGenerator.centroid(d) // line break: we use the same points to add a break in the line
        var posC = arcGenerator.centroid(d); // Label position
        var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2 // Position the label on the left or right depending on the angle
        posC[0] = radius * 1 * (midAngle < Math.PI ? 1 : -1);
        return [posA, posB, posC]
    })
    .attr('stroke', 'black')
    .style('fill', 'none')
    .attr('stroke-width', 1);

    // Now add the labels at the end of the lines
    svg.selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('text')
    .attr('transform', function(d) {
        var pos = arcGenerator.centroid(d);
        var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 1.02 * (midAngle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
        var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midAngle < Math.PI ? 'start' : 'end');
    })
    .style("font", "15px Montserrat")
    .each(function(d) {
        // var text = internetUseMapping[d.data.indic_is];
        var text = internetUseMapping[d.data.indic_is].text;
        var words = text.split(' ');
        var tspan = d3.select(this).append('tspan')
            .attr('x', '0')
            .attr('dy', '0.2em');

        for (var i = 0; i < words.length; i++) {
            if (i > 0 && i % 3 === 0) { // Every three words, append a new tspan
                tspan = d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('dy', '1.2em');
            }
            tspan.text(function() { return tspan.text() + ' ' + words[i]; });
        }
    })


    var totalValue = d3.sum(top5Data, function(d) { return d['2023']; });
    svg.selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('text')
    .text(function(d) {
        // Calculate percentage
        var percentage = (d.data['2023'] / totalValue * 100).toFixed(2); // One decimal place
        return percentage + '%'; // Return the percentage text
    })
    .attr('transform', function(d) {
        var centroid = arcGenerator.centroid(d);
        // Move the label slightly upwards from the centroid
        return 'translate(' + centroid[0] + ',' + (centroid[1] - 10) + ')'; // Adjust the '10' as needed
    })
    .style('text-anchor', 'middle')
    .style('font', '15px Montserrat')
    .attr('fill', '#333'); // Text color

    



})