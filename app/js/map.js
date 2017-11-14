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

    
    var margin = {top: 20, right: 20, bottom: 110, left: 40},
        margin2 = {top: 430, right: 20, bottom: 30, left: 40},
        width = +960 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;
    
    var x = d3.scaleLinear().range([0, width]),
        x2 = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0])

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);
    
    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

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

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
    /*x.domain([0, d3.max(data1, function (d) {
            //console.log(d.trucks.deadline);
            return d.trucks.deadline;

        })]);

*/
    y.domain([0, d3.max(data1.trucks, function (d) {return d.id;})]);
    x.domain([0, d3.max(data1.trucks, function(d) {return d.deadline; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    



    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);
            
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
        
    context.append("g").selectAll(".bar")
        .data(data1.trucks)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {console.log(d.start_time); return x(d.start_time); })
        .attr("width", function(d) { return width - x(d.deadline); })
        .attr("y", function(d) { return y(d.id); })
        .attr("height", 1);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);


    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        focus.select(".bar").attr("d", width);
        focus.select(".axis--x").call(xAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));
    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        focus.select(".bar").attr("d", width);
        focus.select(".axis--x").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    
};