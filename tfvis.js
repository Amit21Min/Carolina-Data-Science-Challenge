d3.json("dataJSON2.json").then(function (treeData) {
    pack = data => d3.pack()
        .size([width, height])
        .padding(3)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value))

    width = 700
    height = width / 1.3
    format = d3.format(",d")
    color = d3.scaleLinear()
        .domain([0, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl)

    const root = pack(treeData)
    let focus = root;
    let view;


    const svg = d3.selectAll("body").append("svg")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .style("display", "block")
        .style("margin", "0 -14px")
        .style("background", color(0))
        .style("cursor", "pointer")
        .on("click", () => zoom(root));

        
    const node = svg.append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .join("circle")
        .attr("fill", d => d.children ? color(d.depth) : "white")
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function () {
            d3.select(this).attr("stroke", "#000");
        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke", null);
        })
        .on("click", d => focus !== d && (zoom(d), d3.event.stopPropagation()));


        
    const label = svg.append("g")
        .style("font", "12px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(function(d) {
            if (d.data.name == "B&E") {
                return "Breaking and Entering";
            } else if (d.data.name == "LoudMusic") {
                    return "Noise Complaint";
            } else if (d.data.name == "XX") {
                return "Unreported";
            } else {
                return d.data.name;
            }
        });

    // var labelLayout = d3.forceSimulation(d3.selectAll("circle"))
    //     .force("charge", d3.forceManyBody().strength(-50))
    //     .force("link", d3.forceLink(label.links).distance(0).strength(2));

    // var graphLayout = d3.forceSimulation(d3.selectAll("circle"))
    //     .force("charge", d3.forceManyBody().strength(-3000))
    //     .force("center", d3.forceCenter(width / 2, height / 2))
    //     .force("x", d3.forceX(width / 2).strength(1))
    //     .force("y", d3.forceY(height / 2).strength(1))
    //     .force("link", d3.forceLink(d3.selectAll("circle")).id(function(d) {return d.id; }).distance(50).strength(1))
    //     .ticked("on");

    //     function ticked() {
            
    //     }

    zoomTo([root.x, root.y, root.r * 2]);

    function zoomTo(v) {

        

        const k = width / v[2] / 1.3;

        view = v;

        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
    }

    function zoom(d) {

        label

        const focus0 = focus;

        focus = d;

        const transition = svg.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", d => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                if (focus.x == 350) {
                    label.style("font", function(d) {
                        return "20px sans-serif"
                    })
                }
                return t => zoomTo(i(t));

            });

        label
            .filter(function (d) {
                return d.parent === focus || this.style.display === "inline";
            })
            .transition(transition)
            .style("fill-opacity",function(d) {
                return d.parent === focus ? 1 : 0
            })
            .on("start", function (d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .on("end", function (d) {
                if (d.parent !== focus) this.style.display = "none";
            });

        label.style("font", function(d) {
                return "9px sans-serif"
            })
    }


})