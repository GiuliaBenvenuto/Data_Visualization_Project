export function updateSmallMultiple(checkedValue) {

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
        "EU28": "European Union",
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

        const filteredData = data.filter(d => d.geo === checkedValue);

        if (!filteredData.length) {
            // console.error("No data found for " + checkedValue);
            return; // Exit the function if no data found to avoid further errors
        }

        // Define the categories to be used in the chart (the columns in the CSV)
        const usedDevice = [ "I_IUG_DKPC", "I_IUG_LPC", "I_IUG_MP", "I_IUG_OTH1", "I_IUG_TPC", "I_IUG_TV" ];

        // Define years as categories
        const categories = ['2016', '2018', '2021', '2023'];

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


            const categoryData = usedDevice.map(indicIs => {
                const record = filteredData.find(d => d.indic_is === indicIs);
                // Initialize value as 0 by default
                let value = 0;
                if (record && record[category] !== ":" && !isNaN(record[category])) {
                    // If the record exists, the value for the category is not ":", and is not NaN, then use the actual value
                    value = +record[category];
                }
                return { indic_is: usedDeviceMapping[indicIs] || indicIs, value: value };
            });
            // console.log("CATEGORY DATA inside:", categoryData);
            

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
            .range(['#ea3a30', '#ff9908', '#58ba35', '#2EA8C7']);
            
                
            // Function to normalize values to the range [0, 100]
            const normalizeValue = value => (value / maxCategoryValue) * normalizedMax;

            // Draw bars for each category
                svg.selectAll(".category-bar")
                .data(categoryData)
                .enter()
                .append("rect")
                .attr("id", (d, i) => "bar-" + i)
                .attr("class", "category-bar")
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
                            <strong>Year:</strong> ${category} <br>
                            <strong>Percentage:</strong> ${d.value} % <br>
                            <strong>Device:</strong> ${d.indic_is}
                            `
                        ) // Corrected to indic_is
                        .style("visibility", "visible")
                        .style("font", "15px Montserrat")
                        .style("color", "#333")
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY - 30) + "px");

                    
                    var hoveredIndex = d3.selectAll(".category-bar").nodes().indexOf(this);

                    d3.selectAll(".category-bar").attr("fill", function(o, i) {
                        var groupIndex = Math.floor(i / 6);
                        if (hoveredIndex === i) {
                            if (groupIndex === 0) return "#ea3a30";
                            else if (groupIndex === 1) return "#ff9908";
                            else if (groupIndex === 2) return "#58ba35";
                            else return "#2EA8C7";
                        } else {
                            return "#ccc"; // Non-hovered bars color
                        }
                    });

                })
                .on("mousemove", function(d) {
                    tooltip
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY + 30) + "px");
                }) 
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);

                    // Reset the color of all bars with the class "category-bar"
                    // d3.selectAll(".category-bar").attr("fill", d => colorScale(category))
                    // Extract the index from the bar's ID
                    d3.selectAll(".category-bar").each(function(d, i) {
                        // Calculate the group index (0 for the first 6 bars, 1 for the next 6, and so on)
                        var groupIndex = Math.floor(i / 6);
                
                        // Assign color based on the group index
                        var color;
                        if (groupIndex === 0) {
                            color = "#ea3a30";
                        } else if (groupIndex === 1) {
                            color = "#ff9908";
                        } else if (groupIndex === 2) {
                            color = "#58ba35";
                        } else {
                            color = "#2EA8C7";
                        }
                
                        // Set the fill color
                        d3.select(this).attr("fill", color);
                    });
        
                })
                .transition() // adding a transition
                .duration(800)
                .attr("width", d => xScale(normalizeValue(d.value))) // transition to the actual width
                .attr("fill-opacity", 0.8); // slightly transparent for a more pleasant effect
            

                // Add labels to the right of each bar
                svg.selectAll(".bar-text")
                .data(categoryData)
                .enter()
                .append("text")
                .attr("class", "bar-text")
                .text(d => d.value === 0 ? "No data" : `${d.value}%`)  // Conditionally set the text based on the value
                .attr("x", d => {
                    // Adjust the x position based on whether the label is "No data" or a percentage
                    if (d.value === 0) {
                        return xScale(0) + 5; // Position "No data" labels slightly right of the y-axis
                    } else if (d.value < 15) {
                        // For small non-zero values, position the label outside the bar to ensure readability
                        return xScale(normalizeValue(d.value)) + 5;
                    } else {
                        // For larger values, position the label inside the bar
                        return xScale(normalizeValue(d.value)) - 48; // Adjust as needed for your chart's aesthetics
                    }
                })
                .attr("y", d => yScale(d.indic_is) + yScale.bandwidth() / 2 + 4) // Center vertically in bar
                .attr("fill", d => d.value === 0 ? "#333" : "#333") // Change text color for "No data" labels if needed
                .style("font", "12px Montserrat")
                .style("visibility", "hidden") // Initially hide the labels
                .transition() // Add a transition for the text
                .duration(800)
                .style("visibility", "visible"); // Make the labels visible after the transition

            

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