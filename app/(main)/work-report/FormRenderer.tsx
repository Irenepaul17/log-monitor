"use client";

import React from 'react';
import type { Answers, FormSchema, Question } from './formSchema';
import { isVisible } from './formSchema';

type Props = {
  schema: FormSchema;
  answers: Answers;
  setAnswer: (id: string, value: any) => void;
  getOptions?: (q: Question, answers: Answers) => { value: string; label?: string }[];
};

function Label({ q }: { q: Question }) {
  return (
    <label>
      {q.label}
      {q.required ? ' *' : ''}
    </label>
  );
}

export function FormRenderer({ schema, answers, setAnswer, getOptions }: Props) {
  return (
    <>
      {schema.questions.map(q => {
        if (!isVisible(q, answers)) return null;

        const options = (q.options || getOptions?.(q, answers))?.map(o => ({
          value: o.value,
          label: o.label ?? o.value
        }));

        // Use storageKey if available, otherwise fallback to ID
        const key = q.storageKey || q.id;
        const value = answers[key];

        return (
          <div key={q.id} className="input-group">
            <Label q={q} />
            {q.helpText && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{q.helpText}</div>}

            {q.type === 'select' && (
              <select value={value ?? ''} onChange={e => setAnswer(key, e.target.value)} required={!!q.required}>
                <option value="">-- Select --</option>
                {(options || []).map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}

            {(q.type === 'multiselect' || q.type === 'checkbox') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                {(options || []).map(o => {
                  const arr: string[] = Array.isArray(value) ? value : [];
                  const checked = arr.includes(o.value);
                  return (
                    <label
                      key={o.value}
                      style={{
                        fontWeight: 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                          const next = e.target.checked ? [...arr, o.value] : arr.filter(x => x !== o.value);
                          setAnswer(key, next);
                        }}
                        style={{ flexShrink: 0, width: 'auto' }}
                      />
                      <span style={{ fontSize: '14px' }}>{o.label}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === 'textarea' && (
              <textarea rows={4} value={value ?? ''} onChange={e => setAnswer(key, e.target.value)} required={!!q.required} placeholder={q.placeholder} />
            )}

            {q.type === 'text' && (
              <input type="text" value={value ?? ''} onChange={e => setAnswer(key, e.target.value)} required={!!q.required} placeholder={q.placeholder} />
            )}

            {q.type === 'number' && (
              <input type="number" value={value ?? ''} onChange={e => setAnswer(key, e.target.value)} required={!!q.required} placeholder={q.placeholder} />
            )}

            {q.type === 'date' && (
              <input type="date" value={value ?? ''} onChange={e => setAnswer(key, e.target.value)} required={!!q.required} />
            )}

            {q.type === 'time' && (
              <input type="time" value={value ?? ''} onChange={e => setAnswer(key, e.target.value)} required={!!q.required} />
            )}
          </div>
        );
      })}
    </>
  );
}

