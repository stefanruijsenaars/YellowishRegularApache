import React, { useState, useEffect } from 'react';
import ReplView from './repl-view';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

const Repl = () => {

  const [lines, setLines] = useState([])
  const [contextId, setContextId] = useState("");

  const onSubmit = async (execLine) => {
    setLines([...lines, { type: "input", value: execLine }]);

    try {
      const response = await axios.post('https://flatval.masfrost.repl.co/', { code: execLine,
      contextId });
      console.log(response);
     // setLines([...lines, { type: "output", value: JSON.stringify(response) }]);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => setContextId(uuid()), []);

  const height = 500;

  return (<ReplView
      title="Repl Demo"
      tabs={["Javascript"]}
      selectedTab="Javascript"
      onChangeTab={() => null}
      onSubmit={onSubmit}
      height={height}
      lines={lines}
      onClear={() => setLines([])}
    />);
};

export default Repl;
