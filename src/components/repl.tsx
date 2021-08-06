import {React, useState } from 'react';
import ReplView from './repl-view';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

const Repl = () => {

  const [lines, setLines] = useState([])
  const [contextId, setContextId] = useState(uuid());

  const onSubmit = async (execLine) => {
    const newLines = lines.concat([{ type: "input", value: execLine }]);
    setLines(newLines);

    try {
      const response = await axios.post('https://flatval.masfrost.repl.co/', { code: execLine,
      contextId });
      setLines([...lines, JSON.stringify(response)]);
    } catch (e) {
      console.error(e);
    }
    
    setLines(newLines.concat(['response']));
  }


  const height = 500;

  return (<ReplView
      title="Repl Demo"
      tabs={["Javascript"]}
      selectedTab="Javascript"
      onSubmit={onSubmit}
      height={height}
      lines={lines}
      onClear={() => setLines([])}
    />);
};

export default Repl;
