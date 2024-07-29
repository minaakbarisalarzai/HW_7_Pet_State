const width = 750;
const height = 600;

// Create an SVG element to hold the map
const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "#b0e0e6")
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

// load one state
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
                        .attr("fill", d => colorScale(petOwnershipData[d.properties.name.toLowerCase()].total * 1.1));
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
                        .attr("fill", d => stateData ? colorScale(stateData.total * 1.1) : "#cfcd99");
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

// load all states
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
                            .attr("fill", d => stateData ? colorScale(stateData.total * 1.1) : "#cfcd99");
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
