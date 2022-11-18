function bubbleChart() {
    const width = 500;
    const height = 500;
  
    // location to centre the bubbles
    const centre = { x: width/2, y: height/2 };
  
    // strength to apply to the position forces
    const forceStrength = 0.03;
  
    // these will be set in createNodes and chart functions
    let svg = null;
    let bubbles = null;
    let labels = null;
    let nodes = [];
  
    // charge is dependent on size of the bubble, so bigger towards the middle
    function charge(d) {
      return Math.pow(d.radius, 2.0) * 0.01
    }
  
    // create a force simulation and add forces to it
    const simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(charge))
      .force('center', d3.forceCenter(centre.x, centre.y))
      .force('x', d3.forceX().strength(forceStrength).x(centre.x))
      .force('y', d3.forceY().strength(forceStrength).y(centre.y))
      .force('collision', d3.forceCollide().radius(d => d.radius));
  
    // force simulation starts up automatically, which we don't want as there aren't any nodes yet
    simulation.stop();
  
    // set up colour scale
    const fillColour = d3.scaleOrdinal()
        .domain(["email", "SSN", "Credit Card","Personal Details", "Full Details"])
        .range(["#DAF7A6", "#FFC300", "#FF5733", "#C70039", "#6495ED"]);
  
    // data manipulation function takes raw data from csv and converts it into an array of node objects
    // each node will store data and visualisation values to draw a bubble
    // rawData is expected to be an array of data objects, read in d3.csv
    // function returns the new node array, with a node for each element in the rawData input
    function createNodes(rawData) {
      // use max size in the data as the max in the scale's domain
      // note we have to ensure that size is a number
      const maxSize = d3.max(rawData, d => +d.size);
  
      // size bubbles based on area
      const radiusScale = d3.scaleSqrt()
        .domain([0, maxSize])
        .range([0, 80])
  
      // use map() to convert raw data into node data
      const myNodes = rawData.map(d => ({
        ...d,
        radius: radiusScale(+d.size),
        size: +d.size,
        x: Math.random() * 900,
        y: Math.random() * 800
      }))
  
      return myNodes;
    }
  
    // main entry point to bubble chart, returned by parent closure
    // prepares rawData for visualisation and adds an svg element to the provided selector and starts the visualisation process
    let chart = function chart(selector, rawData) {
      // convert raw data into nodes data
      nodes = createNodes(rawData);
  
      // create svg element inside provided selector
      svg = d3.select(selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
  
      // bind nodes data to circle elements
      const elements = svg.selectAll('.bubble')
        .data(nodes, d => d.name)
        .enter()
        .append('g')
  
      bubbles = elements
        .append('circle')
        .classed('bubble', true)
        .attr('r', d => d.radius)
        .attr('fill', d => fillColour(d.data_sensitivity))
  
      // labels
      labels = elements
        .append('text')
        .attr('dy', '.3em')
        .style('text-anchor', 'middle')
        .style('font-size', 10)
        .text(d => d.name)
  
      // set simulation's nodes to our newly created nodes array
      // simulation starts running automatically once nodes are set
      simulation.nodes(nodes)
        .on('tick', ticked)
        .restart();
    }
  
    // callback function called after every tick of the force simulation
    // here we do the actual repositioning of the circles based on current x and y value of their bound node data
    // x and y values are modified by the force simulation
    function ticked() {
      bubbles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
  
      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    }
  
    // return chart function from closure
    return chart;
}
  
  // new bubble chart instance
  let myBubbleChart = bubbleChart();
  
  // function called once promise is resolved and data is loaded from csv
  // calls bubble chart function to display inside #vis div
  function display(data) {
    // A function that update the chart
    function update(selectedGroup) {
        var svg = d3.select("#viz1");
        svg.selectAll("*").remove();

        var dataFilter = data.filter(function(el) {
            return el.year == selectedGroup
        })
        myBubbleChart('#viz1', dataFilter);
    }
    
   var allGroup = ["2022", "2021", "2020", "2019", "2018"]
    
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button
    
    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })
  }
  
  // Visualization 1: Bubble chart
  d3.csv('node-data.csv').then(display);