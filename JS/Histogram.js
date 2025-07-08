
// Chart with Plotly.js

function createHistogram(chartID,curveX, curveY, width, height, nominalValue = 0, xAxisTicks, specificationLimitLines, barData = [] , controlLimitLines = []) {

    //console.log('createHistogram is called from: ');
    //console.log(chartID);

    const LCL = specificationLimitLines[0].x; // Lower Control Limit
    const UCL = specificationLimitLines[1].x; // Upper Control Limit

    // --- This clears the container ---
    const chartDiv = document.getElementById(chartID);
    if (chartDiv) chartDiv.innerHTML = '';

    let barTrace = null;
    let barX = [], barY = [];

    if (Array.isArray(barData) && barData.length > 0) {
        barX = barData.map(point => point.x);
        barY = barData.map(point => point.y);

        barTrace = {
            x: barX,
            y: barY,
            type: 'bar',
            name: 'Histogram',
            marker: {
                // color: 'rgba(75, 192, 192, 0.2)',
                color: '#caf0f880',
                line: {
                    // color: 'rgba(75, 192, 192, 1)',
                    color: '#caf0f8ff',
                    width: 1
                }
            }
        };
    }

    const yMax = Math.max(...curveY);
    if (barY.length > 0)
        {
            const yMax = Math.max(...curveY, ...(barY.length ? barY : [0]));
        }

    const filledCurveX = [];
    const filledCurveY = [];

    for (let i = 0; i < curveX.length; i++) {
        const x = curveX[i];
        const y = curveY[i];
        if (x >= LCL && x <= UCL) {
            filledCurveX.push(x);
            filledCurveY.push(y);
        }
    }

    const filledAreaTrace = {
        x: filledCurveX,
        y: filledCurveY,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: 'Between LCL–UCL',
        line: {
            // color: 'rgba(255, 88, 0, 0)', // invisible line
            color: '#00b4d800', // invisible line
            width: 0
        },
        // fillcolor: 'rgba(255, 88, 0, 0.2)' // same as original
        fillcolor: '#00b4d840' // same as original
    };

    const curveTrace = {
        x: curveX,
        y: curveY,
        type: 'scatter',
        mode: 'lines',
        name: 'Curve',
        line: {
            // color: 'rgba(255, 88, 0, 1)',
            color: '#00b4d8ff',
            width: 1
        },
        fill: 'none' // no fill here anymore
    };

    const shapes = [];

    // Main vertical lines: x-axis ticks (sigma values)
    xAxisTicks.forEach(line => {
        shapes.push({
            type: 'line',
            xref: 'x',
            yref: 'paper', // ← key trick!
            x0: line.x,
            x1: line.x,
            y0: -0.015,
            //y1: Math.max(...barY, ...curveY),
            y1: 0.05,
            line: {
                color: line.color,
                width: 1
            }
        });
    });

    // Secondary vertical lines (LSL/USL)
    specificationLimitLines.forEach(line => {
        shapes.push({
            type: 'line',
            x0: line.x,
            x1: line.x,
            y0: 0,
            y1: Math.max(...curveY),
            line: {
                color: line.color,
                width: 1,
            }
        });
    });

    // Tertiary vertical lines (LCL/UCL)
    controlLimitLines.forEach(line => {
        shapes.push({
            type: 'line',
            xref: 'x',
            yref: 'paper', // if you’re using paper for vertical extension
            x0: line.x,
            x1: line.x,
            y0: -0.1,
            y1: 0.5,
            line: {
                color: line.color || 'gray',
                width: 1,
            }
        });
    });

    // Nominal value vertical
    shapes.push({
        type: 'line',
        xref: 'x',
        yref: 'paper', // if you’re using paper for vertical extension
        x0: nominalValue,
        x1: nominalValue,
        y0: -0.1,
        y1: 1.0,
        line: {
            color: 'gray',
            width: 1,
        }
    });

    // Prepare annotations for x-axis ticks (sigma values)
    const annotations = xAxisTicks.map(line => ({
        x: line.x,
        y: 0,               // Bottom of the plot area
        xref: 'x',
        yref: 'paper',      // Paper-based positioning!
        //text: line.label,
        text: `${line.label}<br><span style="font-size:9px">${line.x.toFixed(4)}</span>`,
        showarrow: false,
        font: { color: line.color, size: 10 },
        yanchor: 'top',
        align: 'center'
    }));

    // Prepare annotations for specification limit lines (LSL/USL)
    specificationLimitLines.forEach(line => {
        if (line.label) {
            annotations.push({
                x: line.x,
                y: Math.max( ...curveY),
                xref: 'x',
                yref: 'y',
                text: `${line.label}<br><span style="font-size:9px">${line.x.toFixed(4)}</span>`,
                showarrow: false,
                font: { color: line.color, size: 10 },
                yanchor: 'bottom',
                align: 'center'
            });
        }
    });

    // Annotations for control limit lines (LCL/UCL)
    controlLimitLines.forEach(line => {
        if (line.label) {
            annotations.push({
                x: line.x,
                y: 0.0,               // Align below using yref: 'paper'
                xref: 'x',
                yref: 'paper',
                yanchor: 'top',
                yshift: -24,
                text: `${line.label}<br><span style="font-size:9px">${line.x.toFixed(4)}</span>`,
                showarrow: false,
                font: { color: line.color || 'gray', size: 10 },
                //yanchor: 'top',
                align: 'center'
            });
        }
    });

    // Annotation for nominal value line
    annotations.push({
        x: nominalValue,
        y: 0.0,               // Align below using yref: 'paper'
        xref: 'x',
        yref: 'paper',
        yanchor: 'top',
        yshift: -24,
        text: `${'Mean'}<br><span style="font-size:9px">${nominalValue.toFixed(4)}</span>`,
        showarrow: false,
        font: { color: 'gray', size: 10 },
        //yanchor: 'top',
        align: 'center'
    });


    // Layout
    const layout = {
        width: width,
        height: height,
        barmode: 'overlay',
        showlegend: false,
        margin: { t: 30, r: 20, b: 60, l: 40 },
        xaxis: {
            title: '',
            zeroline: false,
            showgrid: false,
            showticklabels: false,
            showline: true,
            linecolor: 'black',
        },
        yaxis: {
            title: '',
            showgrid: false,
            zeroline: true,
            visible: false,
            //range: [0, yMax + yPadding]
            range: [0, yMax*1.2 ],
        },
        shapes: shapes,
        annotations: annotations
    };

    // Render
    const traces = [filledAreaTrace, curveTrace];
    if (barTrace) traces.unshift(barTrace);

    // Plotly.newPlot('histogramChart', traces, layout, { displayModeBar: false });
    // Plotly.newPlot('MCchart', traces, layout, { displayModeBar: false });
    Plotly.newPlot(chartID, traces, layout, { displayModeBar: false });


    

}


