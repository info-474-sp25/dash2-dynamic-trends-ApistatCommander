// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgLine = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);



// 2.a: LOAD...
d3.csv("aircraft_incidents.csv").then(data => {

    // 2.b: ... AND TRANSFORM DATA

    //reformat data
    data.forEach(d => {
        d.year = +d.year;
        d.fatalities = +d.Total_Fatal_Injuries;
    });


    //clean data
    const cleanData = data.filter(d => d.fatalities != null
        && d.year != null
    );


    //group by and summarize (aggregate fatalities by year)
    const dataMap = d3.rollup(cleanData, 
        v => d3.sum(v, d => d.fatalities),
        d => d.year
    );


    //convert to array and sort by year
    const dataArr = Array.from(dataMap,
        ([year, fatalities]) => ({year, fatalities})

    )
        .sort((a,b) => a.year - b.year)
    ;

    // 3.a: SET SCALES FOR CHART 1
       let xYear = d3.scaleLinear()
        .domain([d3.min(dataArr, d => d.year), d3.max(dataArr, d => d.year)])
        .range([0, width]); // START low, INCREASE

    let yFatalities = d3.scaleLinear()
        .domain([0, d3.max(dataArr, d => d.fatalities)])
        .range([height,0]); // START high, DECREASE


    // 4.a: PLOT DATA FOR CHART 1
    const line = d3.line()
        .x(d => xYear(d.year))
        .y(d => yFatalities(d.fatalities));

    svgLine.append("path")
        .datum(dataArr) // Bind the entire lineData array
        .attr("d", line) // Use the line generator to create the path
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // 5.a: ADD AXES FOR CHART 1
    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xYear)
        .tickFormat(d3.format("d")) // remove decimals
        );

        svgLine.append("g")
        .call(d3.axisLeft(yFatalities)
            .tickFormat(d => d) // condense billions
    );


    // 6.a: ADD LABELS FOR CHART 1
    //title
    svgLine.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Total Fatal Injuries in Airline Incidents (1995 - 2016)");

    //x-axis
        svgLine.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + (margin.bottom / 2))
        .text("Year")
    ;

    //y-axis
    svgLine.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", (-margin.left / 2) - 10)
        .attr("x", -height / 2)
        .text("Fatal Injuries")
    ;

    // 7.a: ADD INTERACTIVITY FOR CHART 1

    //Tool Tip
     const tooltip = d3.select("body") // Create tooltip
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "12px");

    svgLine.selectAll(".data-point") // Create tooltip events
        .data(dataArr) // Bind on the data array
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", d => xYear(d.year))
        .attr("cy", d => yFatalities(d.fatalities))
        .attr("r", 10)
        .style("fill", "steelblue")
        .style("opacity", 0)  // Make circles invisible by default
        // --- MOUSEOVER ---
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html(`<strong>Year:</strong> ${d.year} <br><strong>Fatalities:</strong> ${d.fatalities}`)
                .style("top", (event.pageY + 10) + "px") // Position relative to pointer
                .style("left", (event.pageX + 10) + "px");

            // Create the large circle at the hovered point
            svgLine.append("circle")
                .attr("class", "hover-circle")
                .attr("cx", xYear(d.year))  // Position based on the year
                .attr("cy", yFatalities(d.fatalities)) // Position based on the fatalities
                .attr("r", 6)  // Radius of the large circle
                .style("fill", "steelblue") // Circle color
                .style("stroke-width", 2);
        })
        // Mouse Out 
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");

            // Remove the hover circle when mouseout occurs
            svgLine.selectAll(".hover-circle").remove();

            // Make the circle invisible again
            d3.select(this).style("opacity", 0);  // Reset opacity to 0 when not hovering
        });
    
    //Trendline

    //Linear Regression
    function linearRegression(data) {
        const n = data.length;
        const sumX = d3.sum(data, d => d.year);
        const sumY = d3.sum(data, d => d.fatalities);
        const sumXY = d3.sum(data, d => d.year * d.fatalities);
        const sumX2 = d3.sum(data, d => d.year * d.year);

        // Calculate slope (m) and intercept (b)
        const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        // Generate points for the trendline
        const trendlineData = data.map(d => ({
            year: d.year,
            count: m * d.year + b
        }));

        return trendlineData;
    };

    //Draw trendline once checked
    function drawTrendline() {


        // Calculate trendline
        const trendlineData = linearRegression(dataArr);

        // Remove the previous trendline if it exists
        svgLine.selectAll(".trendline").remove();

        //Draw trendline based on data
        svgLine.append("path")
            .data([trendlineData])
            .attr("class", "trendline")
            .attr("d", d3.line()
                .x(d => xYear(d.year))
                .y(d => yFatalities(d.count))
            )
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

    }

    //draw trendline
    // drawTrendline();

    //Toggle Trendline
     d3.select("#trendline-toggle").on("change", function() {
        // Get state
        const isChecked = d3.select(this).property("checked"); 
        // Create trendline based on state
        if (isChecked) {
            drawTrendline();
        } else {
            svgLine.selectAll(".trendline").remove();
        }

    });



});