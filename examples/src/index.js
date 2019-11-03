import React from 'react';
import { render} from 'react-dom';
import conditionRender from '@/';

function App() {
  const condition = [<input value={1} />, <input value={2} />, <input value={3} />];
  return conditionRender(condition);
}

render(<App />, document.getElementById("root"));