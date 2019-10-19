import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Tabs from './components/Tabs';
import Building from './components/building/Building'
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'
require('./App.css');

/**
 * Get the car data reduced to just the variables we are interested
 * and cleaned of missing data.
 */
async function getData(carsData) {
  const cleaned = carsData.map(car => ({
    mpg: car.Miles_per_Gallon,
    horsepower: car.Horsepower,
  }))
  .filter(car => (car.mpg != null && car.horsepower != null));

  return cleaned;
}

/**
 * Convert the input data to tensors that we can use for machine
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any
  // intermediate tensors.

  return tf.tidy(() => {
    // Step 1. Shuffle the data
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d.horsepower)
    const labels = data.map(d => d.mpg);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    }
  });
}

async function trainModel(model, inputs, labels) {
  // Prepare the model for training.
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse'],
  });

  const batchSize = 32;
  const epochs = 50;

  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss', 'mse'],
      { height: 200, callbacks: ['onEpochEnd'] }
    )
  });
}

function testModel(model, inputData, normalizationData) {
  const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

  // Generate predictions for a uniform range of numbers between 0 and 1;
  // We un-normalize the data by doing the inverse of the min-max scaling
  // that we did earlier.
  const [xs, preds] = tf.tidy(() => {

    const xs = tf.linspace(0, 1, 100);
    const preds = model.predict(xs.reshape([100, 1]));

    const unNormXs = xs
      .mul(inputMax.sub(inputMin))
      .add(inputMin);

    const unNormPreds = preds
      .mul(labelMax.sub(labelMin))
      .add(labelMin);

    // Un-normalize the data
    return [unNormXs.dataSync(), unNormPreds.dataSync()];
  });


  const predictedPoints = Array.from(xs).map((val, i) => {
    return {x: val, y: preds[i]}
  });

  const originalPoints = inputData.map(d => ({
    x: d.horsepower, y: d.mpg,
  }));


  tfvis.render.scatterplot(
    {name: 'Model Predictions vs Original Data'},
    {values: [originalPoints, predictedPoints], series: ['original', 'predicted']},
    {
      xLabel: 'Horsepower',
      yLabel: 'MPG',
      height: 300
    }
  );
}

async function run(model, carsData) {
  // Load and plot the original input data that we are going to train on.
  const data = await getData(carsData);
  const values = data.map(d => ({
    x: d.horsepower,
    y: d.mpg,
  }));

  tfvis.render.scatterplot(
    {name: 'Horsepower v MPG'},
    {values},
    {
      xLabel: 'Horsepower',
      yLabel: 'MPG',
      height: 300
    }
  );

  // More code will be added below

  // Convert the data to a form we can use for training.
  const tensorData = convertToTensor(data);
  const {inputs, labels} = tensorData;

  // Train the model
  await trainModel(model, inputs, labels);
  console.log('Done Training');

  // Make some predictions using the model and compare them to the
  // original data
  testModel(model, data, tensorData);
}

class App extends Component {
  constructor(props) {
    super(props);

    this.setModel = this.setModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.TrainModel = this.TrainModel.bind(this);
    this.Test = this.Test.bind(this);
    this.Train = this.Train.bind(this);
    this.reader = new FileReader();
  }
  // Entry point for setup
  setModel(model) {
    console.log("Model passed: " + model);
    this.model = model;
  }

  Build() {
    if(!this.model) {
      return;
    }
    this.tfmodel = tf.sequential();
    for(var l = 1; l < this.model.layers.length; l++) {
      let data = { units: this.model.layers[l].n_nodes, activation: this.model.layers[l].activation };
      if(l == 1) {
        data.inputShape = [this.model.layers[0].n_nodes];
      }
    
      this.tfmodel.add(tf.layers.dense(data));
    }
  }
  
  getModel() {
    return this.model;
  }

  // Entry point for Training
  Train() {
    let f = document.getElementById("train_f").files[0];
    if(f) {
      this.reader.readAsText(f, "ASCII");
      this.reader.onload = this.TrainModel;
    }
  }

  TrainModel(e) {
    let data = JSON.parse(e.target.result);
    this.Build();
    run(this.tfmodel, data);
  }

  Test(model) {
  }

  render() {
    return (
      <div>
        <h1>ML-Bros</h1>
       <Tabs> 
        <div id="building" label="Building">
          <Building test={this.Test} train={this.Train} getModel={this.getModel} setModel={this.setModel}/>
        </div>
        <div label="Neural Net">
        </div>
        <div label="Graph">
        </div>
        <div label="Results">
        </div>
      </Tabs>
      </div>
    );
  }
}

export default App;
