import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '//api/admin';

// ---------- helpers: convert between database values and form values ----------
const toFormValue = (field, value) => {
  switch (field.kind) {
    case 'boolean': return !!value;
    case 'stringArray': return Array.isArray(value) ? value.join(', ') : '';
    case 'json': return JSON.stringify(value ?? (field.shape === 'array' ? [] : {}), null, 2);
    case 'number': return value === undefined || value === null ? '' : String(value);
    case 'date': return value ? new Date(value).toLocaleString('en-IN') : '';
    default: return field.secret ? '' : (value ?? '');
  }
};

const blankFormValues = (fields) => {
  const values = {};
  fields.forEach((f) => {
    if (f.readOnly) return;
    const def = f.default;
    if (f.kind === 'boolean') values[f.name] = def === undefined ? false : !!def;
    else if (f.kind === 'json') values[f.name] = JSON.stringify(def ?? (f.shape === 'array' ? [] : {}), null, 2);
    else if (f.kind === 'stringArray') values[f.name] = Array.isArray(def) ? def.join(', ') : '';
    else values[f.name] = def === undefined || typeof def === 'object' ? '' : String(def);
  });
  return values;
};

const prettyName = (name) => name.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');

function Cell({ field, value }) {
  if (value === undefined || value === null || value === '') return <span className="text-stone-300">—</span>;
  if (field.kind === 'boolean') {
    return value ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-stone-400 font-black">✗</span>;
  }
  if (field.kind === 'stringArray') {
    if (!value.length) return <span className="text-stone-300">—</span>;
    return (
      <div className="flex flex-wrap gap-1 max-w-[260px]">
        {value.slice(0, 4).map((v) => <span key={v} className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] font-mono">{v}</span>)}
        {value.length > 4 && <span className="text-[10px] text-stone-400 font-bold">+{value.length - 4}</span>}
      </div>
    );
  }
  if (field.kind === 'json') {
    const text = JSON.stringify(value);
    return <code title={text} className="block max-w-[240px] truncate text-[10px] text-stone-500">{text}</code>;
  }
  if (field.kind === 'date') {
    return <span className="whitespace-nowrap text-stone-400">{new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>;
  }
  if (field.secret) return <span className="text-stone-400 tracking-widest">{String(value)}</span>;
  return <span title={String(value)} className="block max-w-[260px] truncate">{String(value)}</span>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const activeUser_id = localStorage.getItem('activeUser_id') || 'Admin_Session';
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const [adminProfile, setAdminProfile] = useState({ User_id: activeUser_id, firstName: 'Admin' });
  const [profileLoading, setProfileLoading] = useState(true);

  const [tables, setTables] = useState([]);
  const [activeTable, setActiveTable] = useState('shells');
  const [schema, setSchema] = useState(null);
  const [rows, setRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [search, setSearch] = useState('');

  // modal: { mode: 'add' | 'edit', id, values }
  const [modal, setModal] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const notify = (text, type = 'ok') => {
    setToast({ text, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  // every admin call carries the administrator's User_id so the server can verify it
  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API}/${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'x-admin-id': activeUser_id, ...(options.headers || {}) }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `Request failed (${res.status})`);
    return data;
  }, [activeUser_id]);

  useEffect(() => {
    fetch(`//api/user/profile/${activeUser_id}`)
      .then((res) => res.json())
      .then((data) => { if (data && !data.message) setAdminProfile(data); })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [activeUser_id]);

  const loadTableList = useCallback(() => {
    api('tables').then(setTables).catch((e) => notify(e.message, 'error'));
  }, [api]);

  const loadActiveTable = useCallback(async () => {
    setTableLoading(true);
    try {
      const [schemaData, rowData] = await Promise.all([api(`${activeTable}/schema`), api(activeTable)]);
      setSchema(schemaData);
      setRows(Array.isArray(rowData) ? rowData : []);
    } catch (e) {
      setSchema(null);
      setRows([]);
      notify(e.message, 'error');
    } finally {
      setTableLoading(false);
    }
  }, [api, activeTable]);

  useEffect(() => { if (isAdmin) loadTableList(); }, [isAdmin, loadTableList]);
  useEffect(() => { if (isAdmin) { setSearch(''); setModal(null); loadActiveTable(); } }, [isAdmin, loadActiveTable]);

  const handleSecureLogout = () => {
    localStorage.clear();
    navigate('/auth');
    window.location.reload();
  };

  // ---------- add / edit / delete ----------
  const openAdd = () => {
    if (!schema) return;
    setFormError('');
    setModal({ mode: 'add', values: { ...(schema.customId ? { _id: schema.nextId } : {}), ...blankFormValues(schema.fields) } });
  };

  const openEdit = (row) => {
    setFormError('');
    const values = {};
    schema.fields.forEach((f) => { if (!f.readOnly) values[f.name] = toFormValue(f, row[f.name]); });
    setModal({ mode: 'edit', id: row._id, values });
  };

  const setValue = (name, value) => setModal((m) => ({ ...m, values: { ...m.values, [name]: value } }));

  const suggestAgain = async () => {
    try {
      const fresh = await api(`${activeTable}/schema`);
      setSchema(fresh);
      setValue('_id', fresh.nextId);
    } catch (e) { setFormError(e.message); }
  };

  const submitModal = async (e) => {
    e.preventDefault();
    setFormError('');

    // catch broken JSON before it leaves the browser
    for (const f of schema.fields) {
      if (f.kind === 'json' && !f.readOnly) {
        try { JSON.parse(modal.values[f.name] || 'null'); } catch { setFormError(`"${prettyName(f.name)}" is not valid JSON`); return; }
      }
    }

    const payload = {};
    Object.entries(modal.values).forEach(([k, v]) => { payload[k] = v; });
    if (modal.mode === 'edit') delete payload._id;

    setSaving(true);
    try {
      if (modal.mode === 'add') {
        const created = await api(activeTable, { method: 'POST', body: JSON.stringify(payload) });
        notify(`Added ${created._id}`);
      } else {
        await api(`${activeTable}/${modal.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        notify(`Saved changes to ${modal.id}`);
      }
      setModal(null);
      loadActiveTable();
      loadTableList();
    } catch (err) {
      setFormError(err.message === 'Failed to fetch' ? 'Cannot reach the server. Is the backend running?' : err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (row) => {
    const label = row._id;
    if (!window.confirm(`Delete ${label} from ${schema?.label || activeTable}?\n\nThis permanently removes it from the database.`)) return;
    try {
      await api(`${activeTable}/${row._id}`, { method: 'DELETE' });
      setRows((prev) => prev.filter((r) => r._id !== row._id));
      notify(`Deleted ${label}`);
      loadTableList();
    } catch (e) { notify(e.message, 'error'); }
  };

  // ---------- derived ----------
  const needle = search.trim().toLowerCase();
  const visibleRows = needle ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle)) : rows;
  const groups = [...new Set(tables.map((t) => t.group))];

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center py-20 text-center space-y-4 max-w-sm mx-auto font-sans">
        <div className="text-5xl">🔐</div>
        <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900">Administrator access only</h2>
        <p className="text-xs text-stone-500 font-medium">Sign in with an administrator account to manage the database.</p>
        <button onClick={() => navigate('/auth')} className="px-6 py-3 bg-neutral-900 hover:bg-amber-600 text-white font-black text-xs tracking-widest uppercase rounded-full cursor-pointer transition-colors">Go to sign in</button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="text-xs font-black tracking-widest text-stone-400 uppercase">Loading admin panel...</span>
      </div>
    );
  }

  const editableFields = schema ? schema.fields.filter((f) => !f.readOnly) : [];
  const inputCls = 'w-full px-3 py-2 text-sm font-medium border border-stone-300 rounded-lg outline-none focus:border-amber-600 bg-white';

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-tight">Welcome, Admin</h1>
            <span className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-sm border bg-amber-950 border-amber-700 text-amber-400">👑 Full Root Privileges Active</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">Logged in as <strong className="text-white font-bold">@{adminProfile.User_id}</strong></p>
        </div>
        <button onClick={handleSecureLogout} className="px-8 py-3 bg-zinc-800 hover:bg-red-600 text-white font-black text-xs tracking-widest uppercase rounded-full shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">Logout</button>
      </div>

      {/* Data manager */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/50 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black uppercase tracking-wider text-red-600">🛠️ Database manager</h3>
            <p className="text-[10.5px] text-stone-500 font-semibold uppercase tracking-wide">Add, edit and delete records in all {tables.length || 17} tables. Every column is editable.</p>
          </div>
          <select
            value={activeTable}
            onChange={(e) => setActiveTable(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl outline-none cursor-pointer text-neutral-900 hover:bg-stone-100"
          >
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {tables.filter((t) => t.group === g).map((t) => (
                  <option key={t.key} value={t.key}>{t.label} ({t.count})</option>
                ))}
              </optgroup>
            ))}
            {tables.length === 0 && <option value={activeTable}>{activeTable}</option>}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${schema?.label || 'table'}...`}
              className="w-full sm:max-w-xs px-3 py-2 text-xs font-semibold border border-stone-300 rounded-lg outline-none focus:border-amber-600"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 whitespace-nowrap">{visibleRows.length} of {rows.length} rows</span>
          </div>
          <button onClick={openAdd} disabled={!schema} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-2xs cursor-pointer active:scale-95 transition">➕ Add new record</button>
        </div>

        {tableLoading ? (
          <div className="text-center py-12 font-black text-xs text-stone-400 uppercase tracking-widest animate-pulse">Loading table...</div>
        ) : !schema ? (
          <div className="text-center py-12 text-xs font-bold text-red-600">Could not load this table. Check that the backend is running and you are signed in as an admin.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 text-[10px] font-black tracking-wider text-stone-700 uppercase whitespace-nowrap">
                  <th className="p-3 sticky left-0 bg-stone-100 z-10">ID</th>
                  {schema.fields.map((f) => <th key={f.name} className="p-3">{prettyName(f.name)}</th>)}
                  <th className="p-3 text-center sticky right-0 bg-stone-100 z-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-[11px] font-semibold text-stone-600">
                {visibleRows.length === 0 && (
                  <tr><td colSpan={schema.fields.length + 2} className="p-8 text-center text-stone-400 font-bold uppercase tracking-wider">{rows.length === 0 ? 'This table is empty' : 'No rows match your search'}</td></tr>
                )}
                {visibleRows.map((row) => (
                  <tr key={row._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-neutral-900 text-xs sticky left-0 bg-white whitespace-nowrap" title={row._id}>
                      {schema.customId ? row._id : `…${String(row._id).slice(-6)}`}
                    </td>
                    {schema.fields.map((f) => (
                      <td key={f.name} className="p-3 align-top"><Cell field={f} value={row[f.name]} /></td>
                    ))}
                    <td className="p-3 text-center space-x-1.5 whitespace-nowrap sticky right-0 bg-white">
                      <button onClick={() => openEdit(row)} className="px-2.5 py-1 bg-stone-50 hover:bg-amber-100 text-stone-700 hover:text-amber-800 font-black text-[9px] uppercase tracking-widest rounded-sm transition cursor-pointer">Edit</button>
                      <button onClick={() => deleteRow(row)} className="px-2.5 py-1 bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-600 font-black text-[9px] uppercase tracking-widest rounded-sm transition cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / edit modal */}
      {modal && schema && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setModal(null); }}>
          <form onSubmit={submitModal} className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                  {modal.mode === 'add' ? 'Add new' : 'Edit'} · {schema.label}
                </h2>
                {modal.mode === 'edit' && <p className="text-[10px] font-mono font-bold text-stone-400 mt-0.5">{modal.id}</p>}
              </div>
              <button type="button" onClick={() => !saving && setModal(null)} aria-label="Close" className="text-stone-400 hover:text-neutral-900 text-xl leading-none cursor-pointer">✕</button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formError && (
                <div className="sm:col-span-2 rounded-lg px-3 py-2 text-xs font-bold bg-red-50 text-red-700 border border-red-200">⚠️ {formError}</div>
              )}

              {/* ID */}
              {schema.customId && (
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">ID</label>
                  {modal.mode === 'add' ? (
                    <>
                      <div className="flex gap-2">
                        <input
                          value={modal.values._id || ''}
                          onChange={(e) => setValue('_id', e.target.value)}
                          className={`${inputCls} font-mono font-bold`}
                          required
                        />
                        <button type="button" onClick={suggestAgain} className="px-3 text-[10px] font-black uppercase tracking-wider bg-stone-100 hover:bg-stone-200 rounded-lg whitespace-nowrap cursor-pointer">↻ Suggest</button>
                      </div>
                      <p className="text-[10px] text-stone-400 font-medium">Next free ID in this table's sequence ({schema.prefix}_xx). You can type your own. It must be unique.</p>
                    </>
                  ) : (
                    <>
                      <input value={modal.id} disabled className={`${inputCls} font-mono font-bold bg-stone-100 text-stone-500`} />
                      <p className="text-[10px] text-stone-400 font-medium">The ID is the record's key and can't change. To use a different ID, add a new record and delete this one.</p>
                    </>
                  )}
                </div>
              )}
              {!schema.customId && modal.mode === 'add' && (
                <p className="sm:col-span-2 text-[10px] text-stone-400 font-medium">The ID for this table is generated by MongoDB automatically.</p>
              )}

              {/* every editable column */}
              {editableFields.map((f) => {
                const label = (
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-1">
                    {prettyName(f.name)}{f.required && <span className="text-red-500">*</span>}
                  </label>
                );
                const value = modal.values[f.name];

                if (f.kind === 'boolean') {
                  return (
                    <label key={f.name} className="flex items-center gap-3 px-3 py-2 border border-stone-200 rounded-lg cursor-pointer select-none">
                      <input type="checkbox" checked={!!value} onChange={(e) => setValue(f.name, e.target.checked)} className="w-4 h-4 accent-amber-600" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-stone-700">{prettyName(f.name)}</span>
                    </label>
                  );
                }

                const wide = f.kind === 'json' || f.long || f.kind === 'stringArray';
                return (
                  <div key={f.name} className={`space-y-1 ${wide ? 'sm:col-span-2' : ''}`}>
                    {label}
                    {f.enum ? (
                      <select value={value} onChange={(e) => setValue(f.name, e.target.value)} className={inputCls} required={f.required}>
                        <option value="">Select...</option>
                        {f.enum.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.kind === 'json' ? (
                      <textarea value={value} onChange={(e) => setValue(f.name, e.target.value)} rows={6} spellCheck={false} className={`${inputCls} font-mono text-xs`} />
                    ) : f.long ? (
                      <textarea value={value} onChange={(e) => setValue(f.name, e.target.value)} rows={3} className={inputCls} required={f.required} />
                    ) : f.kind === 'number' ? (
                      <input type="number" step="any" value={value} onChange={(e) => setValue(f.name, e.target.value)} className={inputCls} required={f.required} />
                    ) : (
                      <input
                        type={f.secret ? 'password' : 'text'}
                        value={value}
                        onChange={(e) => setValue(f.name, e.target.value)}
                        placeholder={f.secret && modal.mode === 'edit' ? 'Leave blank to keep the current password' : ''}
                        autoComplete="off"
                        className={inputCls}
                        required={f.required && !(f.secret && modal.mode === 'edit')}
                      />
                    )}
                    {f.kind === 'stringArray' && <p className="text-[10px] text-stone-400 font-medium">Separate values with commas (e.g. SH_01, PR_02, CH_01).</p>}
                    {f.kind === 'json' && <p className="text-[10px] text-stone-400 font-medium">Edit as JSON. Invalid JSON is rejected.</p>}
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} disabled={saving} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-white border border-stone-300 hover:bg-stone-100 rounded-full cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-neutral-900 hover:bg-amber-600 disabled:opacity-50 text-white rounded-full cursor-pointer transition">
                {saving ? 'Saving...' : modal.mode === 'add' ? 'Add record' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[90] px-5 py-3 rounded-full shadow-xl text-xs font-black tracking-wide uppercase ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white'}`}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.text}
        </div>
      )}
    </div>
  );
}
