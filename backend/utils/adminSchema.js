// backend/utils/adminSchema.js — turns any Mongoose model into a field list the admin screen can render,
// and converts the admin form's values back into proper types.

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const TIMESTAMPS = ['createdAt', 'updatedAt'];

export function describeSchema(Model) {
  const customId = Model.schema.path('_id').instance === 'String';
  const fields = [];

  for (const [name, p] of Object.entries(Model.schema.paths)) {
    if (name === '__v' || name === '_id') continue;
    const o = p.options || {};
    const inner = p.embeddedSchemaType || p.caster;
    let kind = 'string';
    let shape;
    switch (p.instance) {
      case 'Number': kind = 'number'; break;
      case 'Boolean': kind = 'boolean'; break;
      case 'Date': kind = 'date'; break;
      case 'Array':
        if (p.$isMongooseDocumentArray || (inner && inner.instance && inner.instance !== 'String')) { kind = 'json'; shape = 'array'; }
        else kind = 'stringArray';
        break;
      case 'Map': case 'Mixed': kind = 'json'; shape = 'object'; break;
      default: kind = 'string';
    }
    fields.push({
      name, kind, shape,
      required: !!o.required,
      unique: !!o.unique,
      enum: Array.isArray(o.enum) ? o.enum : undefined,
      readOnly: kind === 'date' && TIMESTAMPS.includes(name),
      secret: name === 'password',
      long: /description/i.test(name),
      default: typeof o.default === 'function' ? undefined : o.default
    });
  }
  // timestamps last
  fields.sort((a, b) => TIMESTAMPS.includes(a.name) - TIMESTAMPS.includes(b.name));
  return { customId, fields };
}

// Convert form values to schema types. partial=true is used for edits.
export function coerceBody(fields, body, partial) {
  const out = {};
  for (const f of fields) {
    if (f.readOnly || !(f.name in body)) continue;
    let v = body[f.name];

    if (f.secret && (v === '' || v === null || v === '••••••')) continue; // blank password = keep current

    switch (f.kind) {
      case 'number':
        if (v === '' || v === null || v === undefined) { v = undefined; break; }
        v = Number(v);
        if (Number.isNaN(v)) throw new HttpError(400, `${f.name} must be a number`);
        break;
      case 'boolean':
        v = v === true || v === 'true';
        break;
      case 'stringArray':
        if (typeof v === 'string') v = v.split(',').map((s) => s.trim()).filter(Boolean);
        break;
      case 'json':
        if (typeof v === 'string') {
          if (!v.trim()) { v = undefined; break; }
          try { v = JSON.parse(v); } catch { throw new HttpError(400, `${f.name} is not valid JSON`); }
        }
        break;
      default:
        if (typeof v === 'string' && !f.secret) v = v.trim();
    }

    if (partial && v === undefined && f.required) throw new HttpError(400, `${f.name} is required`);
    out[f.name] = v;
  }
  return out;
}

// Next ID in the table's sequence, e.g. SH_08 -> SH_09
export async function nextSequentialId(Model, prefix) {
  const rows = await Model.find({ _id: new RegExp(`^${prefix}_\\d+$`) }).select('_id').lean();
  const max = rows.reduce((m, r) => Math.max(m, parseInt(String(r._id).split('_')[1], 10)), 0);
  return `${prefix}_${String(max + 1).padStart(2, '0')}`;
}

// Turn any thrown error into a friendly HTTP response
export function sendError(res, error) {
  if (error instanceof HttpError) return res.status(error.status).json({ message: error.message });
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(error.errors).map((e) => e.message).join(' · ') });
  }
  if (error.name === 'CastError') return res.status(400).json({ message: `Invalid value for ${error.path}` });
  if (error.code === 11000) {
    const key = Object.entries(error.keyValue || {}).map(([k, v]) => `${k} "${v}"`).join(', ');
    return res.status(409).json({ message: `Already exists: ${key}` });
  }
  return res.status(500).json({ message: error.message });
}
