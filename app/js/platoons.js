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

        var truck = crossfilter(data1.trucks);
        var all = truck.groupAll();
        var id = truck.dimension((d) => d.id);
        var travel_time = truck.dimension((d) => eval(d.deadline-d.start_time));

            console.log(data1.trucks);
    });
});