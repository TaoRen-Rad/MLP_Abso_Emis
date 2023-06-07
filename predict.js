async function predict(xp) {
    const lmbda = 1/10;

    if(model === null) {
        alert('Model is not loaded yet. Please click on "Load Model" button to load the model before calculating.');
        return;
    }

    // Preprocess your data
    let tensorData = tf.tensor2d(xp, [1, 7]);

    // Calculate p*L and replace the fourth element (L)
    const pLData = tensorData.slice([0, 0], [-1, 1]).mul(tensorData.slice([0, 3], [-1, 1]));
    tensorData = tensorData.slice([0, 0], [-1, 3]).concat(pLData, 1).concat(tensorData.slice([0, 4], [-1, 3]), 1);

    // Apply log transformation only to the fourth element (p*L)
    const logData = tensorData.slice([0, 3], [-1, 1]).log();

    // Get first three elements (p, T_s, T_g) without any transformation
    const firstThreeElements = tensorData.slice([0, 0], [-1, 3]);

    // Apply transform function to the last three elements
    const transformData = tensorData.slice([0, 4], [-1, 3]).pow(lmbda).sub(1).div(lmbda);

    // Concatenate the untransformed data, log transformed data and the transformed data
    const processedData = firstThreeElements.concat(logData, 1).concat(transformData, 1);

    // Make a prediction
    const prediction = model.predict(processedData);

    // Dispose of tensors
    tensorData.dispose();
    logData.dispose();
    transformData.dispose();
    pLData.dispose();
    firstThreeElements.dispose();
    processedData.dispose();

    // Return prediction as JavaScript array
    return prediction.arraySync();
}
