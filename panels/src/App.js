import React from 'react';
import logo from './logo.svg';
import './App.css';
import Tabs from './components/Tabs';
import Building from './components/building/Building'
require('./App.css');

function App() {
  return (
    <div>
      <h1>ML-Bros</h1>
     <Tabs>
      <div label="Building">
        <Building />
      </div>
      <div label="Neural Net">
      </div>
    </Tabs>
    <Tabs>
      <div label="Graph">
      </div>
      <div label="Results">
      </div>
    </Tabs>
    </div>
  );
}

export default App;
