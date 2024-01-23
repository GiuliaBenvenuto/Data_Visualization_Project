// SMALL MULTIPLES BAR CHART
import { createXGrid, addTooltip } from "./utils.js";


const usedDeviceMapping = {
    "I_IUG_DKPC": "Desktop computer",
    "I_IUG_LPC": "Laptop computer",
    "I_IUG_MP": "Mobile phone",
    "I_IUG_OTH1": "Other",
    "I_IUG_TPC": "Tablet",
    "I_IUG_TV": "Smart TV",
}

// Chart dimensions
const width = 350; // Adjust the width for side-by-side charts
const height = 350; // Adjust the height for side-by-side charts
const margin = { top: 50, right: 0, bottom: 0, left: 150 };
  
  
// d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQWan1dg4-fZLQ-gM9V8AR6cBW1DumszVHmQOu51s4vWOuRdLUoB5TzdX_pgO_Kf_1dlsVoU9waEkO5/pub?output=csv", function(data) {
d3.csv('./csv/smallmultiple_processed.csv', function(data) {
    console.log("DATA SMALL MULTIPLE:", data);

    // Filter data for 'geo' value 'AL'
    const filteredData = data.filter(d => d.geo === 'AT');
    console.log("FILTERED DATA:", filteredData);

    // Unique 'indic_is' values for the y-axis
    // const usedDevice = [...new Set(filteredData.map(d => d.indic_is))];
    // not dynamic: 
    const usedDevice = [ "I_IUG_DKPC", "I_IUG_LPC", "I_IUG_MP", "I_IUG_OTH1", "I_IUG_TPC", "I_IUG_TV" ];
    console.log("REASONS:", usedDevice);

    // Define years as categories
    const categories = ['2016 ', '2018 ', '2021 ', '2023 '];
    console.log("CATEGORIES:", categories);

    // Find the maximum value across all categories
    const maxCategoryValue = d3.max(filteredData, d => {
        return d3.max(categories, category => +d[category]);
    });
    console.log("MAX CATEGORY VALUE:", maxCategoryValue);

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
        // Map data for the current category
        const categoryData = usedDevice.map(indicIs => {
            const value = filteredData.find(d => d.indic_is === indicIs)[category];
            return { indic_is: usedDeviceMapping[indicIs] || indicIs, value: +value };
        });
        console.log("CATEGORY DATA inside:", categoryData);

        // Scales
        const xScale = d3.scaleLinear()
          .domain([0, normalizedMax])
          .range([0, width - margin.left - margin.right]);

        const yScale = d3.scaleBand()
          .domain(categoryData.map(d => d.indic_is))
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
            .attr("y", d => yScale(d.indic_is)) // Check yScale mapping
            .attr("width", d => xScale(normalizeValue(d.value))) // Check xScale and normalization
            .attr("height", yScale.bandwidth()) // Ensure the height is set
            .attr("fill", d => colorScale(category)) // Check colorScale mapping
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0.9);
                tooltip.html(`<strong>Category:</strong> ${category}<br><strong>Indic_is:</strong> ${d.indic_is}<br><strong>Value:</strong> ${d.value}`) // Corrected to indic_is
                    .style("visibility", "visible")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        // X-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            // .call(d3.axisBottom(xScale))
            .selectAll("text")
            // .attr("transform", "translate(-5, 10)rotate(-45)")
            .style("font", "15px Montserrat")
            .style("text-anchor", "end");

            if (index === 0) {
                svg.append("g")
                    .attr("class", "y-axis")
                    .style("font", "15px Montserrat")
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
            .style("font", "25px Montserrat")
            .style("weight", "bold")
            .style("fill", "#14532d")
            .text(category);
        
    });

    
});