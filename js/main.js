//ADRIAN RODRIGUEZ-FEBRES.
var svg = d3.select('svg');
var width = +svg.attr('width');
var height = +svg.attr('height');
var padding = {top : 60, bottom: 60, right: 60, left : 60};
var myWidth = width - (padding.left + padding.right);
var myHeight = height - (padding.top + padding. bottom);
var chartG = svg.append('g')
    .attr('class', 'bubbles')
    .attr('transform', 'translate(' + [padding.left, padding.top] + ')');


// Creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider").on('change', function(event){
    // Update the chart on the new value
    updateChart(event.value.newValue);
});

// Color mapping based on continents
var contintentColors = {Asia: '#fc5a74', Europe: '#fee633',
    Africa: '#24d5e8', Americas: '#82e92d', Oceania: '#fc5a74'};

chartG.selectAll('.background')
    .data(['q1']) //Background square, neato.
    .enter()
    .append('rect')
    .attr('class', 'background')
    .attr('width', myWidth)
    .attr('height', myHeight);

d3.csv('./data/gapminder.csv',
    function(d){
        // This callback formats each row of the data
        return {
            country: d.country,
            year: +d.year,
            population: +d.population,
            continent: d.continent,
            lifeExp: +d.lifeExp,
            gdpPercap: +d.gdpPercap
        }
    },
    function(error, dataset){
        if(error) {
            console.error('Error while loading ./gapminder.csv dataset.');
            console.error(error);
            return;
        }

        myData = dataset;

        // **** Set up your global variables and initialize the chart here ****
        var lifeExpDomain = d3.extent(dataset, function(entry) {
            return entry.lifeExp;
        })
        var gdpPercapDomain = d3.extent(dataset, function(entry) {
            return entry.gdpPercap;
        })
        var populationDomain = [0, d3.max(dataset, function(entry) {
            return entry.population;
        })];

        xScale = d3.scaleLog()
            .domain(gdpPercapDomain)
            .range([0,myWidth]);
        yScale = d3.scaleLinear()
            .domain(lifeExpDomain)
            .range([myHeight, 0]);
        rScale = d3.scaleSqrt()
            .domain(populationDomain)
            .range([0, 50]);

        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(30,' + padding.top + ')')
            .call(d3.axisLeft(yScale).ticks(12));

        var roundMe = function(d) {
            return parseInt(d);
        };

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(30,' + (myHeight + padding.bottom) +')')
            .call(d3.axisBottom(xScale).ticks(8).tickFormat(roundMe));

        svg.append('text')
            .attr('class', 'y axis-label')
            .attr('transform', 'translate('+ (padding.left - 25) + ',' + 30 +')')
            .text('Life Expectancy, years');

        svg.append('text')
            .attr('class', 'x axis-label')
            .attr('transform', 'translate('+ (myWidth / 2 - 40) + ',' + (myHeight + padding.bottom + 40) +')')
            .text('Income Per Person, GDP/capita in $');

        xGridScale = d3.scaleLinear()
            .domain(gdpPercapDomain)
            .range([0, myWidth]);

        yGridScale = d3.scaleLinear()
            .domain(lifeExpDomain)
            .range([myHeight, 0]);

        var xGrid = d3.axisTop(xGridScale)
        .tickSize(-myHeight, 0, 0)
        .tickFormat('');
        var yGrid = d3.axisLeft(yGridScale)
        .tickSize(-myWidth, 0, 0)
        .tickFormat('');

        chartG.append('g')
        .attr('class', 'x grid')
        .call(xGrid);
        chartG.append('g')
        .attr('class', 'y grid')
        .call(yGrid);

        updateChart(1952);
    });

function updateChart(year) {
    // **** Update the chart based on the year here ****
    var dataForYear = myData.filter(function(d) {
        return d.year == year;
    });

    var reselectBubbles = chartG.selectAll('.bubble')
        .data(dataForYear, function(d) {
            return d.country;
        });

    var newBubbles = reselectBubbles.enter()
        .append('circle')
        .attr('class', 'bubble')
        .attr('cx', function(d) {
            return xScale(d.gdpPercap);
        })
        .attr('cy', function(d) {
            return yScale(d.lifeExp);
        })
        .attr('r', function(d) {
            return rScale(d.population);
        })
        .style('fill', function(d) {
            return contintentColors[d.continent];
        })
        .style('stroke', '#000000');

    reselectBubbles.merge(newBubbles)
        .transition().duration(200)
        .attr('cx', function(d) {
            return xScale(d.gdpPercap);
        })
        .attr('cy', function(d) {
            return yScale(d.lifeExp);
        })
        .attr('r', function(d) {
            return rScale(d.population);
        });

    reselectBubbles.exit().remove();

}
