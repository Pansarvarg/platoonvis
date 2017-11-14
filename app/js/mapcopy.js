// Set the dimensions of the canvas / graph

// Parse the date / time
//var parseDate = d3.timeParse("%b %Y");
d3.json("../data/outputTruncatedRoutes.json", function(error, data1) {
    if (error) throw error;
    
    // Load the map of sweden and draw it 
    d3.json("../data/svarje.json", function(error, data2){
        if (error) throw error;
        data2.coordinates.forEach(function(d){
            d.long = +d.long;
            d.lat = +d.lat;
        });
        
        data1.trucks.forEach(function(d1){
        
            d1.route.forEach(function(d) {
                d.long = +d.long/1000000;
                d.lat = +d.lat/1000000;
            });

            d1.id = d1.id;
            d1.start_time = +d1.start_time;
            d1.end_time = +d1.end_time;
            d1.deadline = +d1.deadline;

        });
        var crs = crossfilter(data1.trucks);
        drawMap(data1,data2);
        drawPlatoons(data1,data2);
    });
});


function drawMap(data1,data2){
    var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 450 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;


    // Set the ranges
    var x = d3.scaleLinear().range([0, width]);  
    var y = d3.scaleLinear().range([height, 0]);

    // Define the line
    var pathline = d3.line()    
        .x(function(d) { return x(d.long); })
        .y(function(d) { return y(d.lat); });

    var outline = d3.line()    
        .x(function(d) { return x(d.long); })
        .y(function(d) { return y(d.lat); })
        .curve(d3.curveCardinal);
        
    // Adds the svg canvas
    var svg = d3.select("#map-div")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data2.coordinates, function(d) { return d.long; }));
    y.domain(d3.extent(data2.coordinates, function(d) { return d.lat; }));
    

    svg.append("path")
        .attr("class", "line")
        .attr("class", "map")
        .attr("d", outline(data2.coordinates));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    // parse the truck coord data
    
    
    //console.log(data.trucks[0].route);
    data1.trucks.forEach(function(d) {   
        svg.append("path")
            .attr("class", "line")
            //.style("stroke", function() { // Add the colours dynamically
            //    return d.color = color(d.key); })
            .attr("d", pathline(d.route));
    });
};

function drawPlatoons(data1,data2){

    var margin = {
        top: 15,
        right: 25,
        bottom: 15,
        left: 60
    };

    var width = 550 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    
    var x = d3.scaleLinear().range([0, width]);  
    var y = d3.scaleLinear().range([height, 0]);

    var svg = d3.select("#platoons")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var div = d3.select("#platoons")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    /*x.domain([0, d3.max(data1, function (d) {
            //console.log(d.trucks.deadline);
            return d.trucks.deadline;

        })]);

*/
    y.domain([0, d3.max(data1.trucks, function (d) {
            return d.id;
            })]);
    
    x.domain([0, d3.max(data1.trucks, function(d) {return d.deadline; })]);
    console.log(d3.max(data1.trucks, function(d) { return d.deadline; }));

    



    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));
            
    //svg.selectAll(".bar")
    
    svg.append("g").selectAll(".bar")
        .data(data1.trucks)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {console.log(d.start_time); return x(d.start_time); })
        .attr("width", function(d) { return width - x(d.deadline); })
        .attr("y", function(d) { return y(d.id); })
        .attr("height", 2)

        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Id: "+(d.id) + "<br/>" + 
                "Start time: " + d.start_time + "<br/>" + 
                "Deadline: "+ d.deadline +"<br/>" +
                "travel time: "+ eval((d.deadline-d.start_time)/3600))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 40) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        /*.on("mouseover", function(d) {

            svg.append("text")
                .data(data1.trucks)
                .attr("y", "100")
                .attr("x", "200")
                .attr("class", "hover")
                .attr("font-family", "sans-serif")
                .attr("font-size", "12px")
                .style("fill", "black")
                .text(function(d) {
                    console.log(d);
                    return d.id;
                })
          })

            .on("mouseout", function(d) {

                svg.select("text.hover").remove();
              })
              .on("click", function(d) {
                console.log(d);
                

              });
*/

    
};