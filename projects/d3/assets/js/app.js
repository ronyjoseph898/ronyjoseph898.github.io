var svgWidth = 960;
var svgHeight = 500;

var chartMargin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 50
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);


var chosenXAxis = "poverty";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, chartWidth]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderCircleLabels(circleLabelsGroup, newXScale, chosenXAxis) {
  circleLabelsGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circleLabelsGroup;
}

function updateToolTip(chosenXAxis, circlesGroup) {
  var label = function(d){
    if (chosenXAxis === 'poverty') 
      return `In Poverty: ${d}%`
    else if (chosenXAxis === 'age')
      return `Median Age: ${d} years`
    else if (chosenXAxis === 'income')
      return `Household Income: $${numberWithCommas(d)}`
  }
    
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label(d[chosenXAxis])} <br> Lacks Healthcare: ${d.healthcare}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


var url = "https://raw.githubusercontent.com/mkung8889/d3/master/assets/data/data.csv"
d3.csv(url)
  .then(function(newsData) {
  newsData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  var xLinearScale = xScale(newsData, chosenXAxis);

  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(newsData, d => d.healthcare)])
    .range([chartHeight, 0]);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(newsData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", 0.75)
    .attr("stroke-width", "1")

  var circleLabelsGroup = chartGroup.selectAll('circle')
    .enter()
    .exit()
    .data(newsData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.healthcare))
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr('font-size', "9px")
    .attr("dy", ".3em")
    .text(d => d.abbr)
       
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth/2}, ${chartHeight+15})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 45)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 65)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");    

 
  var healthcareLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - chartMargin.left)
    .attr("x", 0 - (chartHeight/2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  var circleLabelsGroup = updateToolTip(chosenXAxis, circleLabelsGroup);

  labelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");

      if (value !== chosenXAxis) {
        chosenXAxis = value;

        xLinearScale = xScale(newsData, chosenXAxis);

        xAxis = renderAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        circleLabelsGroup = renderCircleLabels(circleLabelsGroup, xLinearScale, chosenXAxis)

        circleLabelsGroup = updateToolTip(chosenXAxis, circleLabelsGroup);
        
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);            
        }
        else if (chosenXAxis == "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis == "income") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }        
      }
    });
});

