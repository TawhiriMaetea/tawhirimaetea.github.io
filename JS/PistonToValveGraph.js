// Chart with Plotly.js

function createP2Vgraph() {
    // Support both: createP2Vgraph(opts) and legacy positional args
    let opts;
    if (arguments.length === 1 && arguments[0] && typeof arguments[0] === 'object' && !Array.isArray(arguments[0])) {
        opts = arguments[0];
    } else {
        const [
            chartID, valveCurveX, valveCurveY,
            pistonCurveX, pistonCurveY,
            p2vNominalCurveX, p2vNominalCurveY,
            width, height,
        ] = arguments;
        opts = {
            chartID, valveCurveX, valveCurveY,
            pistonCurveX, pistonCurveY,
            p2vNominalCurveX, p2vNominalCurveY,
            p2vArithmeticMinCurveX, p2vArithmeticMinCurveY,
            p2vRSSMinCurveX, p2vRSSMinCurveY,
            p2vStatMinCurveX, p2vStatMinCurveY,
            width, height,
            minClearanceArithmeticX, minClearanceArithmeticY,
            minClearanceRSSX, minClearanceRSSY,
            minClearanceStatX, minClearanceStatY
        };
    }

    const chartID = opts.chartID;
    const valveCurveX = Array.isArray(opts.valveCurveX) ? opts.valveCurveX : [];
    const valveCurveY = Array.isArray(opts.valveCurveY) ? opts.valveCurveY : [];
    const pistonCurveX = Array.isArray(opts.pistonCurveX) ? opts.pistonCurveX : [];
    const pistonCurveY = Array.isArray(opts.pistonCurveY) ? opts.pistonCurveY : [];
    const p2vNominalCurveX = Array.isArray(opts.p2vNominalCurveX) ? opts.p2vNominalCurveX : [];
    const p2vNominalCurveY = Array.isArray(opts.p2vNominalCurveY) ? opts.p2vNominalCurveY : [];
    const p2vArithmeticMinCurveX = Array.isArray(opts.p2vArithmeticMinCurveX) ? opts.p2vArithmeticMinCurveX : [];
    const p2vArithmeticMinCurveY = Array.isArray(opts.p2vArithmeticMinCurveY) ? opts.p2vArithmeticMinCurveY : [];
    const p2vRSSMinCurveX = Array.isArray(opts.p2vRSSMinCurveX) ? opts.p2vRSSMinCurveX : [];
    const p2vRSSMinCurveY = Array.isArray(opts.p2vRSSMinCurveY) ? opts.p2vRSSMinCurveY : [];
    const p2vStatMinCurveX = Array.isArray(opts.p2vStatMinCurveX) ? opts.p2vStatMinCurveX : [];
    const p2vStatMinCurveY = Array.isArray(opts.p2vStatMinCurveY) ? opts.p2vStatMinCurveY : [];

    // Extract single-value minimum clearance coordinates for vertical line markers
    const minClearanceArithmeticX = Number.isFinite(opts.minClearanceArithmeticX) ? opts.minClearanceArithmeticX : null;
    const minClearanceArithmeticY = Number.isFinite(opts.minClearanceArithmeticY) ? opts.minClearanceArithmeticY : null;
    const minClearanceRSSX = Number.isFinite(opts.minClearanceRSSX) ? opts.minClearanceRSSX : 
           Number.isFinite(opts.minClearanceMRSSX) ? opts.minClearanceMRSSX : null; // Support both naming conventions
    const minClearanceRSSY = Number.isFinite(opts.minClearanceRSSY) ? opts.minClearanceRSSY : 
        Number.isFinite(opts.minClearanceMRSSY) ? opts.minClearanceMRSSY : null;
    const minClearanceStatX = Number.isFinite(opts.minClearanceStatX) ? opts.minClearanceStatX : 
   Number.isFinite(opts.minClearanceStatisticalX) ? opts.minClearanceStatisticalX : null;
    const minClearanceStatY = Number.isFinite(opts.minClearanceStatY) ? opts.minClearanceStatY : 
          Number.isFinite(opts.minClearanceStatisticalY) ? opts.minClearanceStatisticalY : null;

    // Extract zoom range parameters (optional)
    const xRangeMin = Number.isFinite(opts.xRangeMin) ? opts.xRangeMin : null;
    const xRangeMax = Number.isFinite(opts.xRangeMax) ? opts.xRangeMax : null;
    const yRangeMin = Number.isFinite(opts.yRangeMin) ? opts.yRangeMin : null;
    const yRangeMax = Number.isFinite(opts.yRangeMax) ? opts.yRangeMax : null;

    // Debug logging
    console.log('[createP2Vgraph] Minimum clearance coordinates:');
    console.log(`  Arithmetic: (${minClearanceArithmeticX}, ${minClearanceArithmeticY})`);
    console.log(`  RSS: (${minClearanceRSSX}, ${minClearanceRSSY})`);
    console.log(`  Statistical: (${minClearanceStatX}, ${minClearanceStatY})`);
    console.log(`[createP2Vgraph] Zoom ranges: X=[${xRangeMin}, ${xRangeMax}], Y=[${yRangeMin}, ${yRangeMax}]`);

    const width = Number.isFinite(opts.width) ? opts.width : 800;
    const height = Number.isFinite(opts.height) ? opts.height : 300;

    // Normalize ticks; handle arrays and Dictionary-serialized objects
    //const ticks = Array.isArray(opts.xAxisTicks)
    //    ? opts.xAxisTicks
    //    : (opts.xAxisTicks && typeof opts.xAxisTicks === 'object'
    //        ? Object.values(opts.xAxisTicks)
    //        : []);

    //if (!Array.isArray(opts.xAxisTicks)) {
    //    console.warn('createP2Vgraph: xAxisTicks was not an array. Normalized value:', opts.xAxisTicks);
    //}

    //const minDistanceX = Number.isFinite(opts.minDistanceX) ? opts.minDistanceX : 0;
    //const minDistanceY = Number.isFinite(opts.minDistanceY) ? opts.minDistanceY : 0;

    // --- This clears the container ---
    const chartDiv = document.getElementById(chartID);
    if (chartDiv) chartDiv.innerHTML = '';

    const valveCurveTrace = {
        x: valveCurveX,
        y: valveCurveY,
        type: 'scatter',
        mode: 'lines',
        name: 'Valve Lift',
        line: { color: '#00b4d8ff', width: 1 },
        fill: 'none'
    };

    const pistonCurveTrace = {
        x: pistonCurveX,
        y: pistonCurveY,
        type: 'scatter',
        mode: 'lines',
        name: 'Piston Height',
        line: { color: '#00b4d8ff', width: 1 },
        fill: 'none'
    };

    const nominalClearanceCurveTrace = {
        x: p2vNominalCurveX,
        y: p2vNominalCurveY,
        type: 'scatter',
        mode: 'lines',
        name: 'P2V Clearance (Nominal)',
        line: { color: '#888888', width: 1 },
        fill: 'none'
    };

    const arithmeticMinCurveTrace = {
        x: p2vArithmeticMinCurveX,
        y: p2vArithmeticMinCurveY,
        type: 'scatter',
        mode: 'lines',
        name: 'Arithmetic Min',
        line: { color: '#03045e', width: 2 },
        fill: 'none',
        visible: p2vArithmeticMinCurveX.length > 0 ? true : 'legendonly'
    };

    const rssMinCurveTrace = {
        x: p2vRSSMinCurveX,
        y: p2vRSSMinCurveY,
        type: 'scatter',
        mode: 'lines',
        name: 'RSS Min',
        line: { color: '#0077b6', width: 2 },
        fill: 'none',
        visible: p2vRSSMinCurveX.length > 0 ? true : 'legendonly'
    };

    const statMinCurveTrace = {
        x: p2vStatMinCurveX,
        y: p2vStatMinCurveY,
        type: 'scatter',
        mode: 'lines',
        name: 'Statistical Min',
        line: { color: '#00b4d8', width: 2 },
        fill: 'none',
        visible: p2vStatMinCurveX.length > 0 ? true : 'legendonly'
    };

    const firedeckCurveTrace = {
        x: [0,720],
        y: [0,0],
        type: 'scatter',
        mode: 'lines',
        name: 'Firedeck',
        line: { color: '#444444', width: 2 },
        fill: 'none'
    };

    const shapes = [];

    // Vertical lines marking minimum clearance points for each method
    // Only add if valid coordinates are provided
    if (minClearanceArithmeticX !== null && minClearanceArithmeticY !== null) {
        shapes.push({
            type: 'line',
            xref: 'x',
            yref: 'y',
            x0: minClearanceArithmeticX,
            x1: minClearanceArithmeticX,
            y0: 0,
            y1: minClearanceArithmeticY,
            line: { color: '#03045e', width: 1, dash: 'dot' }
        });
    }

    if (minClearanceRSSX !== null && minClearanceRSSY !== null) {
        shapes.push({
            type: 'line',
            xref: 'x',
            yref: 'y',
            x0: minClearanceRSSX,
            x1: minClearanceRSSX,
            y0: 0,
            y1: minClearanceRSSY,
            line: { color: '#0077b6', width: 1, dash: 'dot' }
        });
    }

    if (minClearanceStatX !== null && minClearanceStatY !== null) {
        shapes.push({
            type: 'line',
            xref: 'x',
            yref: 'y',
            x0: minClearanceStatX,
            x1: minClearanceStatX,
            y0: 0,
            y1: minClearanceStatY,
            line: { color: '#00b4d8', width: 1, dash: 'dot' }
        });
    }

    // Prepare annotations for x-axis ticks (crank angle values)
    //const annotations = ticks.map(line => ({
    //    x: line.x,
    //    y: 0,
    //    xref: 'x',
    //    yref: 'paper',
    //    text: `${line.label}<br><span style="font-size:9px">${Number(line.x).toFixed(4)}</span>`,
    //    showarrow: false,
    //    font: { color: line.color, size: 10 },
    //    yanchor: 'top',
    //    align: 'center'
    //}));

    // Annotation for minimum distance of piston and valve curves
    //annotations.push({
    //    x: minDistanceX,
    //    y: 0.0,
    //    xref: 'x',
    //    yref: 'paper',
    //    yanchor: 'top',
    //    yshift: -24,
    //    text: `${'Mean'}<br><span style="font-size:9px">${Number(minDistanceX).toFixed(4)}</span>`,
    //    showarrow: false,
    //    font: { color: 'gray', size: 10 },
    //    align: 'center'
    //});

    // Compute auto ranges to fit full content (curves + tick markers + minDistanceX)
    //const xAll = []
    //    .concat(valveCurveX)
    //    .concat(pistonCurveX)
    //    .concat(ticks.map(t => t.x))
    //    .concat([minDistanceX]);

    const xAll = []
        .concat(valveCurveX)
        .concat(pistonCurveX);

    const yAll = []
        .concat(valveCurveY)
        .concat(pistonCurveY);

    const xMin = xAll.length ? Math.min(...xAll) : 0;
    const xMax = xAll.length ? Math.max(...xAll) : 1;
    const yMinRaw = yAll.length ? Math.min(...yAll) : 0;
    const yMaxRaw = yAll.length ? Math.max(...yAll) : 1;

    // Ensure non-zero ranges and add small padding
    const padPct = 0.03;
    const xRange = Math.max(1e-9, xMax - xMin);
    const yRange = Math.max(1e-9, yMaxRaw - yMinRaw);
    const xPad = xRange * padPct;
    const yPad = yRange * padPct;

    // Use custom ranges if provided (from auto-zoom), otherwise use calculated ranges
    let finalXMin = xMin - xPad;
    let finalXMax = xMax + xPad;
    let finalYMin = yMinRaw - yPad;
    let finalYMax = yMaxRaw + yPad;

    if (xRangeMin !== null && xRangeMax !== null) {
        finalXMin = xRangeMin;
        finalXMax = xRangeMax;
        console.log('[createP2Vgraph] Using custom X range for zoom');
    }

    if (yRangeMin !== null && yRangeMax !== null) {
        finalYMin = yRangeMin;
        finalYMax = yRangeMax;
        console.log('[createP2Vgraph] Using custom Y range for zoom');
    }

    const layout = {
        width: width,
        height: height,
        barmode: 'overlay',
        showlegend: true,
        legend: {
            x: 1.02,
            y: 1,
            xanchor: 'left',
            yanchor: 'top',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            bordercolor: '#cccccc',
            borderwidth: 1,
            font: { size: 11 }
        },
        margin: { t: 30, r: 150, b: 60, l: 60 },
        xaxis: {
            title: 'Crank Angle (°)',
            zeroline: false,
            showgrid: true,
            showticklabels: true,
            showline: true,
            linecolor: 'black',
            range: [finalXMin, finalXMax]
        },
        yaxis: {
            title: 'Clearance (mm)',
            showgrid: true,
            zeroline: true,
            visible: true,
            showticklabels: true,
            tickmode: 'auto',
            tickformatstops: [
                { dtickrange: [null, 0.1], value: '.3f' },
                { dtickrange: [0.1, 1],   value: '.2f' },
                { dtickrange: [1, null],  value: '.1f' }
            ],
            range: [finalYMin, finalYMax]
        },
        shapes: shapes,
    };

    const traces = [pistonCurveTrace, valveCurveTrace, nominalClearanceCurveTrace, firedeckCurveTrace, arithmeticMinCurveTrace, rssMinCurveTrace, statMinCurveTrace];
    Plotly.newPlot(chartID, traces, layout, { displayModeBar: false });
}





