// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

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


    // 4.a: PLOT DATA FOR CHART 1


    // 5.a: ADD AXES FOR CHART 1


    // 6.a: ADD LABELS FOR CHART 1


    // 7.a: ADD INTERACTIVITY FOR CHART 1


});