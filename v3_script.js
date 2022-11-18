var models = [
    {
      "model_name":"Twitter",
      "field1":150000000,
      "field2":190000000
    },
    {
      "model_name":"LinkedIn",
      "field1":260000000,
      "field2":180000000
    },
    {
      "model_name":"Amazon",
      "field1":200000000,
      "field2":290000000
    },
    {
      "model_name":"Facebook",
      "field1":190000000,
      "field2":350000000
    },
    {
      "model_name":"Microsoft",
      "field1":300000000,
      "field2":170218805
    }
  ];

  models = models.map(i => {
    i.model_name = i.model_name;
      return i;
  });

  var container = d3.select('#viz3'),
      width = 600,
      height = 400,
      margin = {top: 30, right: 20, bottom: 30, left: 100},
      barPadding = .5,
      axisTicks = {qty: 8, outerSize: 0};

  var svg = container
     .append("svg")
     .attr("width", width)
     .attr("height", height)
     .append("g")
     .attr("transform", `translate(${margin.left},${margin.top})`);
  
    function formatNumber(num) {
        if(num > 999 && num < 1000000){
            return (num/1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million 
        }else if(num > 1000000){
            return (num/1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million 
        }else if(num < 900){
            return num; // if value < 1000, nothing to do
        }
    }
    

  var xScale0 = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(barPadding);
  var xScale1 = d3.scaleBand();
  var yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);
  
  var xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
  var yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize)
                .tickFormat(function(d) {
                    var s = formatNumber(d / 1e6);
                    return this.parentNode.nextSibling
                        ? "\xa0" + s
                        : "$" + s + " million";
                  });
  
  xScale0.domain(models.map(d => d.model_name));
  xScale1.domain(['field1', 'field2']).range([0, xScale0.bandwidth()]);
  yScale.domain([0, d3.max(models, d => d.field1 > d.field2 ? d.field1 : d.field2)]);

  // gridlines in y axis function
  function make_y_gridlines() {		
        return d3.axisLeft(yScale)
  }
  var model_name = svg.selectAll(".model_name")
    .data(models)
    .enter().append("g")
    .attr("class", "model_name")
    .attr("transform", d => `translate(${xScale0(d.model_name)},0)`);
  
  /* Add field1 bars */
  model_name.selectAll(".bar.field1")
    .data(d => [d])
    .enter()
    .append("rect")
    .attr("class", "bar field1")
  .style("fill","#69b3a2")
    .attr("x", d => xScale1('field1'))
    .attr("y", d => yScale(d.field1))
    .attr("width", xScale1.bandwidth())
    .attr("height", d => {
      return height - margin.top - margin.bottom - yScale(d.field1)
    });
    
  /* Add field2 bars */
  model_name.selectAll(".bar.field2")
    .data(d => [d])
    .enter()
    .append("rect")
    .attr("class", "bar field2")
  .style("fill","#404080")
    .attr("x", d => xScale1('field2'))
    .attr("y", d => yScale(d.field2))
    .attr("width", xScale1.bandwidth())
    .attr("height", d => {
      return height - margin.top - margin.bottom - yScale(d.field2)
    });

  svg.append("g")			
    .attr("class", "grid")
    .call(make_y_gridlines()
    .tickSize(-width)
    .tickFormat(""))
    
  // Add the X Axis
  svg.append("g")
     .attr("class", "x axis")
     .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
     .call(xAxis);
  
  // Add the Y Axis
  svg.append("g")
     .attr("class", "y axis")
     .call(yAxis);

  svg.append("circle").attr("cx",50).attr("cy",20).attr("r", 6).style("fill", "#69b3a2")
  svg.append("circle").attr("cx",50).attr("cy",40).attr("r", 6).style("fill", "#404080")
  svg.append("text").attr("x", 60).attr("y", 20).text("Cyber Funds").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 60).attr("y", 40).text("Financial Lost").style("font-size", "15px").attr("alignment-baseline","middle")