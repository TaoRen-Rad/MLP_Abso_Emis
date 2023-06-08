let model = null;

async function loadModel() {
    const modelSelector = document.getElementById('model-selector');
    const MODEL_PATH = modelSelector.value;
    model = await tf.loadGraphModel(MODEL_PATH);
    document.getElementById('load-button').style.display = 'none';
    document.getElementById('model-selector').style.display = 'none';
    document.getElementById('model-interactions').style.display = 'block';
    alert('Model Loaded Successfully!');
}

function addRow() {
    var table = document.getElementById('data-table');
    var row = table.insertRow(-1);

    // get the number of rows in the table
    var num_rows = table.rows.length;

    // check if it's the first row or not
    var firstRow = num_rows <= 2; // including the header row

    var defaultValues;


    // Define default values for each cell
    defaultValues = firstRow ? [1.0, 300.0, 300.0, 0.1, 0.0, 0.0, 0.0] : getDefaultValues(table, 7);

    for (var i = 0; i < defaultValues.length; i++) {
        var cell = row.insertCell(i);

        // Set the default value in the input field
        var defaultValue = defaultValues[i];
        cell.innerHTML = '<input type="number" value="' + defaultValue + '" onchange="validateInput(this)">';
    }
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

async function calculate() {
    var table = document.getElementById('data-table');
    var rows = table.rows;
    var rowCount = rows.length;

    for (var i = 1; i < rowCount; i++) {
        var row = rows[i];
        var cells = row.cells;
        var cellCount = cells.length;
        var inputValues = [];

        for (var j = 0; j < 7; j++) {
            inputValues.push(parseFloat(cells[j].children[0].value));
        }

        var output = await predict(inputValues);
        if (cellCount==8) {
            var alphaCell = cells[7];
        } else{
            var alphaCell = row.insertCell(cellCount);
        }

        // Assuming output is a 2D array with a single column
        var alphaValue = output[0][0];
        alphaValue = parseFloat(alphaValue).toFixed(5);
        alphaCell.textContent = alphaValue;
    }
}


function validateInput(input) {
    var value = parseFloat(input.value);
    var cellIndex = input.parentElement.cellIndex;
    if(cellIndex === 0 && (value < 0.1 || value > 80.0)) {
        alert('Invalid input for p_t bar. Enter a value between 0.1 and 80.0');
        input.value = '';
    } else if((cellIndex === 1 || cellIndex === 2) && (value > 3000.0 || value < 300.0)) {
        alert('Invalid input for T_s K or T_g K. Enter a value between 300.0 and 3000.0');
        input.value = '';
    } else if(cellIndex === 3 && (value*parseFloat(input.parentNode.parentNode.cells[0].children[0].value) > 6000 || value*parseFloat(input.parentNode.parentNode.cells[0].children[0].value) < 0.1)) {
        alert('Invalid input for L cm. Product of L cm and p_t bar should be between 0.1 and 6000');
        input.value = '';
    } else if(cellIndex > 3 && (value > 1.0 || (parseFloat(input.parentNode.parentNode.cells[4].children[0].value) + parseFloat(input.parentNode.parentNode.cells[5].children[0].value) + parseFloat(input.parentNode.parentNode.cells[6].children[0].value)) > 1.0)) {
        alert('Invalid input for x. Each value should not be larger than 1.0, and their summation should also not be larger than 1.0');
        input.value = '';
    }
}