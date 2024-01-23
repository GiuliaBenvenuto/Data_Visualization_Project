export function createYGrid(svg, y_stack, width_stack, num_ticks, stroke_color, stroke_dasharray) {
    svg.selectAll("yGrid")
      .data(y_stack.ticks(num_ticks))
      .enter()
      .append("line")
        .attr("x1", 0)
        .attr("x2", width_stack)
        .attr("y1", function(d) { return y_stack(d); })
        .attr("y2", function(d) { return y_stack(d); })
        .attr("stroke", stroke_color)
        .attr("stroke-dasharray", stroke_dasharray);
  };


export function createXGrid(svg, xScale, height_stack, num_ticks, stroke_color, stroke_dasharray) {
  svg.selectAll("xGrid")
  .data(xScale.ticks(num_ticks)) // You can change the number of ticks as per your preference
  .enter()
  .append("line")
  .attr("x1", function (d) { return xScale(d); })
  .attr("x2", function (d) { return xScale(d); })
  .attr("y1", 0)
  .attr("y2", height_stack)
  .attr("stroke", stroke_color) // Adjust the color as needed
  .attr("stroke-dasharray", stroke_dasharray); // You can adjust the dash pattern if desired
};


export function addTitle(selection, text, fontSize, fill, x, y) {
  selection.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .style("font-size", fontSize)
    .style("fill", fill)
    .style("font-family", "'Fira Sans', sans-serif")
    .text(text);
}

export function addTooltip(parentElement) {
  return parentElement.append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid #214328")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font", "15px Fira Sans")
    .style("color", "#214328");
}