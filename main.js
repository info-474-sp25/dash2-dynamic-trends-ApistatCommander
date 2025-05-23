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

// const svg2_RENAME = d3.select("#lineChart2")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("aircraft_incidents.csv").then(data => {

    // 2.b: ... AND TRANSFORM DATA

    //reformat data
    data.forEach(d => {
        d.year = +d.year;
        d.fatalities = +d.Total_Fatal_Injuries;
    });

    // console.log(data);    

    //clean data
    const cleanData = data.filter(d => d.fatalities != null
        && d.year != null
    );

    // console.log("cleaned data: ", cleanData);

    //group by and summarize (aggregate fatalities by year)
    const dataMap = d3.rollup(cleanData, 
        v => d3.sum(v, d => d.fatalities),
        d => d.year
    );

    // console.log("data map: ", dataMap);

    //convert to array and sort by year
    const dataArr = Array.from(dataMap,
        ([year, fatalities]) => ({year, fatalities})

    )
        .sort((a,b) => a.year - b.year)
    ;
    console.log("year and deaths: ", dataArr);

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
        .text("Fatalities ($)")
    ;

    // 7.a: ADD INTERACTIVITY FOR CHART 1


});