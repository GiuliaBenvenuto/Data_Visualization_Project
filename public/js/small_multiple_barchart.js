// SMALL MULTIPLES BAR CHART
import { createXGrid, addTooltip } from "./utils.js";
// Chart dimensions
const width = 345; // Adjust the width for side-by-side charts
const height = 450; // Adjust the height for side-by-side charts
const margin = { top: 50, right: 10, bottom: 80, left: 90 };
  
  
  d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQWan1dg4-fZLQ-gM9V8AR6cBW1DumszVHmQOu51s4vWOuRdLUoB5TzdX_pgO_Kf_1dlsVoU9waEkO5/pub?output=csv", function(data) {

    const categories = data.columns.slice(1);
    // Find the maximum value across all categories
    
    const maxCategoryValue = d3.max(data, d => {
      return d3.max(categories, category => +d[category]);
    });

    // Normalize the maximum value to 100
    const normalizedMax = 100;  

    categories.forEach((category, index) => {

        const svg = d3.select("#my_multiple_barchart")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .style("display", "inline-block") // Display charts side by side
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        // Filter the data for the current category
        const categoryData = data.map(d => ({ city: d.city, value: +d[category] }));

        // Scales
        const xScale = d3.scaleLinear()
          .domain([0, normalizedMax])
          .range([0, width - margin.left - margin.right]);

        const yScale = d3.scaleBand()
            .domain(categoryData.map(d => d.city))
            .range([0, height - margin.top - margin.bottom])
            .padding(0.1);

       //add grid
       /*
       svg.selectAll("xGrid")
       .data(xScale.ticks(12)) // You can change the number of ticks as per your preference
       .enter()
       .append("line")
       .attr("x1", function (d) { return xScale(d); })
       .attr("x2", function (d) { return xScale(d); })
       .attr("y1", 0)
       .attr("y2", height - margin.top - margin.bottom)
       .attr("stroke", "lightgray") // Adjust the color as needed
       .attr("stroke-dasharray", "4"); // You can adjust the dash pattern if desired
       */
      
       createXGrid(svg, xScale, height - margin.top - margin.bottom, 12, "lightgray", "4");

        // Tooltip
        var tooltip = addTooltip(d3.select('body'));

        const colorScale = d3.scaleOrdinal()
          .domain(["Acer_Platanoides", "Lagerstroemia_Indica", "Platanus_Acerifolia", "Other"])
          .range(['#14532d','#15803d','#22c55e', '#86efac']);
            
        // Function to normalize values to the range [0, 100]
        const normalizeValue = value => (value / maxCategoryValue) * normalizedMax;

        // Draw bars for each category
        // Draw bars for the current category
        svg.selectAll("rect")
            .data(categoryData)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => yScale(d.city))
            //.attr("width", d => xScale(d.value))
            .attr("width", d => xScale(normalizeValue(d.value)))
            .attr("height", yScale.bandwidth())
            //.attr("fill", "steelblue")
            .attr("fill", d => colorScale(category))
            .on("mouseover", function(d) {
                tooltip.transition()
                  .duration(100)
                  .style("opacity", 0.9);
                  tooltip.html(`<strong>Category:</strong> ${category}<br><strong>City:</strong> ${d.city}<br><strong>Value:</strong> ${d.value}`)
                  .style("visibility", "visible")
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY - 30) + "px");
              })
              .on("mouseout", function(d) {
                tooltip.transition()
                  .duration(200)
                  .style("opacity", 0);
              })

        // X-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            // .call(d3.axisBottom(xScale))
            .selectAll("text")
            // .attr("transform", "translate(-5, 10)rotate(-45)")
            .style("font", "12px Fira Sans")
            .style("text-anchor", "end");

            if (index === 0) {
                svg.append("g")
                    .attr("class", "y-axis")
                    .style("font", "12px Fira Sans")
                    .call(d3.axisLeft(yScale));
            } else {
                svg.append("g")
                    .attr("class", "y-axis")
                    .call(d3.axisLeft(yScale).tickFormat(""));
            }

        // Category label
        svg.append("text")
            .attr("x", 140)
            .attr("y", -20) // Position above the chart
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .style("fill", "#14532d")
            .text(category);
        
    });
});