import React, { Component } from 'react';

class Building extends Component {

  render() {
    return (
      <script type="text/javascript" src="./drawingStuff.js"></script>
      <div class="container">
        <div id="menu-outer">
          <h3 class="layers-title">Layers</h3>
          <div class="table">
            <ul id="horizontal-list">
              <li draggable="true" ondragstart="dragLayer(event)" data-name="Sigmoid">
                <canvas id="sigmoid_canvas" width="150" height="30"></canvas>
              </li>
              <li draggable="true" ondragstart="dragLayer(event)" data-name="ReLu">
                <canvas id="relu_canvas" width="150" height="30"></canvas>
              </li>
              <li draggable="true" ondragstart="dragLayer(event)" data-name="Tanh">
                <canvas id="tanh_canvas" width="150" height="30"></canvas>
              </li>
            </ul>
          </div>
        </div>
        <div id="canvas-wrap">
          <canvas id="canvas" width="800" height="800" ondrop="canvasDrop(event)" ondragover="canvasAllowDrop(event)">
            <div class="no-canvas">Whoops! It looks like canvas isn't supported. Please upgrade to a newer browser.</div>
          </canvas>
          <div id="edit-tab">
            <h3 id="edit-title"></h3>
            <b>Number of Nodes</b><br>
            <input type="text" name="num_nodes" id="num_nodes"></input>
            <div id="invalid_nnodes" style="display:none">Please enter an integer greater than 0</div>
          </div>
        </div>
      </div>
    );
  }

}

export default Building;
