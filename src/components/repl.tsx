import React, { useState, useEffect } from 'react';
import ReplView from './repl-view';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import "@fontsource/ibm-plex-mono";

function parse(item, idx, result, parsed = new Set([])) {
  if (item.type === 'null') {
    return 'NULL: null';
  }
  if (item.type === 'boolean') {
    return 'BOOL: ' + item.value;
  }
  if (item.type === 'number') {
    return 'NUMBER: ' + item.value;
  }
  if (item.type === 'undefined') {
    return 'UNDEFINED: undefined';
  }
  if (item.type === 'string') {
    return 'STRING: ' + item.value;
  }

  if (item.type === 'error') {
    return `ERROR:\nNAME: ${item.value.name}\nMESSAGE: ${item.value.message}, \nSTACK ${item.value.stack}`;
  }
  if (item.type === 'array') {
    if (parsed.has(idx)) {
      return `REFERENCE: ARRAY ${idx}`;
    }
    parsed.add(idx);
    return `ARRAY ${idx}:
  [
       ${item.value.map(x => parse(result[x], idx, result, parsed)).join(',\n    ')}
  ]`;
  }
  if (item.type === 'object') {
    if (parsed.has(idx)) {
      return `REFERENCE: OBJECT ${idx}`;
    }
    parsed.add(idx);
    return `OBJECT ${idx}:
  {
    ${item.value.map(
      (x) => parse(result[x.key], x.key, result, parsed) + ' -> ' + parse(result[x.value], x.value, result, parsed)).join(',\n    ')}
  }`;
  }

}


const Repl = () => {

  const [lines, setLines] = useState([])
  const [contextId, setContextId] = useState("");
  const [heap, setHeap] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (execLine) => {
    setLines([...lines, { type: "input", value: execLine }]);
  }

  useEffect(async () => {
    if (lines[lines.length - 1] && lines[lines.length - 1].type === 'input') {
      try {
        setIsSubmitting(true);
        const response = await axios.post('https://flatval.masfrost.repl.co/', {
          code: lines[lines.length - 1].value,
          contextId
        });
        setIsSubmitting(false);

        setLines([...lines, { type: "output", value: parse(response.data.result[0], 0, response.data.result) }]);
      } catch (e) {
        setIsSubmitting(false);

        if (e.response && e.response.data && e.response.status === 500) {
          setLines([...lines, { type: "output", value: 'SERVER ERROR: ' + e.response.data }])
        }
      }
    }
  }, [lines]);

  useEffect(() => setContextId(uuid()), []);

  const height = 800;

  return (<ReplView
    title="MyReplSpace"
    isSubmitting={isSubmitting}
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
