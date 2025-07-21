import React, { useState } from 'react';

const Field = ({ field, onChange, onAdd, onRemove, parentIndex, index }) => {
  const handleChange = (key, value) => {
    onChange(parentIndex, index, { ...field, [key]: value });
  };

  const handleAddChild = () => {
    const updatedField = {
      ...field,
      children: [...(field.children || []), { name: '', type: 'string', children: [] }],
    };
    onChange(parentIndex, index, updatedField);
  };

  return (
    <div className="ml-4 mb-4 border-l-2 pl-4">
      <div className="flex gap-2 items-center">
        <input
          className="border px-2 py-1"
          placeholder="Field name"
          value={field.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <select
          className="border px-2 py-1"
          value={field.type}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="nested">nested</option>
        </select>
        <button className="text-red-500" onClick={() => onRemove(parentIndex, index)}>🗑️</button>
        {field.type === 'nested' && (
          <button
            className="text-green-600 border px-2 py-1 rounded"
            onClick={handleAddChild}
          >
            + Add Child
          </button>
        )}
      </div>

      {field.type === 'nested' && field.children?.map((child, idx) => (
        <Field
          key={idx}
          field={child}
          parentIndex={index}
          index={idx}
          onChange={(pIdx, cIdx, updated) => {
            const newChildren = [...field.children];
            newChildren[cIdx] = updated;
            handleChange('children', newChildren);
          }}
          onRemove={(pIdx, cIdx) => {
            const newChildren = [...field.children];
            newChildren.splice(cIdx, 1);
            handleChange('children', newChildren);
          }}
        />
      ))}
    </div>
  );
};

const JsonSchemaBuilder = () => {
  const [fields, setFields] = useState([
    { name: '', type: 'string', children: [] }
  ]);

  const handleFieldChange = (pIdx, idx, updatedField) => {
    const newFields = [...fields];
    if (pIdx === null || pIdx === undefined) {
      newFields[idx] = updatedField;
    } else {
      newFields[pIdx].children[idx] = updatedField;
    }
    setFields(newFields);
  };

  const handleAddField = () => {
    setFields([...fields, { name: '', type: 'string', children: [] }]);
  };

  const handleRemoveField = (pIdx, idx) => {
    const newFields = [...fields];
    if (pIdx === null || pIdx === undefined) {
      newFields.splice(idx, 1);
      setFields(newFields);
    } else {
      const updatedChildren = [...newFields[pIdx].children];
      updatedChildren.splice(idx, 1);
      newFields[pIdx].children = updatedChildren;
      setFields(newFields);
    }
  };

  const generateSchema = (fields) => {
    if (!Array.isArray(fields)) return {};
    const schema = {};
    fields.forEach(field => {
      if (field.type === 'nested') {
        schema[field.name || 'unnamed'] = generateSchema(field.children || []);
      } else {
        schema[field.name || 'unnamed'] = field.type;
      }
    });
    return schema;
  };

  const jsonOutput = generateSchema(fields);

  return (
    <div className="flex h-screen">
      {/* Left: Field Builder */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">JSON Schema Builder</h2>
        {fields.map((field, index) => (
          <Field
            key={index}
            field={field}
            index={index}
            parentIndex={null}
            onChange={handleFieldChange}
            onRemove={handleRemoveField}
          />
        ))}
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleAddField}
        >
          + Add Field
        </button>
      </div>

      {/* Right: Live JSON Preview */}
      <div className="w-1/2 bg-gray-100 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Live JSON Output</h2>
        <pre className="bg-white p-4 border rounded overflow-x-auto">
          {JSON.stringify(jsonOutput, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonSchemaBuilder;
