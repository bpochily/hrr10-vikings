var getUniqueTags = function (bookmarks) {
  return _.chain(bookmarks).pluck('tags').flatten().uniq().value();
};

var d3Bookmarks;

var massageDataForD3Graph = function (bookmarks) {
  var allUniqueTags = getUniqueTags(bookmarks);

  var liList = '';

  for (var i = 0; i < allUniqueTags.length; i++) {
    liList += '<li>' + allUniqueTags[i] + '</li>';
  }

  $('#ulTags').html(liList);

  $("#ulTags").on("click", "li", function() {
    updateGraph($(this).text())
  });

  var arrRoot = [];
  var id = 0;

  for (var i = 0; i < allUniqueTags.length; i++) {
    var siteArr = [];
    var tagname = allUniqueTags[i];
    var siteCount = 0;

    for (var j = 0; j < bookmarks.length; j++) {
      if (bookmarks[j].tags && bookmarks[j].tags.indexOf(tagname) > -1) {
        var siteObj = {};
        siteObj['text'] = bookmarks[j].site;
        siteObj['size'] = bookmarks.length * 1000;

        siteArr.push(siteObj);
        siteCount++;
      }
    }

    var tagObj = {};
    //tagObj['id'] = ++id;
    tagObj['text'] = tagname;
    tagObj['children'] = siteArr;
    tagObj['size'] = siteCount * 20000;

    arrRoot.push(tagObj);
  }

  var retObj = {};
  //retObj['id'] = ++id;
  retObj['text'] = 'root';
  retObj['children'] = arrRoot;

  d3Bookmarks = retObj;

  buildGraph(retObj);
};

var updateGraph = function (tagName) {
  $('#dataViz').empty();

  for (var i = 0; i < d3Bookmarks.children.length; i++) {
    if (d3Bookmarks.children[i].name === tagName) {
      buildGraph(d3Bookmarks.children[i])
    }
  }
};

var buildGraph = function (data) {
  var width = 1000, //$('#dataViz').width(),
    height = 800, //$('#dataViz').height(),
    root;

  var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick)
    .charge(-400)
    .linkDistance(200);

  var svg = d3.select("#dataViz").append("svg")
    .attr("width", width)
    .attr("height", height);

  var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

  //d3.json(data, function (error, json) {
  //  if (error) throw error;
  //
  //  root = json;
  //  update();
  //});

  update();

  function update() {
    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var nodes = flatten(data),
      links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force
      .nodes(nodes)
      .links(links)
      //.gravity(-0.1)
      //.charge(this.charge)
      //.friction(1.5)
      .start();

    // Update the links…
    link = link.data(links, function (d) {
      return d.target.id;
    });

    // Exit any old links.
    link.exit().remove();

    // Enter any new links.
    link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    // Update the nodes…
    node = node.data(nodes, function (d) {
      return d.id;
    }).style("fill", color);

    // Exit any old nodes.
    node.exit().remove();

    // Enter any new nodes.
    node.enter()
      .append("circle")
        .attr("class", "node")
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        })
        .attr("r", function (d) {
          return Math.sqrt(d.size) / 10 || 4.5;
        })
        .style("fill", color)
        .on("click", click)
        .on("mouseover", function(d) {
          var html = '';
          if (d.name.substring(0, 4) === 'http')  {
            html = "<a href='" + d.name + "' target='_blank'>" + d.name + "</a>";
          } else {
            html = d.name;
          }
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(html)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          div.transition()
            .duration(5000)
            .style("opacity", 0);
        })
        .call(force.drag);
  }

  function tick() {
    link.attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node.attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  }

// Color leaf nodes orange, and packages white or blue.
  function color(d) {
    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }

// Toggle children on click.
  function click(d) {
    if (!d3.event.defaultPrevented) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update();
    }
  }

  // Returns a list of all nodes under the root.
  function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      if (!node.id) node.id = ++i;
      nodes.push(node);
    }

    recurse(root);
    return nodes;
  }
};

var jsonData = massageDataForD3Graph(bookmarks);
console.log(jsonData);