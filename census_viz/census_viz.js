const width = 600;
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

document.getElementById('stateSelect').addEventListener('change', function() {
    const selectedState = this.value;

    if (selectedState === 'all') {
        loadAllStates();
    } else {
        loadState(selectedState);
    }
});

function loadState(stateFile) {
    d3.json(stateFile).then(geojson => {
        console.log("GeoJSON data:", geojson); 
        svg.selectAll("path").remove(); // Clear previous paths

        if (geojson.type === 'FeatureCollection') {
            svg.selectAll("path")
                .data(geojson.features)
                .enter().append("path")
                .attr("d", path)
                .attr("stroke", "#000")
                .attr("fill", "#cfcd99");
        } else if (geojson.type === 'Feature') {
            svg.selectAll("path")
                .data([geojson])
                .enter().append("path")
                .attr("d", path)
                .attr("stroke", "#000")
                .attr("fill", "#cfcd99");
        }
    }).catch(error => {
        console.error("Error loading the GeoJSON data:", error); 
    });
}

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
                svg.selectAll("path")
                    .data(allFeatures)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("stroke", "#000")
                    .attr("fill", "#cfcd99");
            }
        }).catch(error => {
            console.error(`Error loading the GeoJSON data for ${file}:`, error); 
        });
    });
}
