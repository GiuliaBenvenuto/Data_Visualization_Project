export function updateSmallMultiple(checkedValue) {
    // console.log("CHECKED VALUES smb:", checkedValue);

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
        "UK": "United Kingdom",
        "XK": "Kosovo"
    }
    

    const usedDeviceMapping = {
        "I_IUG_DKPC": "Desktop computer",
        "I_IUG_LPC": "Laptop computer",
        "I_IUG_MP": "Mobile phone",
        "I_IUG_OTH1": "Other",
        "I_IUG_TPC": "Tablet",
        "I_IUG_TV": "Smart TV",
    }

    // Chart dimensions
    const width = 300; // Adjust the width for side-by-side charts
    const height = 350; // Adjust the height for side-by-side charts
    const margin = { top: 50, right:0, bottom: 0, left: 5 };
    
    
    // d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQWan1dg4-fZLQ-gM9V8AR6cBW1DumszVHmQOu51s4vWOuRdLUoB5TzdX_pgO_Kf_1dlsVoU9waEkO5/pub?output=csv", function(data) {
    d3.csv('./csv/smallmultiple_processed.csv', function(data) {

        // Filter data for 'geo' value 'AL'
        // const filteredData = data.filter(d => d.geo === 'AT');
        const filteredData = data.filter(d => d.geo === checkedValue);

        // Unique 'indic_is' values for the y-axis
        // const usedDevice = [...new Set(filteredData.map(d => d.indic_is))];
        // not dynamic: 
        const usedDevice = [ "I_IUG_DKPC", "I_IUG_LPC", "I_IUG_MP", "I_IUG_OTH1", "I_IUG_TPC", "I_IUG_TV" ];

        // Define years as categories
        const categories = ['2016 ', '2018 ', '2021 ', '2023 '];

        // Find the maximum value across all categories
        const maxCategoryValue = d3.max(filteredData, d => {
            return d3.max(categories, category => +d[category]);
        });

        // Normalize the maximum value to 100
        const normalizedMax = 100;  

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

        

        categories.forEach((category, index) => {

            const padding = {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            };

            const svgContainer = d3.select("#my_multiple_barchart")
            .append("div") // Wrap the SVG in a div for easier margin handling
            .style("display", "inline-block") // Display divs side by side
            .style("margin-right", index < categories.length - 1 ? "30px" : "0px"); // Add margin to the right of each div except the last one

            const svg = svgContainer
                .append("svg")
                .attr("width", width + padding.left + padding.right) // Increase the width to account for padding
                .attr("height", height + padding.top + padding.bottom) // Increase the height to account for padding
                //.style("border", "1px solid red")
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Filter the data for the current category
            // Map data for the current category
            const categoryData = usedDevice.map(indicIs => {
                const value = filteredData.find(d => d.indic_is === indicIs)[category];
                return { indic_is: usedDeviceMapping[indicIs] || indicIs, value: +value };
            });
            //console.log("CATEGORY DATA inside:", categoryData);

            // Scales
            const xScale = d3.scaleLinear()
            .domain([0, normalizedMax])
            .range([0, width - margin.left - margin.right]);

            const yScale = d3.scaleBand()
            .domain(categoryData.map(d => d.indic_is))
            .range([0, height - margin.top - margin.bottom])
            .padding(0.1);

            
        // Xgrid
            svg.selectAll("xGrid")
                .data(xScale.ticks(12)) // You can change the number of ticks as per your preference
                .enter()
                .append("line")
                .attr("x1", function (d) { return xScale(d); })
                .attr("x2", function (d) { return xScale(d); })
                .attr("y1", 0)
                .attr("y2", height - margin.top - margin.bottom)
                .attr("stroke", "lightgray") // Adjust the color as needed
                .attr("stroke-dasharray", 4); // You can adjust the dash pattern if desired


            const colorScale = d3.scaleOrdinal()
            .domain(categories)
            //.range(['#14532d','#15803d','#22c55e', '#86efac']);
            // .range(['#F04C43', '#FAAF19', '#58ba35', '#2EA8C7']);
            .range(['#ea3a30', '#ff9908', '#58ba35', '#2EA8C7']);
            
                
            // Function to normalize values to the range [0, 100]
            const normalizeValue = value => (value / maxCategoryValue) * normalizedMax;

            // Draw bars for each category
                svg.selectAll("rect")
                .data(categoryData)
                .enter()
                .append("rect")
                .attr("y", d => yScale(d.indic_is))
                .attr("width", 0) // start width from 0 for transition
                .attr("height", yScale.bandwidth())
                .attr("rx", 5) // rounded corners
                .attr("ry", 5) // rounded corners
                .attr("fill", d => colorScale(category))
                .on("mouseover", function(d) {
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 0.9);
                    tooltip.html(
                            `
                            <strong>State:</strong> ${countryMapping[checkedValue]}<br> 
                            <strong>Percentage:</strong> ${d.value} % <br>
                            <strong>Device:</strong> ${d.indic_is}<br>
                            <strong>Year:</strong> ${category}
                            `
                        ) // Corrected to indic_is
                        .style("visibility", "visible")
                        .style("font", "15px Montserrat")
                        .style("color", "#333")
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY - 30) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                })
                .transition() // adding a transition
                .duration(800)
                .attr("width", d => xScale(normalizeValue(d.value))) // transition to the actual width
                .attr("fill-opacity", 0.8); // slightly transparent for a more pleasant effect
            
            // Adding text labels on bars
            svg.selectAll(".bar-text")
                .data(categoryData)
                .enter()
                .append("text")
                .attr("class", "bar-text")
                .text(d => `${d.value}%`)
                // .attr("x", d => xScale(normalizeValue(d.value)) - 45) // position to the right of the bar
                .attr("x", d => {
                    // Check if the value is NaN
                    if (isNaN(d.value)) {
                        // Move the label to the right if the value is NaN
                        return xScale(0) + 5; // You can adjust the 10 to whatever number works best
                    } else if (d.value < 15) {
                        return xScale(normalizeValue(d.value)) + 5;
                    } else {
                        // Otherwise, position the label to the left inside the bar
                        return xScale(normalizeValue(d.value)) - 48;
                    }
                })
                .attr("y", d => yScale(d.indic_is) + yScale.bandwidth() / 2 + 4) // center vertically in bar
                .attr("fill", "#333")
                .style("font", "12px Montserrat")
                .style("visibility", "hidden") // hide by default
                .transition() // add transition for the text as well
                .duration(800)
                .style("visibility", "visible"); // make visible after the bars have been drawn
            

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
                .attr("y", -20) 
                .style("text-anchor", "middle")
                .style("font", "25px Montserrat")
                .style("weight", "900")
                .attr("fill", d => colorScale(category))
                .text(category);
            
        });

        
    });
}