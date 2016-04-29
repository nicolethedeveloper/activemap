/**
 * Created by alire_000 on 3/30/2016.
 */
/**
 * Created by alire_000 on 3/25/2016.
 */
var ne = L.latLng(35.144198141702375, -80.83405762910843);
var sw = L.latLng(35.14278786447988, -80.83625435829163);
var bounds = L.latLngBounds(sw, ne);

var circleScale = d3.scale.linear().domain([0,25]).range([10,50]);
var youAreHere = [35.1432999975255,-80.83548054099083];
youAreHere = L.latLng(youAreHere);
var o = d3.scale.linear()
    .domain([0,25])
    .range(["#ffffcc","#33cc00"]);

var baseZoom = 20;
var minZoom = 20;
var maxZoom = 21;
var featureColor = "0DB6AE";
var selectColor = "orange";
var strokeColor = "white";
var center = [35.143485, -80.835405];

var map = new L.Map("map", {
    center: center,
    zoom: baseZoom,
    minZoom: minZoom,
    maxZoom: maxZoom,
    maxBounds: bounds,
    zoomAnimation: true
});


map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();


var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

var myFirebaseRef = new Firebase("https://activemap.firebaseio.com/");
var otherFirebaseRef = new Firebase("https://activemap.firebaseio.com/features/");

// base map and initial bubbles draw
myFirebaseRef.on("value", function (snapshot) {
    var collection = snapshot.val();
    var zoom;
    var transform = d3.geo.transform({ point: projectPoint }),
        path = d3.geo.path().projection(transform);


    var feature = g.selectAll("path")
        .data(collection.features)
        .enter().append("path");

    var circles = g.selectAll("circle")
        .data(collection.features)
        .enter().append("circle").attr("class", "circle");

    var text = g.selectAll("text")
        .data(collection.features)
        .enter().append("text").attr("class", "text");

    //You Are Here Symbol!
    var YouHere = g.append("circle").attr(
        {
            r: 10,
            fill: "red"
        }
    );

    var YouhereText = g.append("text").attr(
        {
            "font-size": "20px",
            "fill": "black"
        }
    ).text("You Are Here!");


    map.on("viewreset", reset);
    reset();


    // Reposition the SVG to cover the features.
    function reset() {
        var bounds = path.bounds(collection),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        feature.attr("d", path);

        var youHerPoint = map.latLngToLayerPoint(youAreHere);

        YouHere.attr({
            cx: youHerPoint.x,
            cy: youHerPoint.y - 30
        });

        YouhereText.attr({
            dx: youHerPoint.x + 12,
            dy: youHerPoint.y - 30 + 7
        });

        circles.attr("cx", function (d) {
            if (d.properties.RoomName != "None") {
                var centroid = path.centroid(d);
                var x = centroid[0];
                return x;
            }
        }).attr("cy", function (d) {
            if (d.properties.RoomName != "None") {
                var centroid = path.centroid(d);
                var y = centroid[1];
                return y;
            }
        }).attr("r", function (d) {
            return circleScale(d.properties.Count);
        }).style("fill", function (d) {
            return o(d.properties.Count);
        }).style("fill-opacity", "0.8")
            .attr("id", function (d) {
                return d.properties.ABV;
            }).style("stroke", strokeColor);

        d3.select("#HH").style("stroke", "yellow").style("stroke-width","6px");

        zoom = map.getZoom();

        text.attr("dx", function (d) {
            if (d.properties.RoomName != null) {
                var centroid = path.centroid(d);
                var x = centroid[0];
                return x;
            }
        }).attr("dy", function (d) {
            if (d.properties.RoomName != null) {
                var centroid = path.centroid(d);
                var y = centroid[1];
                return y;
            }
        }).text(function (d) {
            if (d.properties.RoomName != "None") {
                return d.properties.ABV;
            }
        }).style("font-size", function (d) {
            return "20px"
        }).attr("id", function (d) {
            return d.properties.ABV + "-text";
        }).style("text-anchor", "middle");

    }



    feature.attr("d", path).style("fill", function (d, i) {
        if (i == 49) {
            return "rgba(13, 182, 174,0.5)";
        } else {
            return featureColor
        }

    });
    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    var clickedCircle;

    circles.on("click", function (d) {
        if (this != clickedCircle) {
            circles.style("fill", function (d) {
                return o(d.properties.Count);
            }
                )
        }
        d3.select(this).style("fill", selectColor);

        clickedCircle = this;
    });

    text.on("click", function (d) {
        var ABV = d.properties.ABV;
        var RoomName = d.properties.RoomName;
        var Event = d.properties.Event;
        var centroid = path.centroid(d);
        circleColor = this.getAttribute("fill");
        zoomCenter = map.layerPointToLatLng(centroid);
        var r = circleScale(d.properties.Count);
        if (map.getZoom() === maxZoom) {
            map.setZoomAround(center, baseZoom, true);
            // d3.select(this).style("fill", "teal");
            // text.style("font-size", "5px");
            d3.select("#" + ABV).attr("r", r);
            d3.select(".info-text").remove();

        } else {
            map.setZoomAround(zoomCenter, maxZoom, true);
            d3.select("#" + ABV).style("fill", selectColor).attr("r", r * 4);
            d3.select("#" + ABV + "-text").style("font-size", "25px").text(RoomName + ": " + Event);
            // text.style("font-size", "15px");
            // d3.select(".room-info").append("p").attr("class", "info-text")
            // .text(Event)
            // .style("text-align", "center");
        }
    });

    circles.on("click", function (d) {
        var ABV = d.properties.ABV;
        var RoomName = d.properties.RoomName;
        var Event = d.properties.Event;
        var centroid = path.centroid(d);
        circleColor = this.getAttribute("fill");
        zoomCenter = map.layerPointToLatLng(centroid);

        if (map.getZoom() == maxZoom) {
            map.setZoomAround(center, baseZoom, true);
            // d3.select(this).style("fill", "teal");
            // text.style("font-size", "5px");
            var r = d3.select(this).getAttribute("r");
            d3.select(this).attr("r", r);
            // d3.select(".video").style("visibility","visible");

        } else {
            map.setZoomAround(zoomCenter, maxZoom, true);
            d3.select(this).style("fill", selectColor).attr("r", this.getAttribute("r") * 4);
            d3.select("#" + ABV + "-text").style("font-size", "25px").text(RoomName + ": " + Event);
            // d3.select(".video").style("visibility","hidden");
            // text.style("font-size", "15px");
            // d3.select(".room-info").append("p").attr("class", "info-text")
            // .text(Event)
            // .style("text-align", "center");
        }
    });
    //
    // feature.on("click", function (d) {
    //     var centroid = path.centroid(d);
    //     zoomCenter = map.layerPointToLatLng(centroid);
    //
    //     if (map.getZoom() === maxZoom) {
    //         map.setZoomAround(latlong, baseZoom, true);
    //         // text.style("font-size", "5px");
    //         // d3.select(this).style("fill", "teal");
    //     } else {
    //         map.setZoomAround(zoomCenter, maxZoom, true);
    //         // text.style("font-size", "15px");
    //         // d3.select(this).style("fill", "orange");
    //     }
    // });
    var t = 1;
    setInterval(function () {

        if (t == 1) {
            circles.style("fill-opacity", "0.8");
            t = 2;
        } else if (t == 2) {
            circles.style("fill-opacity", "0.4");
            t = 1;
        }

    }, 800);

});

//Draw Bar Chart
myFirebaseRef.once("value", function(snapshot){
        var w = "100%";
        var h = "100%";
        var collection = snapshot.val();
        var features = collection.features;
        var padding = 20;
        var towers = [0,0,0,0];
        var towerNames = ["North Tower","East Tower","South Tower","West Tower"];

    // var xScale = d3.scale.ordinal()
        // .domain(d3.range(ds.length))
        // .rangeBands([0, w], 0.05);
        for (room in features) {
            var feature = features[room].properties;
            if (feature.RoomName != "None"){
                var NTCount = feature.NT;
                var ETCount = feature.ET;
                var STCount = feature.ST;
                var WTCount = feature.WT;
                towers[0] = towers[0] + NTCount;
                towers[1] = towers[1] + ETCount;
                towers[2] = towers[2] + STCount;
                towers[3] = towers[3] + WTCount;
            }
        }
    
        var svg2 = d3.select(".graphic").append("svg").attr("width", w).attr("height", h).attr("id","bar-chart");
        var g2 = svg2.append("g");
        var svgwidth= document.querySelector('#bar-chart').clientWidth;
        var svgheight= document.querySelector('#bar-chart').clientHeight;
    var colors = ["#e31e50","#e5781d","#e3e51d","#7ee51d"];

        var colorScale = d3.scale.ordinal().domain(d3.range(towerNames)).range(colors);

        var g2 = svg2.append("g");

        var xScale = d3.scale.ordinal()
            .domain(d3.range(towers.length))
            .rangeBands([0, svgwidth], 0.2);

        var max =  d3.max(towers);
        var y = d3.scale.linear().domain([0, max]).range([svgheight-30, 30]);
        var xAxisScale = d3.scale.ordinal()
            .domain(towerNames)
            .rangeBands([0, svgwidth], 0.2);

        var xAxis = d3.svg.axis()
            .scale(xAxisScale)
            .orient("bottom")
            .ticks(4);

        g2.selectAll("rect")
            .data(towers)
            .enter()
            .append("rect")
            .attr({
                "id": function (d,i) {
                    return towerNames[i];
                },
                "class":"bar",
                x: function (d, i) {
                    return xScale(i);
                },
                y: function (d) {
                    return y(d);
                },
                width: xScale.rangeBand(),
                height: function (d) { return (svgheight - y(d) - (50)) ;}
            })
            .attr("fill", function (d,i) {
                return colorScale(i);
            });

        g2.selectAll("text")
            .data(towerNames)
            .enter()
            .append("text")
            .attr("id",function(d){return d + "-text"})
            .attr('x', function (d, i) { return xScale(i); })
            .attr("y",svgheight - 20)
            .style({
                "font-family": "sans-serif",
                "fill":"black",
                "font-size":"14px"
            }).text(function (d,i) {
                    return d + " : " + towers[i];
                }
            );


});

// bubbles update
otherFirebaseRef.on("child_changed", function(snapshot){
    var s = snapshot.val();
    var changedID = "#" + s.properties.ABV;
    var r = circleScale(s.properties.Count);
    var fill = o(s.properties.Count);
    d3.select(changedID).transition().attr("r", r).style("fill", fill);
});
