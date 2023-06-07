let model = null;
let mode = null;

async function loadModel() {
    const modelSelector = document.getElementById('model-selector');
    const modeSelector = document.getElementById('mode-selector');
    const MODEL_PATH = modelSelector.value;
    model = await tf.loadGraphModel(MODEL_PATH);
    mode = modeSelector.value;

    // Adjust table headers according to the mode
    const tableHead = document.getElementById('table-head');
    while (tableHead.firstChild) {
        tableHead.removeChild(tableHead.firstChild);
    }

    const newRow = tableHead.insertRow(0);
    const headers = ["\\(p_t\\) bar", "\\(L\\) cm", "\\(x_{\\text{H}_2 \\text{O}}\\)", "\\(x_{\\text{CO}_2}\\)", "\\(x_{\\text{CO}}\\)", "ID"];

    if (mode === "emis") {
        headers.splice(1, 0);
    } else if (mode === "abso") {
        headers.splice(1, 0, "\\(T_s\\) K");
    }

    headers.forEach(header => {
        const newCell = newRow.insertCell(-1);
        newCell.textContent = header;
    });

    // Update MathJax typesetting
    MathJax.typesetPromise();

    document.getElementById('load-button').style.display = 'none';
    document.getElementById('model-selector').style.display = 'none';
    document.getElementById('mode-selector').style.display = 'none';
    document.getElementById('model-interactions').style.display = 'block';
    alert('Model Loaded Successfully!');
}

// function addRow() {
//     var table = document.getElementById('data-table');
//     var row = table.insertRow(-1);

//     if (mode=="emis"){
//         // Define default values for each cell
//         var defaultValues = [1.0, 0.1, 0.0, 0.0, 0.0];

//         for (var i = 0; i < 5; i++) {
//             var cell = row.insertCell(i);

//             // Set the default value in the input field
//             var defaultValue = defaultValues[i];
//             cell.innerHTML = '<input type="number" value="' + defaultValue + '" onchange="validateInput(this)">';
//         }
//     }
//     else if (mode=="abso"){
//         // Define default values for each cell
//         var defaultValues = [1.0, 300.0, 0.1, 0.0, 0.0, 0.0];

//         for (var i = 0; i < 6; i++) {
//             var defaultValue = defaultValues[i];
//             // Set the default value in the input field
//             var defaultValue = defaultValues[i];
//             cell.innerHTML = '<input type="number" value="' + defaultValue + '" onchange="validateInput(this)">';
//         }
//     }
//     var cell = row.insertCell(-1);
//     cell.textContent = table.rows.length - 1;
// }

function addRow() {
    var table = document.getElementById('data-table');
    var row = table.insertRow(-1);

    // get the number of rows in the table
    var num_rows = table.rows.length;

    // check if it's the first row or not
    var firstRow = num_rows <= 2; // including the header row

    var defaultValues;

    if (mode == "emis") {
        // Define default values for each cell
        defaultValues = firstRow ? [1.0, 0.1, 0.0, 0.0, 0.0] : getDefaultValues(table, 5);
    } 
    else if (mode == "abso") {
        // Define default values for each cell
        defaultValues = firstRow ? [1.0, 300.0, 0.1, 0.0, 0.0, 0.0] : getDefaultValues(table, 6);
    }

    for (var i = 0; i < defaultValues.length; i++) {
        var cell = row.insertCell(i);

        // Set the default value in the input field
        var defaultValue = defaultValues[i];
        cell.innerHTML = '<input type="number" value="' + defaultValue + '" onchange="validateInput(this)">';
    }

    var cell = row.insertCell(-1);
    cell.textContent = num_rows - 1;
}

function getDefaultValues(table, numCells) {
    var lastRow = table.rows[table.rows.length - 2];
    var defaultValues = [];

    for (var i = 0; i < numCells; i++) {
        var inputValue = lastRow.cells[i].querySelector('input').value;
        defaultValues.push(parseFloat(inputValue));
    }

    return defaultValues;
}


function removeRow() {
    var table = document.getElementById('data-table');
    var rowCount = table.rows.length;
    if(rowCount > 1) {
        table.deleteRow(-1);
    }
}

async function plot() {
    var table = document.getElementById('data-table');
    var rows = table.rows;
    var rowCount = rows.length;

    var inputData = [];
    var traces = [];

    for (var i = 1; i < rowCount; i++) {
        var row = rows[i];

        var cellInputs = row.getElementsByTagName('input');
        var rowInputData = Array.from(cellInputs).map(input => parseFloat(input.value));

        if (mode === "abso") {
            rowInputData.splice(1, 0, 300); // Insert default T_s value for abso mode
        }
        else if(mode=="emis"){
            rowInputData.splice(1, 0, 300); // Insert default T_s and T_g values for emis mode
            rowInputData.splice(1, 0, 300);
        }

        // Push each row's data as an array
        inputData.push(rowInputData);
    }
	// TESTER = document.getElementById('tester');
	// Plotly.newPlot( TESTER, [{
	// x: [1, 2, 3, 4, 5],
	// y: [1, 2, 4, 8, 16] }], {
	// margin: { t: 0 } } );
    var Tg_values = tf.linspace(300.0, 3000.0, 30).arraySync();

    for (let i = 0; i < inputData.length; i++) {
        let outputData = [];
        for (let j = 0; j < Tg_values.length; j++) {
            let xp = inputData[i];
            xp[1] = Tg_values[j]; // Updating T_g or T_s depending on mode
            xp[2] = Tg_values[j]; // Updating T_g or T_s depending on mode
            let prediction = await predict(xp);
            outputData.push([Tg_values[j]].concat(prediction[0][0])); // Add Tg_values at the beginning of each prediction
        }

        // Separate T_g values and emission/absorption values
        var Tg_vals = outputData.map(row => row[0]);
        var emission_vals = outputData.map(row => row[1]);

        // Create a trace for each row
        var trace = {
            x: Tg_vals,
            y: emission_vals,
            mode: 'lines',
            name: 'Row ' + (i + 1), // naming each trace
            line: { shape: 'spline' },
        };
        traces.push(trace);
    }

    var layout = {
        title: mode === 'emis' ? 'Emissivity vs T<sub>g</sub>' : 'Absorptivity vs T<sub>g</sub>',
        xaxis: {
            title: 'T<sub>g</sub> (K)',
            range: [200, 3000.0]
        },
        yaxis: {
            title: mode === 'emis' ? 'Emissivity' : 'Absorptivity',
            type: 'log',
            range: [-3.5, 0.15]
        },
        showlegend: true, 
        autosize: false,
        width: 500,
        height: 500,
        margin: {
            l: 50,
            r: 50,
            b: 100,
            t: 100,
            pad: 4
        },
    };
    
    Plotly.newPlot('plot', traces, layout);
    

    // Plotting all traces
    Plotly.newPlot('plot', traces, layout);
}



async function validateInput(input) {
    var value = parseFloat(input.value);
    var cellIndex = input.parentElement.cellIndex;


    if (mode=="emis"){
        if(cellIndex === 0 && (value < 0.1 || value > 80.0)) {
            alert('Invalid input for p_t bar. Enter a value between 0.1 and 80.0');
            input.value = '';
        } else if(cellIndex === 1 && (value*parseFloat(input.parentNode.parentNode.cells[0].children[0].value) > 6000 || value*parseFloat(input.parentNode.parentNode.cells[0].children[0].value) < 0.1)) {
            alert('Invalid input for L cm. Product of L cm and p_t bar should be between 0.1 and 6000');
            input.value = '';
        } else if(cellIndex >= 2 && (value > 1.0 || (parseFloat(input.parentNode.parentNode.cells[2].children[0].value) + parseFloat(input.parentNode.parentNode.cells[3].children[0].value) + parseFloat(input.parentNode.parentNode.cells[4].children[0].value)) > 1.0)) {
            alert('Invalid input for x. Each value should not be larger than 1.0, and their summation should also not be larger than 1.0');
            input.value = '';
        }
    }else if (mode=="abso"){
        if(cellIndex === 0 && (value < 0.1 || value > 80.0)) {
            alert('Invalid input for p_t bar. Enter a value between 0.1 and 80.0');
            input.value = '';
        } else if((cellIndex === 1) && (value > 3000.0 || value < 300.0)) {
            alert('Invalid input for T_s. Enter a value between 300.0 and 3000.0');
            input.value = '';
        } else if(cellIndex === 2 && (value*parseFloat(input.parentNode.parentNode.cells[0].children[0].value) > 6000 || value*parseFloat(input.parentNode.parentNode.cells[0].children[0].value) < 0.1)) {
            alert('Invalid input for L cm. Product of L cm and p_t bar should be between 0.1 and 6000');
            input.value = '';
        } else if(cellIndex > 2 && (value > 1.0 || (parseFloat(input.parentNode.parentNode.cells[3].children[0].value) + parseFloat(input.parentNode.parentNode.cells[4].children[0].value) + parseFloat(input.parentNode.parentNode.cells[5].children[0].value)) > 1.0)) {
            alert('Invalid input for x. Each value should not be larger than 1.0, and their summation should also not be larger than 1.0');
            input.value = '';
        }
    }

}