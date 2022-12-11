var svg = d3.select("#legend")

var keys = ["email", "SSN", "Credit Card", "Personal Details", "Full Details"]

var color = d3.scaleOrdinal()
              .domain(keys)
              .range(["#FFBF00", "#FF7F50", "#6495ED", "#008000", "#DE3163"]);

svg.selectAll("dots")
    .data(keys).enter()
    .append("rect")
        .attr("x", 10)
        .attr("y", function(d,i){ return 0 + i*(20+5)}) // 10 is where the first dot appears. 25 is the distance between dots
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function(d){ return color(d)})

svg.selectAll("mylabels")
    .data(keys).enter()
    .append("text")
        .attr("x", 40)
        .attr("y", function(d,i){ return 10 + i*25})
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on('mouseover', function(d) {
            var c = d3.selectAll("circle")
                        .transition()
                        .duration('50')
                        .attr('opacity', '.2');
            
            var total_r = 0;
            for (let index = 0; index < c._groups[0].length; index++) {
                var element = c._groups[0][index].__data__.category;
                var f = c._groups[0][index]
                switch (element) {
                      case 0:
                        element = "email";
                        break;
                      case 1:
                        element = "SSN";
                        break;
                      case 2:
                        element = "Credit Card";
                        break;
                      case 3:
                        element = "Personal Details";
                        break;
                      case 4:
                        element = "Full Details";
                        break;
                }

                if (element === d) {
                    total_r = total_r + c._groups[0][index].__data__.radius;
                    d3.select(f)
                      .transition()
                      .duration('50')
                      .attr('opacity', '1')
                }
            }

            text.transition().text("Total Accounts Hacked");
            text1.transition().text("via "+ d);
            text2.transition().text(formatNumber(total_r*10000000));
        })
        .on('mouseout', function(d) {
            d3.selectAll("circle")
              .transition()
              .duration('50')
              .attr('opacity', '1');

            text.transition().text("");
            text1.transition().text("");
            text2.transition().text("");
        })


function formatNumber(num) {
    if(num > 999 && num < 100000){
        return (num/1000).toFixed(1) + ' K'; // convert to K for number from > 1000 < 1 million 
    }else if(num > 1000000){
        return (num/1000000).toFixed(1) + ' M'; // convert to M for number from > 1 million 
    }else if(num > 1000000000){
        return (num/1000000000).toFixed(1) + ' B'; // convert to M for number from > 1 million 
    }else if(num < 900){
        return num; // if value < 1000, nothing to do
    }
}

var text = svg
        .append('text')
        .attr("id", 'legendbar')
        .attr("x", 20)
        .attr("y", 150)
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-family", "monospace")
        .text("")
        .style("fill", "white")

var text1 = svg
        .append('text')
        .attr("id", 'legendbar')
        .attr("x", 20)
        .attr("y", 170)
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-family", "monospace")
        .style("fill", "white")

var text2 = svg
        .append('text')
        .attr("id", 'legendbar')
        .attr("x", 20)
        .attr("y", 190)
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-family", "monospace")
        .style("fill", "white")

d3.csv("node-data4.csv").then(function (data) {
    var colorScale = ["#FFBF00", "#FF7F50", "#6495ED", "#008000", "#DE3163"];
    var xCenter = [120, 400, 660, 840, 1000];

    var numNodes_dict = {email: 0, SSN: 0, CreditCard: 0, PersonalDetails: 0, FullDetails: 0}
    var numNodes_arr = [0, 0, 0, 0, 0]

    var c = 0;
    var nodes1 = data.map(function(d) {
        switch (d.data_sensitivity) {
            case "email":
                numNodes_dict.email = numNodes_dict.email+1;
                numNodes_arr[0] = numNodes_arr[0] + 1;
                c = 0;
                break;
              case "SSN":
                numNodes_dict.SSN = numNodes_dict.SSN + 1
                numNodes_arr[1] = numNodes_arr[1] + 1
                c = 1;
                break;
              case "Credit Card":
                numNodes_dict.CreditCard = numNodes_dict.CreditCard + 1
                numNodes_arr[2] = numNodes_arr[2] + 1
                c = 2;
                break;
              case "Personal Details":
                numNodes_dict.PersonalDetails = numNodes_dict.PersonalDetails + 1
                numNodes_arr[3] = numNodes_arr[3] + 1
                c = 3;
                break;
              case "Full Details":
                numNodes_dict.FullDetails = numNodes_dict.FullDetails + 1
                numNodes_arr[4] = numNodes_arr[4] + 1
                c = 4;
                break;
        }

        return {radius: d.size/10000000,
                category: c,
                name: d.name,
                year: d.year}
    });

    var simulation = d3.forceSimulation(nodes1)
                       .force('charge', d3.forceManyBody().strength(5))
                       .force('x', d3.forceX().x(function(d) {
                            return xCenter[d.category];
                        }))
                       .force('collision', d3.forceCollide().radius(function(d) {
                            return d.radius+1;
                        }))
                       .on('tick', ticked);

    function ticked() {
        var u = d3.select('svg g')
                  .selectAll('circle')
                  .data(nodes1)
                  .join('circle')
                  .attr('r', function(d) {
                    console.log(d.radius)
                    return d.radius;
                  })
                  .style('fill', function(d) {
                    return colorScale[d.category];
                  })
                  .attr('cx', function(d) {
                    return d.x - 100;
                  })
                  .attr('cy', function(d) {
                    return d.y;
                  })
                  .on('mouseover', function(d) {
                        var c = d3.selectAll("circle")
                            .transition()
                            .duration('50')
                            .attr('opacity', '1');

                        for (let index = 0; index < c._groups[0].length; index++) {
                            var element = c._groups[0][index].__data__.category;
                            var f = c._groups[0][index]

                            if (element === d.category) {
                                d3.select(f)
                                    .transition()
                                    .duration('50')
                                    .attr('opacity', '0.2')
                            }
                        }
                            
                        d3.select(this)
                          .transition()
                          .duration('50')
                          .attr('opacity', '1')

                    text.transition().text("Company: " + d.name);
                    let rv = nodes1.find(o => o.name === d.name);
                    text1.transition().text("Records Lost: " + formatNumber(rv.radius*10000000));
                    text2.transition().text("Year: " + d.year);
                  })
                  .on('mouseout', function(d) {
                        d3.selectAll("circle")
                            .transition()
                            .duration('50')
                            .attr('opacity', '1');

                    text.transition().text("");
                    text1.transition().text("");
                    text2.transition().text("");
                  })
    }
})
