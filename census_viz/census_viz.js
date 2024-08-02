const width = 750;
const height = 600;

// Create an SVG element to hold the map
const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", (event) => {
        svg.attr("transform", event.transform);
    }))
    .append("g");

// Define a projection
const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

const petOwnershipData = {};

// Define a color scale
const colorScale = d3.scaleSequential()
    .domain([0, 100]) 
    .interpolator(d3.interpolateGreens);

// Create a tooltip element
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

d3.csv('pet_ownership.csv').then(data => {
    data.forEach(d => {
        petOwnershipData[d.State.toLowerCase()] = {
            total: +d.PetOwnershipRate,
            dog: +d.DogOwnershipRate,
            cat: +d.CatOwnershipRate
        };
    });

    console.log("Pet Ownership Data:", petOwnershipData);

    loadAllStates();
});

document.getElementById('stateSelect').addEventListener('change', function() {
    const selectedState = this.value;

    if (selectedState === 'all') {
        loadAllStates();
    } else {
        loadState(selectedState);
    }
});

// load one state per user selection 
function loadState(stateFile) {
    d3.json(stateFile).then(geojson => {
        svg.selectAll("path").remove(); // Clear previous paths
        svg.selectAll("text").remove(); // Clear previous labels

        if (geojson.type === 'FeatureCollection') {
            svg.selectAll("path")
                .data(geojson.features)
                .enter().append("path")
                .attr("d", path)
                .attr("stroke", "#000")
                .attr("fill", d => {
                    const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                    return stateData ? colorScale(stateData.total) : "#cfcd99"; // Default color if no data
                })
                .on("mouseover", function(event, d) {
                    const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                    if (stateData) {
                        tooltip.html(
                            `<strong>${d.properties.name}</strong><br>
                             Pet Ownership Rate: ${stateData.total}%<br>
                             Dog Ownership Rate: ${stateData.dog}%<br>
                             Cat Ownership Rate: ${stateData.cat}%`
                        );
                        tooltip.style("opacity", "1").style("visibility", "visible");
                    }
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("transform", function() {
                            const centroid = path.centroid(d);
                            return `translate(${centroid[0]}, ${centroid[1]}) scale(1.2) translate(${-centroid[0]}, ${-centroid[1]})`;
                        })
                        .attr("stroke", "#ff0")
                        .attr("stroke-width", "2")
                        .attr("fill", "yellow");

                    // Reset all bars to their original color
                    d3.selectAll("#barChart .bar")
                        .attr("fill", "steelblue");

                    // Highlight the corresponding bar in the dog and cat bar charts
                    d3.selectAll("#barChart .bar")
                        .filter(barData => barData.State === d.properties.name.toLowerCase())
                        .attr("fill", "yellow");
                })
                .on("mousemove", function(event) {
                    tooltip.style("top", (event.pageY - 10) + "px")
                           .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.style("opacity", "0").style("visibility", "hidden");
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("transform", "translate(0, 0) scale(1)")
                        .attr("stroke", "#000")
                        .attr("stroke-width", "1")
                        .attr("fill", d => {
                            const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                            return stateData ? colorScale(stateData.total) : "#cfcd99"; // Default color if no data
                        });

                    // Remove highlight from the corresponding bar in the dog and cat bar charts
                    d3.selectAll("#barChart .bar")
                        .filter(barData => barData.State === d.properties.name.toLowerCase())
                        .attr("fill", "seablue");
                });

            svg.selectAll("text")
                .data(geojson.features)
                .enter().append("text")
                .attr("x", d => path.centroid(d)[0])
                .attr("y", d => path.centroid(d)[1])
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .attr("fill", "black")
                .text(d => petOwnershipData[d.properties.name.toLowerCase()] ? petOwnershipData[d.properties.name.toLowerCase()].total : '');
        } else if (geojson.type === 'Feature') {
            svg.selectAll("path")
                .data([geojson])
                .enter().append("path")
                .attr("d", path)
                .attr("stroke", "#000")
                .attr("fill", d => {
                    const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                    return stateData ? colorScale(stateData.total) : "#cfcd99"; // Default color if no data
                })
                .on("mouseover", function(event, d) {
                    const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                    if (stateData) {
                        tooltip.html(
                            `<strong>${d.properties.name}</strong><br>
                             Pet Ownership Rate: ${stateData.total}%<br>
                             Dog Ownership Rate: ${stateData.dog}%<br>
                             Cat Ownership Rate: ${stateData.cat}%`
                        );
                    } else {
                        tooltip.html(
                            `<strong>${d.properties.name}</strong><br>
                             Pet Ownership Rate: N/A<br>
                             Dog Ownership Rate: N/A<br>
                             Cat Ownership Rate: N/A`
                        );
                    }
                    tooltip.style("opacity", "1").style("visibility", "visible");
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("transform", function() {
                            const centroid = path.centroid(d);
                            return `translate(${centroid[0]}, ${centroid[1]}) scale(1.2) translate(${-centroid[0]}, ${-centroid[1]})`;
                        })
                        .attr("stroke", "#ff0")
                        .attr("stroke-width", "2")
                        .attr("fill", "yellow");

                    // Reset all bars to their original color
                    d3.selectAll("#barChart .bar")
                        .attr("fill", "steelblue");

                    // Highlight the corresponding bar in the dog and cat bar charts
                    d3.selectAll("#barChart .bar")
                        .filter(barData => barData.State === d.properties.name.toLowerCase())
                        .attr("fill", "yellow");
                })
                .on("mousemove", function(event) {
                    tooltip.style("top", (event.pageY - 10) + "px")
                           .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.style("opacity", "0").style("visibility", "hidden");
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("transform", "translate(0, 0) scale(1)")
                        .attr("stroke", "#000")
                        .attr("stroke-width", "1")
                        .attr("fill", d => {
                            const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                            return stateData ? colorScale(stateData.total) : "#cfcd99";
                        });

                    // Remove highlight from the corresponding bar in the dog and cat bar charts
                    d3.selectAll("#barChart .bar")
                        .filter(barData => barData.State === d.properties.name.toLowerCase())
                        .attr("fill", "steelblue");
                });                

            svg.selectAll("text")
                .data([geojson])
                .enter().append("text")
                .attr("x", d => path.centroid(d)[0])
                .attr("y", d => path.centroid(d)[1])
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .attr("fill", "black")
                .text(d => petOwnershipData[d.properties.name.toLowerCase()] ? petOwnershipData[d.properties.name.toLowerCase()].total : '');
        }
    }).catch(error => {
        console.error("Error loading the GeoJSON data:", error); 
    });
}

// load all states per user selection 
function loadAllStates() {
    const stateFiles = [
        "alabama.geojson",
        "alaska.geojson",
        "arizona.geojson",
        "arkansas.geojson",
        "california.geojson",
        "colorado.geojson",
        "connecticut.geojson",
        "delaware.geojson",
        "florida.geojson",
        "georgia.geojson",
        "hawaii.geojson",
        "idaho.geojson",
        "illinois.geojson",
        "indiana.geojson",
        "iowa.geojson",
        "kansas.geojson",
        "kentucky.geojson",
        "louisiana.geojson",
        "maine.geojson",
        "maryland.geojson",
        "massachusetts.geojson",
        "michigan.geojson",
        "minnesota.geojson",
        "mississippi.geojson",
        "missouri.geojson",
        "montana.geojson",
        "nebraska.geojson",
        "nevada.geojson",
        "new hampshire.geojson",
        "new jersey.geojson",
        "new mexico.geojson",
        "new york.geojson",
        "north carolina.geojson",
        "north dakota.geojson",
        "ohio.geojson",
        "oklahoma.geojson",
        "oregon.geojson",
        "pennsylvania.geojson",
        "rhode island.geojson",
        "south carolina.geojson",
        "south dakota.geojson",
        "tennessee.geojson",
        "texas.geojson",
        "utah.geojson",
        "vermont.geojson",
        "virginia.geojson",
        "washington.geojson",
        "west virginia.geojson",
        "wisconsin.geojson",
        "wyoming.geojson"
    ];

    let allFeatures = [];

    stateFiles.forEach((file, index) => {
        d3.json(file).then(geojson => {
            if (geojson.type === 'FeatureCollection') {
                allFeatures = allFeatures.concat(geojson.features);
            } else if (geojson.type === 'Feature') {
                allFeatures.push(geojson);
            }

            if (index === stateFiles.length - 1) { // Check if it's the last file
                svg.selectAll("path").remove(); 
                svg.selectAll("text").remove(); // Clear previous labels

                svg.selectAll("path")
                    .data(allFeatures)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("stroke", "#000")
                    .attr("fill", d => {
                        const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                        return stateData ? colorScale(stateData.total) : "#cfcd99"; // Default color if no data
                    })
                    .on("mouseover", function(event, d) {
                        const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                        if (stateData) {
                            tooltip.html(
                                `<strong>${d.properties.name}</strong><br>
                                 Pet Ownership Rate: ${stateData.total}%<br>
                                 Dog Ownership Rate: ${stateData.dog}%<br>
                                 Cat Ownership Rate: ${stateData.cat}%`
                            );
                        } else {
                            tooltip.html(
                                `<strong>${d.properties.name}</strong><br>
                                 Pet Ownership Rate: N/A<br>
                                 Dog Ownership Rate: N/A<br>
                                 Cat Ownership Rate: N/A`
                            );
                        }
                        tooltip.style("opacity", "1").style("visibility", "visible");
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("transform", function() {
                                const centroid = path.centroid(d);
                                return `translate(${centroid[0]}, ${centroid[1]}) scale(1.2) translate(${-centroid[0]}, ${-centroid[1]})`;
                            })
                            .attr("stroke", "#ff0")
                            .attr("stroke-width", "2")
                            .attr("fill", "yellow");

                        // Reset all bars to their original color
                        d3.selectAll("#barChart .bar")
                            .attr("fill", "steelblue");

                        // Highlight the corresponding bar in the dog and cat bar charts
                        d3.selectAll("#barChart .bar")
                            .filter(barData => barData.State === d.properties.name.toLowerCase())
                            .attr("fill", "yellow");
                    })
                    .on("mousemove", function(event) {
                        tooltip.style("top", (event.pageY - 10) + "px")
                               .style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.style("opacity", "0").style("visibility", "hidden");
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("transform", "translate(0, 0) scale(1)")
                            .attr("stroke", "#000")
                            .attr("stroke-width", "1")
                            .attr("fill", d => {
                                const stateData = petOwnershipData[d.properties.name.toLowerCase()];
                                return stateData ? colorScale(stateData.total) : "#cfcd99"; // Default color if no data
                            });

                        // Remove highlight from the corresponding bar in the dog and cat bar charts
                        d3.selectAll("#barChart .bar")
                            .filter(barData => barData.State === d.properties.name.toLowerCase())
                            .attr("fill", "steelblue");
                    });                    

                svg.selectAll("text")
                    .data(allFeatures)
                    .enter().append("text")
                    .attr("x", d => path.centroid(d)[0])
                    .attr("y", d => path.centroid(d)[1])
                    .attr("text-anchor", "middle")
                    .attr("font-size", "10px")
                    .attr("fill", "black")
                    .text(d => petOwnershipData[d.properties.name.toLowerCase()] ? petOwnershipData[d.properties.name.toLowerCase()].total : '');
            }
        }).catch(error => {
            console.error(`Error loading the GeoJSON data for ${file}:`, error); 
        });
    });
    
}



///   =============================   The Bar Chart Code =============================================== //

// Create functions to draw the bar charts
function drawBarChart(data, title) {
    // Set up the dimensions and margins for the bar chart
    const margin = {top: 40, right: 30, bottom: 70, left: 40};
    const width = 750 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Remove any existing SVG elements in the bar chart container
    d3.select("#barChart").selectAll("svg").remove();

    // Create an SVG element for the bar chart
    const svg = d3.select("#barChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the x and y scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.State))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add bars to the bar chart
    svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.State))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", "steelblue")
    .attr("rx", 5) // Rounded corners
    .attr("ry", 5) // Rounded corners
    .on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "yellow");
        d3.selectAll("#map path")
            .filter(pathData => pathData.properties && pathData.properties.name.toLowerCase() === d.State)
            .attr("fill", "yellow");
            tooltip.html(
                `<strong>${d.State}</strong><br>Ownership Rate: ${d.value}`
            )
            .style("opacity", "1")
            .style("visibility", "visible");
    })
    .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function(event, d) {
        d3.select(this).attr("fill", "steelblue");
        d3.selectAll("#map path")
            .filter(pathData => pathData.properties && pathData.properties.name.toLowerCase() === d.State)
            .attr("fill", pathData => {
                const stateData = petOwnershipData[pathData.properties.name.toLowerCase()];
                return stateData ? colorScale(stateData.total) : "#cfcd99";
            });
    });

    // Add a title to the bar chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("text-decoration", "underline")
        .text(title);

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom )
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("States");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Ownership Rate (%)");

}

// ===============================  Cat and Dog Buttons   ========================================== //

// Event listeners for the images
document.getElementById('dogButton').addEventListener('click', function() {
    const dogData = Object.keys(petOwnershipData).map(state => ({
        State: state,
        value: petOwnershipData[state].dog
    }));
    drawBarChart(dogData, "Dog Ownership Rate by State");
});

document.getElementById('catButton').addEventListener('click', function() {
    const catData = Object.keys(petOwnershipData).map(state => ({
        State: state,
        value: petOwnershipData[state].cat
    }));
    drawBarChart(catData, "Cat Ownership Rate by State");
});

// Call the function to draw the dog bar chart by default
d3.csv('pet_ownership.csv').then(data => {
    data.forEach(d => {
        petOwnershipData[d.State.toLowerCase()] = {
            total: +d.PetOwnershipRate,
            dog: +d.DogOwnershipRate,
            cat: +d.CatOwnershipRate
        };
    });

    const dogData = Object.keys(petOwnershipData).map(state => ({
        State: state,
        value: petOwnershipData[state].dog
    }));
    drawBarChart(dogData, "Dog Ownership Rate by State");
});

// ================================= END OF BAR CHART ================================================== //


// =============================== Color Legend For The Map   ========================================== //

// Function to add the legend
function addLegend() {
    const legendWidth = 300;
    const legendHeight = 20;

    const legendSvg = d3.select("#map").append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight + 30)
        .attr("class", "legend")
        .style("position", "absolute")
        .style("bottom", "0px")
        .style("left", "430px");

    const gradient = legendSvg.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.interpolateGreens(0));

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.interpolateGreens(1));

    legendSvg.append("rect")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", legendWidth - 20)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    legendSvg.append("text")
        .attr("x", 10)
        .attr("y", legendHeight + 25)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text("0%");

    legendSvg.append("text")
        .attr("x", legendWidth - 10)
        .attr("y", legendHeight + 25)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .text("100%");
}

// Call the addLegend function to add the legend to the map
addLegend();


/// =============================== End Of Legend Code ===========================================  // 