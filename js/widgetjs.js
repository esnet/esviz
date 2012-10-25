/*!
 * MYESNET Javascript framework v1.0.0
 *
 * Author : Gopal Vaswani
 * Date: 
 */

/**
 * The top-level myesnet js namespace <tt>myesnet</tt> namespace.
 *
 * @namespace The top-level myesnet Js namespace, <tt>myesnet</tt>.
 */
window.myesnet = window.myesnet || {};
window.myesnet.widgets = window.myesnet.widgets || {};
window.myesnet.utiliites = window.myesnet.utiliites || {};
(function() {
  ////////// OOPS HELPER : John Resig's solution /////////

  /* Simple JavaScript Inheritance
   * By John Resig http://ejohn.org/
   * MIT Licensed.
   */
  // Inspired by base2 and Prototype
  (function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    this.Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
      var _super = this.prototype;

      // Instantiate a base class (but only create the instance,
      // don't run the init constructor)
      initializing = true;
      var prototype = new this();
      initializing = false;

      // Copy the properties over onto the new prototype
      for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" && 
          typeof _super[name] == "function" && fnTest.test(prop[name]) ?
          (function(name, fn){
            return function() {
              var tmp = this._super;

              // Add a new ._super() method that is the same method
              // but on the super-class
              this._super = _super[name];

              // The method only need to be bound temporarily, so we
              // remove it when we're done executing
              var ret = fn.apply(this, arguments);        
              this._super = tmp;

              return ret;
            };
          })(name, prop[name]) :
          prop[name];
      }

      // The dummy class constructor
      function Class() {
        // All construction is actually done in the init method
        if ( !initializing && this.init ) {this.init.apply(this, arguments);}
      }

      // Populate our constructed prototype object
      Class.prototype = prototype;

      // Enforce the constructor to be what we expect
      Class.constructor = Class;

      // And make this class extendable
      Class.extend = arguments.callee;

      return Class;
    };
  })();


	/**
	* AbstractWidget class
	*
	* @param {Object} element DOM element
	*/
	AbstractWidget = Class.extend({
		init: function(config){
			//Common Widget configurations
		},
		
		update : function(){}	
	});/**
* speedometerWidget class
*
* @param {Object} element DOM element
*/
myesnet.widgets.speedometerWidget = AbstractWidget.extend({
	init : function(config){
		this._super(config);
		this.speedo_config = { current_data : {value:0} };
		this.container = config.container;
		var min = config.min === undefined ? 0: config.min; //default min is 0
    var max = config.max === undefined ? 100 :config.max; //default max is 100
    var inradius = config.inradius === undefined?  0 : config.inradius; //default inradius is 0
    var outradius = config.outradius === undefined?  30 : config.outradius; ////default outradius is 30
    var start_angle = config.start_angle === undefined?  -Math.PI/2 : config.start_angle; ////default outradius is -Math.PI/2
    var end_angle = config.end_angle === undefined?  Math.PI/2 : config.end_angle; ////default outradius is -Math.PI/2

    var H = 80; //H is the size of the box containing the speedometer
    //Scale  
    var speedo_scale = d3.scale.linear()
      .domain([min, max])
      .range([start_angle, end_angle]);

    //Arc generator For the background full semi-circle
    var bgarc = d3.svg.arc()
      .innerRadius(inradius)
      .outerRadius(outradius)
      .startAngle(start_angle).endAngle(end_angle);
    //Arc generator For the forground status semi-circle
    var fgarc = d3.svg.arc()
      .innerRadius(inradius)
      .outerRadius(outradius)
      .startAngle(start_angle)
      .endAngle(function(d) { 
        return speedo_scale(d.value);
        });

    var w = outradius*2; 
    var remaining_h = Math.cos( (2*Math.PI - (end_angle - start_angle))/2 ) * outradius;
    var h = outradius + remaining_h;

    var text_data_width = 130;

    this.speedometer = d3.select("#"+ this.container)
      .append("svg:svg")
        .attr("width", w + text_data_width).attr("height", H).attr("pointer-events", "all");

    this.speedometer.append("svg:rect")
      .attr("height", H).attr("width", w + text_data_width)
      .style("fill", "#f2f2f2");

    var dial = this.speedometer.append("svg:g")
      .attr("transform",  "translate(" + (w/2 + 5)+ "," + H + ")")
      .attr("class","dial");

    //The background semi-circle 
    dial.selectAll('path')
      .data([1])
      .enter().append('svg:path')
        .attr("class", "background")
        .attr("d", bgarc);

    //The foreground semi-circle placeholder
    dial.append('svg:path')
        .attr("class", "foreground");

    this.speedo_config.arcTween = function(b) {
      var i = d3.interpolate({value: b.previous}, b);
      return function(t) { 
        return fgarc(i(t));
        };
    };

    var text = this.speedometer.append('svg:g')
      .attr("transform",  "translate(" + (w+5) + ","+ h +")");

    text.append("svg:text")
      .attr("class", "current_data")
      .attr('dy',"27").attr('dx',"15");
    text.append("svg:text")
      .attr("class", "unit")
      .attr('dy',"25").attr('dx',"80")
      .text("GBPS")
      .style('font-size', '14px');
	},
	update : function(data){
	  this._super();
	  data.previous = this.speedo_config.current_data.value;
    this.speedo_config.current_data = data;
    var path = this.speedometer.select(".dial").select("path.foreground")
         .data([data]);

    path.transition()
      .ease("linear")
      .duration(750)
      .attrTween("d", this.speedo_config.arcTween);

    path.exit().transition()
      .ease("linear")
      .duration(750)
      .attrTween("d", this.speedo_config.arcTween)
      .remove();

    this.speedometer.selectAll("text.current_data")
      .data([data])
      .text(function(d){
        var x = d3.round(data.value);
        return x/10 >= 1 ? x : ("0"+x);
        });
	}
});/**
* trackerWidget class
*
* @param {Object} element DOM element
*/
myesnet.widgets.AreagraphWidgetwithTracker = AbstractWidget.extend({
	init : function(config){
	  this._super(config);
	  this.container = config.container;
		this.tracker_config = {};
	  var w = config.w === undefined ? 130: config.w; //default width is 122
    var h = config.h === undefined ? 122: config.h; //default height is 122
    var p = config.p === undefined ? 2: config.p; //default height is 2;
    var nr = config.nr === undefined ? 10: config.nr; //default rows is 10
    var nc = config.nc === undefined ? 10: config.nc; //default columns is 10
    var M = config.M === undefined ? 10000: config.M; //default max-size(M) is 10
    var cz = config.cz === undefined ? 10: config.cz; //default columns is 10
    
    var px = (w - cz*nc)/(nc+1); // x padding
    var py = (h - cz*nr)/(nr+1); // y padding
    
    //console.log("cell size (px)", cz);
    
    var czbyt = M/(nr*nc); //Each cell size in bytes
    //console.log("cell size (bytes)", czbyt);
    
    this.tracker_config.px = px;
    this.tracker_config.py = py;
    this.tracker_config.cz = cz;
    this.tracker_config.czbyt = czbyt;
    this.tracker_config.nc = nc;
    this.tracker_config.h = h;

	  this.tracker = d3.select("#"+this.container)
      .append("svg:svg")
        .attr("width", w).attr("height", h).attr("pointer-events", "all");
        
    this.tracker.append("svg:rect")
      .attr("height", h).attr("width", w)
      .style("fill", "#f2f2f2");
      
    this.tracker.append("svg:g")
      .attr('class', 'box');   

    var slider = this.tracker.append("svg:g")
      .attr('class', 'slider');
    
	},
	update : function(data){
    this._super();
    //For a data received at a particular time
    var cells_needed = parseInt(data/this.tracker_config.czbyt, 10);
    //console.log("cells needed", cells_needed);
    var nc = this.tracker_config.nc;
        
    var full_rows_needed = parseInt(cells_needed/nc, 10);
    //console.log("full rows needed", full_rows_needed)
    var grid_data = d3.range(0,full_rows_needed).map(function(d){
      return d3.range(0,nc);
      });
    if(cells_needed%nc > 0){
      grid_data.push(d3.range(0, cells_needed%nc)); //Add the final row with fewer cells than the maximum.
    }
    
    var rows  = this.tracker.select('.box').selectAll(".row")
      .data(grid_data);

    // to avoid 'this' keyword conflict in d3 js
    var that = this; 
    
    rows.enter().append('svg:g')
      .attr('class', 'row')
      .attr("transform", function(d,i){
        var y_from_top = that.tracker_config.h - (i * that.tracker_config.cz + (i+1) * that.tracker_config.py) - that.tracker_config.cz;
        return "translate(0," + y_from_top + ")";
        });
    
    var cells = rows.selectAll(".cell")
      .data(function(d,i){return d;});
      
    cells.enter().append("svg:rect")
      .attr("width", this.tracker_config.cz).attr("height", this.tracker_config.cz)
      .attr("x", function(d,i){ 
        return i*that.tracker_config.cz + (i+1) *that.tracker_config.px;
        })
      .style('fill', '#1a5479');
    
	}
});
/**
* Areagraph  class
*
* @param {Object} config configuration parameters for the area graph
* @param {String} config.element DOM element
* @param {Object} config.intial_data initail data: keys are x values, values are y values: {x1:y1, x2:y2, x3:y3 ...}
* @param {Number} config.w the width of the graph in pixels
* @param {Number} config.h the height of the graph in pixels
*/
myesnet.widgets.Areagraph = AbstractWidget.extend({
	init : function(config){
	  var that = this;
	  this.cfg ={};
	  
	  //Widget Data
	  var stack = d3.layout.stack();
	  if(!config.stacked){
	    stack.out(function out(d, y0, y) {
        d.y0 = 0; //make the baseline 0 for all layers
        d.y = y;
      })
	  }
	  this.cfg.initial_data = config.initial_data.map(function(d,i){ return stack(d); })
	  this.cfg.extent = [0,this.cfg.initial_data[0][0].length]
    this.cfg.color_mapping = config.color_mapping;
    this.cfg.legendnames = config.legends || [['L0', 'L1'], ['L2', 'L3']];
    this.cfg.legendnames = d3.merge(this.cfg.legendnames);
    this.cfg.yformat = config.yformat || d3.format(".1s");
    
    //max value across all layers
	  this.cfg.max = config.max || d3.max(this.cfg.initial_data.map(function(d,i){ 
      return d3.max(d3.merge(d).map(function(d,i){ 
        return Math.abs(d.y0 + d.y);
        }));
      }));
    
    this.cfg.datasize = this.cfg.initial_data[0][0].length;
    this.cfg.current_data = $.extend(true, [], this.cfg.initial_data);
    var widget_top_bar_height = 20;
	  
	  //Widget Properties
	  this.container = config.container;
	  this.cfg.m = config.margins || [5,40,30,5]; //Margins are specified in the css margin order [top, right, bottom, left]
	  this.cfg.h = config.h;
    this.cfg.w = config.w;
	  
	  /*Draw the skeleton area graph*/
	  this.cfg.padding = 5;
    //Container
    d3.select("#"+this.container)
      .style("width", this.cfg.w + (this.cfg.m.right + this.cfg.m.left) +"px")
      .style("height", this.cfg.h + this.cfg.m.top + this.cfg.m.bottom + 2*this.cfg.padding + "px");
    
	  //SVG Canvas
	  this.areagraph = d3.select("#"+this.container).append("svg:svg")
      .attr("width", this.cfg.w + (this.cfg.m.right + this.cfg.m.left))
      .attr("height", this.cfg.h + (this.cfg.m.top + this.cfg.m.bottom + 2*this.cfg.padding))
      .append("svg:g")
        .attr("transform", "translate(" + this.cfg.m.left + "," + this.cfg.m.top + this.cfg.padding + ")")
        .attr("pointer-events", "all")
        .attr("class", "areagraph");
	  
	  
	  /* Scales */
    //xscale
    this.cfg.xdata = this.cfg.initial_data[0][0].map(function(d,i){return parseInt(d.x) }); //Time data which is same for all layers
    this.cfg.xscale = d3.time.scale();
    var sdate =  new Date(this.cfg.xdata[0]);
    var edate =  new Date(this.cfg.xdata[this.cfg.xdata.length-1]);
    this.cfg.xscale.domain([sdate, edate]).range([0, this.cfg.w]);
    
    this.cfg.index_position_mapping = d3.scale.linear().domain([0,that.cfg.w]).range(that.cfg.extent);
    
    //xposition scale
    this.cfg.xpos_scale = d3.scale.linear().domain([0, this.cfg.initial_data[0][0].length]).range([0, this.cfg.w]);
    //yscale
    this.cfg.yscale = d3.scale.linear()
      .domain([this.cfg.max,0])
      .range([0, this.cfg.h]);

	  //If top and bottom: modify the scale and bottom layers data
	  if(this.cfg.initial_data.length>1){
	    this.cfg.yscale
	      .domain([this.cfg.max, 0, -this.cfg.max])
	      .range([0, this.cfg.h/2, this.cfg.h]);
      this.cfg.initial_data[1].map(function(bottomlayers, i){
        bottomlayers.map(function(d,i){ d.y0 = -d.y0;  d.y = -d.y;  return d;});
      });
    }
    
    /* Render the graph*/
    //Clip
    this.areagraph.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", this.cfg.w)
        .attr("height", this.cfg.h);
    
    //Area generator
    this.cfg.area = d3.svg.area()
      //.x(function(d,i) { return that.cfg.xscale(new Date(parseInt(d.x))); })
      .x(function(d,i) { return that.cfg.xpos_scale(i); })
      .y0(function(d) { return that.cfg.yscale(d.y0); })
      .y1(function(d) { return that.cfg.yscale(d.y+d.y0); })
      .interpolate("step-after");
    
    this.cfg.initial_data.map(function(data,I){
      var klass = I===0? "up" : "down";
      that.areagraph.selectAll(klass)
        .data(data)
        .enter().append('svg:path')
          .attr("clip-path", "url(#clip)")
          .attr("class", "graph")
          .attr("d", that.cfg.area)
          .style("fill", function(d,i) {return that.cfg.color_mapping[I][i];});
      })
	  
	  //Tracker skeleton
	  var tracker = this.areagraph.append('svg:g')
      .attr('class', 'tracker')
      .style('display', 'none');
    
    tracker.append("svg:line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", this.cfg.h)
      .attr("stroke", "red");
  
    // tracker.selectAll(".label_rect")
    //   .data(this.cfg.initial_data)
    //   .enter()
    //     .append("svg:rect")
    //     .attr("class", "label_rect")
    //     .attr("width", 50).attr("height", 20)
    //     .attr("y", function(d,i){return i===0? 0 : that.cfg.h - 20});
    
    tracker.selectAll(".tracker_label")
      .data(this.cfg.initial_data)
      .enter()
        .append("svg:text")
        .attr("class", "tracker_label")
        .attr("y", function(d,i){return i===0? 12 : that.cfg.h-3});
    
    this.add_yaxis(config);    
    this.add_tracker(config);
    this.add_brushedZoom(config);
  },
  
  add_xaxis : function(config){
    var that = this;
    /*X axis (time)*/
	  this.cfg.convert_to_date = function (s){
	    var txt = s.selectAll("g")
	      .selectAll("text");
	    txt.text("");
	    txt.append("svg:tspan")
	      .text(function(d,i){
	        if(!that.cfg.xdata[d]){d=d-1;}
	        return d3.time.format("%H:%M")(new Date(that.cfg.xdata[Math.round(d)])) 
	        })
      txt.append("svg:tspan")
	      .text(function(d,i){
	        if(!that.cfg.xdata[d]){d=d-1;}
	        return d3.time.format("%b %d")(new Date(that.cfg.xdata[Math.round(d)])) 
	        })
	      .attr("dy", 10).attr("dx", -30)
	  }	  
	  
	  //Generator
	  this.cfg.xAxis = d3.svg.axis()
      .tickSize(-this.cfg.h)
      .ticks(10)
    //assign the scale to the axis generator
    this.cfg.xAxis.scale(this.cfg.xpos_scale);
    //generate the Xaxis
    this.areagraph.append("svg:g")
      .attr("transform", "translate(0" +  "," + this.cfg.h + ")")
      .attr("class", "x axis")
      .attr("opacity", "0.7")
      .call(this.cfg.xAxis).call(this.cfg.convert_to_date);
  },
  
  add_yaxis : function(config){
    var that = this;
    /*Yaxis*/
    this.cfg.yAxis = d3.svg.axis()
      .orient("right")
      .tickFormat(this.cfg.yformat);
    //Set the Yscale and render the yaxis
    this.cfg.yAxis.scale(this.cfg.yscale)
    
    this.areagraph.append("svg:g")
     .attr("class", "y axis")
     .attr("transform", "translate(" + this.cfg.w + ",0)")
     .call(this.cfg.yAxis)
     .call(function(s){
       s.selectAll("g").selectAll("text").text(function(d,i){
         return that.cfg.yformat(Math.abs(d));
         })
      });
      
  },
  
  
  add_labels : function(config){
    var that = this;
    //Xaxis Label
    this.cfg.xlabel = config.xlabel || "Time";
    this.areagraph.append("svg:g")
      .attr("transform", "translate(0" +  "," + (this.cfg.h + this.cfg.m.bottom -15) + ")")
      .append("svg:text")
        .attr("class", "xaxis_label")
        .attr("x", this.cfg.w/2)
        .attr("dy", -3)
        .attr("text-anchor", "middle")
        .text(this.cfg.xlabel)
    //Yaxis label
    this.cfg.ylabel = config.ylabel || "Traffic";
    this.areagraph.append("svg:g")
      .attr("transform", "translate(" + (this.cfg.w + this.cfg.m.right - 5) +  "," + "0)")
      .append("svg:text")
        .attr("class", "yaxis_label")
        .attr("y", this.cfg.h/2)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90,0,"+  this.cfg.h/2 + ")")
        .text(this.cfg.ylabel)  
  },
  
  add_top_bar : function(widget_top_bar_height){
    var that = this;
    //Add the widget controls (refresh and zoom reset)
    d3.select("#"+this.container)
      .style("height", this.cfg.h + (this.cfg.m.top + this.cfg.m.bottom + widget_top_bar_height) + "px");
    
    this.cfg.top_bar = d3.select("#"+this.container).append("div")
      .attr("class", "widget_bar");
    
    this.cfg.legends = this.cfg.top_bar.append("div")
      .attr("class", "legends")
      .selectAll(".legend")
        .data(
          d3.merge(this.cfg.color_mapping)
            .map(function(d,i){
              return {k:i, v:d}
            })
          )
        .enter()
          .append("div").attr("class", "legend");
          
    this.cfg.legends.append("div")
      .attr("class", "lsymbol")
      .style("background", function(d,i){return d.v})      
    this.cfg.legends.append("div")
      .attr("class", "ltext")
      .text(function(d,i){return that.cfg.legendnames[i]})
    
    this.cfg.top_bar.append("div")
      .style("float", "right")
      .append("a")
      .attr("href", "#")
      .attr("id", "reset_zoom")
      .attr("class", "control")
      .text("Reset zoom")
      .on("click", function(){
        d3.event.preventDefault();
        that.reset();
        })
  },
  
  add_tracker : function(config){
    var that = this;
    /*Tracker*/
    this.areagraph.on("mousemove", mousemove);
    this.areagraph.on('mouseout', function(d){
      d3.selectAll(".tracker").style('display', 'none')
    });
    
    //var merged_data = d3.merge(that.cfg.initial_data);
    //var ltexts = that.cfg.legends.selectAll(".ltext");
    
    function mousemove(){
      //var trackers = this.areagraph.selectAll(".tracker");
      var trackers = d3.selectAll(".tracker")
      var xpos = d3.svg.mouse(this)[0];
      //do not exceed the xposition more than graph width (for some reason)
      xpos = xpos > that.cfg.w ? that.cfg.w : xpos;
      var ypos = d3.svg.mouse(this)[1];
      var xindex = parseInt(that.cfg.index_position_mapping(xpos));
      trackers.style('display', 'block');
      
      trackers.each(function(d,i){
        d3.select(this).attr('transform', function(){
          return 'translate(' + xpos + ', 0)';
          });
        d3.select(this).selectAll('.tracker_label')
          .attr('x', function(d,i){return xpos > (that.cfg.w * 2/3) ? -5 : 5 ; })
          .attr('text-anchor', function(){ return xpos > (that.cfg.w * 2/3) ? 'end' : 'start'; })
          .text(function(d,i){
            return d.map(function(d,i){
              return d3.format(".3s")(Math.abs(d[xindex].y))
              }).join("  ");
          });
      })
      // var xindex = parseInt(that.cfg.index_position_mapping(xpos));
      // that.cfg.tracker.selectAll(".label_rect")
      //   .attr("x", function(){ 
      //     return xpos > (that.cfg.w * 2/3) ? -52 : 2 ;
      //     })
      // that.cfg.tracker.selectAll('.tracker_label')
      //   .attr('x', function(d,i){ return xpos > (that.cfg.w * 2/3) ? -5 : 5 ; })
      //   .attr('text-anchor', function(){ return xpos > (that.cfg.w * 2/3) ? 'end' : 'start'; })
      //   .text(function(d,I){
      //     return that.cfg.initial_data[I].map(function(d,i){
      //       return that.cfg.yformat(Math.abs(d[xindex].y))
      //       }).join("  ");
      //   });
      //Bound the values to the legends.
      // ltexts.text(function(d,i){
      //   return that.cfg.yformat(Math.abs(merged_data[d.k][xindex].y));
      // })
      
    }    
  },
  
  add_brushedZoom: function(config){	  
    var that = this;
	  /*BRUSH*/
    this.cfg.brush = d3.svg.brush()
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);
    
    var brshs = d3.selectAll(".areagraph").append("g")
        .attr("class", "brush");
        
    brshs.call(this.cfg.brush.x(this.cfg.xpos_scale))
    brshs.selectAll("rect")
        .attr("height", this.cfg.h);
  
    function brushstart(){
    }
    function brushmove(){
      brshs.style("opacity", ".8");
      var s = d3.event.target.extent();
      }
    function brushend(){
      if(!that.cfg.brush.empty()){
        that.cfg.extent = that.cfg.brush.extent();
        console.log(that.cfg.extent[0],that.cfg.extent[1]);
        that.cfg.index_position_mapping.range(that.cfg.extent);
        that.cfg.xpos_scale.domain(that.cfg.extent);
        //that.areagraph.select(".x.axis").call(that.cfg.xAxis).call(that.cfg.convert_to_date);
        that.areagraph.selectAll("path.graph").attr("d", that.cfg.area);
        brshs.call(that.cfg.brush.clear());
        
      }
    }
    
  },
	
  
  reset : function(){
    var that = this;
    var sdate =  new Date(this.cfg.xdata[0]);
    var edate =  new Date(this.cfg.xdata[this.cfg.xdata.length-1]);
    //this.cfg.xscale.domain([sdate, edate]).range([0, this.cfg.w]);
    this.cfg.xpos_scale.domain([0, this.cfg.initial_data[0][0].length]).range([0, this.cfg.w]);
    this.areagraph.select(".x.axis").call(that.cfg.xAxis).call(that.cfg.convert_to_date);
    this.areagraph.selectAll("path.graph").attr("d", that.cfg.area);
    
  }  
  
});
/**
* Topology class
*
* @param {Object} element DOM element
*/
myesnet.widgets.LinearOscarsCircuitWidget = AbstractWidget.extend({
	init : function(config){
		this._super(config);
		var that = this;
	  //Set the widget Properties
	  this.cfg = {};
	  this.container = config.container;
	  this.cfg.h = config.h === undefined ? 90 : config.h;
    this.cfg.w = config.w === undefined ? 350 : config.w;
    this.cfg.padding = config.padding === undefined ? 5: config.padding;
    this.initial_data = config.initial_data;
    this.routers = this.initial_data.routers;
    this.nodes = this.initial_data.nodes;
    this.links = this.initial_data.links;    
    
    // Specify source and target in the links using nodes object
    //The source and target refer to the objects in the nodes array not just the name.
    this.links.forEach(function(link) {
      link.source = that.nodes[link.source];
      link.target = that.nodes[link.target];
    });
    
    //Adjust the width and height of the super container based on the config options
    d3.select("#"+this.container)
      .style("width", this.cfg.w + (2 * this.cfg.padding) +"px")
      .style("height", this.cfg.h + (2 * this.cfg.padding) + "px")
      .attr("class", "topology");
    
    //Add the div container for the main graph
    d3.select("#" + this.container)
      .append("div")
      .attr("class", "topology_area")
      .style("padding", this.cfg.padding +"px");
      
    //Add the SVG canvas for visualization of the graph
    this.topology = d3.select("#"+this.container).select(".topology_area")
      .append("svg:svg")
        .attr("width", this.cfg.w).attr("height", this.cfg.h).attr("pointer-events", "all"); 
    
    //Arrow Markers
    // Per-type markers, as they don't inherit styles.
    this.topology.append("svg:defs").selectAll("marker")
        .data(["incoming","outgoing"])
      .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 60)
        .attr("refY", 0)
        .attr("markerWidth", 3)
        .attr("markerHeight", 3)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
	},
	render : function(){
	  var that = this;
	  var force = d3.layout.force()
      .nodes(d3.values(this.nodes)) //note we are only taking the values array
      .links(this.links)
      .size([this.cfg.w, this.cfg.h])
      .start();
    //LINKS  
    var path = this.topology.append("svg:g")
      .selectAll("path")
        .data(force.links())
      .enter().append("svg:path")
        .attr("class", function(d) { return "link " + d.type; })
        .attr("d", function(d) { return "M" + (d.source.x+5) + "," + (d.source.y+5) +  "L" + (d.target.x+5) + "," + (d.target.y+5); })
        .attr("marker-end", function(d) {return "url(#" + d.type + ")"; })
    
    //NODES
    var ports = this.topology.selectAll("g.node")
      .data(force.nodes())
      .enter().append("svg:g")
      .attr('class', 'port')
      .attr("transform", function(d){
        return 'translate(' + d.x + ',' + d.y +')';
        })
      
    ports.append("svg:rect")
      .attr("class", function(d,i){return d.type;})
      .attr("width", function(d,i) {return 10;})
      .attr("height", function(d,i) {return 10;})
      .append("svg:title")
        .text(function(d) { return d.name; })
    
    //Port labelling    
    var unique_ports = $.grep(force.nodes(), function(itm,i){ 
      return itm.type==="outgoing";
      });
    var port_label = this.topology.selectAll('g.port_label')
      .data(unique_ports)
      .enter().append("svg:g")
        .attr("transform", function(d,i) { 
          var xoffset = i%2===0?0:10
          return 'translate(' + (d.x+xoffset)  + ',' + (d.y-15) +')'; 
          })
        .append("svg:text")
        .text(function(d,i){ return d.port; })
        .attr("transform", "rotate(-45 10,10)")
        .attr('text-anchor',"start")
    
    //Render the main routers (big rectangles)
    var routers = this.topology.selectAll("rect.router")
      .data(that.routers)
      .enter().append("svg:g")
        .attr("transform", function(d,i) {
          return 'translate(' + d.x  + ',' + d.y +')';
        });
    routers.append("svg:rect")
      .attr("class", "router")
      .attr("width", function(d,i) {return d.w;})
      .attr("height", function(d,i) {return d.h;});
    routers.append("svg:image")
        .attr("xlink:href", "/myesnet/static/images/topology-icons/router-esnet.png")
        .attr("x", "4px").attr("y", "4px")
        .attr("width", "32px").attr("height", "32px");
      
    routers.append("svg:g")
      .append("svg:text")
      .text(function(d,i){ return d.name; })
        .attr('class', 'router-name')
        .attr("dy", 20)
        .attr("transform", "translate(20,40)")
        .attr('text-anchor','middle')
    
	},
	
	draw_grid: function(cell_size){
	  var cell = cell_size;
	  var grid = this.topology.append('svg:g');
    //Horizontal lines
    grid.selectAll('.xline')
    .data(d3.range(0,this.cfg.h+1,cell))
    .enter().append("svg:line")
      .attr('class','xline').attr('x1', 0).attr('x2', this.cfg.w).attr('y1', function(d){return d;}).attr('y2', function(d){return d;});
    //Vertical lines
    grid.selectAll('.yline')
    .data(d3.range(0,this.cfg.w+1,cell))
    .enter().append("svg:line")
      .attr('class','yline').attr('y1', 0).attr('y2', this.cfg.h).attr('x1', function(d){return d;}).attr('x2', function(d){return d;});
	}
});/**
* TableWidget class
*
* @param {Object} config configuration parameters for the area graph
* @param {String} config.element DOM element
* @param {Object} config.intial_data initail data: keys are x values, values are y values: {x1:y1, x2:y2, x3:y3 ...}
* @param {Number} config.w the width of the graph in pixels
* @param {Number} config.h the height of the graph in pixels
*/
myesnet.widgets.TableWidget = AbstractWidget.extend({
	init : function(config){
	  this._super(config);
	  
	  //Set the widget Properties
	  this.cfg = {};
	  this.container = config.container;
	  this.cfg.h = config.h === undefined ? 90 : config.h;
    this.cfg.w = config.w === undefined ? 350 : config.w;
    this.cfg.padding = config.padding === undefined ? 5: config.padding;
    //initial_data is a multidimensional array
    this.cfg.initial_data = config.initial_data;
    
    //Adjust the width and height of the super container based on the config options
    d3.select("#"+this.container)
      // .style("width", this.cfg.w + (2 * this.cfg.padding) +"px")
      // .style("height", this.cfg.h + (2 * this.cfg.padding) + "px")
      .attr("class", "esnet-table-container");
    
    //Add the table
    this.table = d3.select("#" + this.container)
      .append("table")
      .attr("class", "esnet-table")
      .style("padding", this.cfg.padding +"px");      
  },  
  render : function(){
    //If the header content is specified
    if(this.cfg.initial_data.header){
      var header = this.table.append("thead").append("tr");
      header.selectAll("th")
        .data(this.cfg.initial_data.header) //header is an array of header cells' content
      .enter()
        .append("th")
        .text(function(d,i){return d;});
    }
    var body = this.table.append("tbody");
    var rows = body.selectAll("tr")
      .data(this.cfg.initial_data.rows)
      .enter()
        .append("tr");
        
    rows.selectAll('tr')
      .data(function(d,i){return d;})
      .enter()
        .append('td')
        .html(function(d,i){return d;});
  }
});/**
* Utilities class
*
* @param {Object} config configuration parameters for the area graph
* @param {String} config.element DOM element
* @param {Object} config.intial_data initail data: keys are x values, values are y values: {x1:y1, x2:y2, x3:y3 ...}
* @param {Number} config.w the width of the graph in pixels
* @param {Number} config.h the height of the graph in pixels
*/
(function(){
myesnet.utiliites = new function(){
  /*Interfaces*/
  return {
    prepareDataForLinearTopology : function(config){
      var w=config.w, h=config.h, rw=config.rw, rh=config.rh, data=config.data;
      var nw = 10; var nh = 10;
      var links = [];

      //Find all routers in the circuit
      //Extract all nodes
      var routers_order = d3.merge(data.circuit.segments.map(function(d,i){
        return d.ports.map(function(d,i){
          return d.node;
        });
      }));
      //use only the unique nodes 
      routers_order = routers_order.filter(function(itm,i,routers){ return i==routers.indexOf(itm); });

      //Create a routers dictionary with x and y values
      var routers = {};
      var link_length = w/(routers_order.length+1); //center to center distance between routers

      $.each(routers_order, function(i,d){
        var X = (i+1)*link_length - rw/2;
        var Y = h/2 - rh/2;
        routers[d] = {x:X, y:Y, name:d, order:i, w:rw, h:rh}
      })
      
      var nodes = {
        "start---L" : {name:"start---L", type:"invisible","group": 1, "x": 10, 
          "y": routers[routers_order[0]].y +nh},
        "stop---L" : {name:"stop---L", type:"invisible","group": 1, "x": 10, 
          "y": routers[routers_order[0]].y + routers[routers_order[0]].h - 2*nh },
        "start---R" : {name:"start---R", type:"invisible","group": 1, "x": w-10, 
          "y": routers[routers_order[0]].y + routers[routers_order[0]].h - 2*nh },
        "stop---R" : {name:"stop---R", type:"invisible","group": 1, "x": w-10, 
          "y": routers[routers_order[0]].y +nh }
      }
      
      //the traffic flow order; Assumption is that the traffic flow is always symmetrical
      var ports_order = [];
      $.each(data.circuit.segments[0].ports, function(k,v){ ports_order.push(v.node+"---"+v.name) })  
      //size of the interface nodes
      $.each(ports_order, function(i,port){
        var router_name = port.split("---")[0];
        var port_name = port.split("---")[1]
        //The nodes_order will always have the even number of items.
        //The odd ones appearing on the left side and even ones appearing on the right side of the rectangular router.
        //postion refers to which side the port appears graphically on the viz. (left(L) or right(R) side of the router) 
        //odd index appears of the left and even index appears on the right
        var position = i%2===0? 'L':'R';
        //Each port has 'ingress' and 'egress'
        $.each(['ingress', 'egress'], function(i,direction){
          var X = position==='L' ? routers[router_name].x-nw : routers[router_name].x+routers[router_name].w;
          var Y = routers[router_name].y +nh;
          var type = "outgoing";
          if(position==='L' & direction==="egress"){
            Y = routers[router_name].y + routers[router_name].h - 2*nh;
            type = "incoming";
          }
          if(position==='R' & direction==="ingress"){
            Y = routers[router_name].y + routers[router_name].h - 2*nh;
            type = "incoming";
          }
          nodes[port + '---' + direction] = {name:port + '---' + direction,  x:X, y:Y, w:nw, h:nh, port:port_name, router:router_name, type:type};
        })
      })
      $.each(ports_order, function(i,port){
        if(i===0){
          links.push({source:"start---L", target:ports_order[i]+'---ingress', type:'outgoing'});
          }
        if(i===(ports_order.length-1)){
          links.push({source:ports_order[i]+'---egress', target:"stop---R",type:'outgoing'});
          return;
          }
        var temp ={ type:'outgoing'}
        if(i%2===0){
          temp.source = ports_order[i]+'---ingress';
          temp.target = ports_order[i+1]+'---egress';
          links.push(temp);
        }else{
          temp.source = ports_order[i]+'---egress';
          temp.target = ports_order[i+1]+'---ingress';
          links.push(temp);
        }
      })
      
      $.each(ports_order.reverse(), function(i,port){
        if(i===0){
          links.push({source:"start---R", target:ports_order[i]+'---ingress', type:'incoming'});
          }
        if(i===(ports_order.length-1)){
          links.push({source:ports_order[i]+'---egress', target:"stop---L",type:'incoming'});
          return;
          }
        var temp ={ type:'incoming'}
        if(i%2===0){
          temp.source = ports_order[i]+'---ingress';
          temp.target = ports_order[i+1]+'---egress';
          links.push(temp);
        }else{
          temp.source = ports_order[i]+'---egress';
          temp.target = ports_order[i+1]+'---ingress';
          links.push(temp);
        }
      })

      return {
        nodes:nodes,
        links: links,
        routers:routers_order.map(function(d,i){return routers[d]; })
      };

      
    }
  }
}
})() //end of anonymous function
})();
//The End