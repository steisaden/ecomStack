"use client";

import React, { useState } from 'react';

type Field = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  localized: boolean;
};

export default function CreateContentTypeForm() {
  const [sysId, setSysId] = useState('');
  const [name, setName] = useState('');
  const [displayField, setDisplayField] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addField = () => {
    setFields((prev) => [...prev, { id: '', name: '', type: 'Symbol', required: false, localized: false }]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof Field, value: any) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        sys: { id: sysId.trim() },
        name: name.trim(),
        displayField: displayField || (fields[0]?.id ?? ''),
        fields: fields.map((f) => ({
          id: f.id.trim(),
          name: f.name.trim(),
          type: f.type,
          required: !!f.required,
          localized: !!f.localized,
        })),
      };

      const res = await fetch('/api/admin/contentful/create-content-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`Failed: ${data.error || res.statusText}\nDetails: ${JSON.stringify(data.details || data, null, 2)}`);
      } else {
        alert(`Created: ${data.contentTypeId}`);
        setSysId('');
        setName('');
        setDisplayField('');
        setFields([{ id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false }]);
      }
    } catch (err: any) {
      alert('Request failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 border-t pt-4 mt-4">
      <div className="text-sm font-medium">Create a New Content Type</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-700">Content Type ID</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="e.g. aboutPage"
            value={sysId}
            onChange={(e) => setSysId(e.target.value)}
            required
            pattern="^[A-Za-z][A-Za-z0-9_-]*$"
            title="Start with a letter; letters, numbers, dashes, underscores allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Name</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="About Page"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Display Field</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="title"
            value={displayField}
            onChange={(e) => setDisplayField(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-2">
        <div className="text-sm font-medium mb-2">Fields</div>
        <div className="space-y-3">
          {fields.map((f, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
              <div>
                <label className="block text-xs text-gray-700">Field ID</label>
                <input className="mt-1 w-full border rounded px-2 py-1" value={f.id} onChange={(e) => updateField(i, 'id', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-gray-700">Name</label>
                <input className="mt-1 w-full border rounded px-2 py-1" value={f.name} onChange={(e) => updateField(i, 'name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-gray-700">Type</label>
                <select className="mt-1 w-full border rounded px-2 py-1" value={f.type} onChange={(e) => updateField(i, 'type', e.target.value)}>
                  <option>Symbol</option>
                  <option>Text</option>
                  <option>RichText</option>
                  <option>Boolean</option>
                  <option>Number</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input id={`req-${i}`} type="checkbox" checked={f.required} onChange={(e) => updateField(i, 'required', e.target.checked)} />
                <label htmlFor={`req-${i}`} className="text-xs">Required</label>
              </div>
              <div className="flex items-center gap-2">
                <input id={`loc-${i}`} type="checkbox" checked={f.localized} onChange={(e) => updateField(i, 'localized', e.target.checked)} />
                <label htmlFor={`loc-${i}`} className="text-xs">Localized</label>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => removeField(i)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addField} className="mt-3 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">+ Add Field</button>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-beauty-primary text-white rounded hover:bg-beauty-primary/90 disabled:opacity-50">
          {submitting ? 'Creating…' : 'Create Content Type'}
        </button>
      </div>
    </form>
  );
}