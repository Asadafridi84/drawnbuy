/**
 * DrawNBuy — Supabase DB Adapter
 *
 * HOW TO ACTIVATE:
 *   1. Create a Supabase project at supabase.com (free tier)
 *   2. Run the SQL in /server/db/schema.sql to create tables
 *   3. Add to server/.env:
 *        SUPABASE_URL=https://your-project.supabase.co
 *        SUPABASE_SERVICE_KEY=your-service-role-key
 *   4. Rename this file to index.js (replacing the JSON version)
 *
 * The exported API (Users, Canvases) is identical to the JSON adapter —
 * no callers need to change.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

// ── Users ──────────────────────────────────────────────────────────────────────
export const Users = {
  async findByEmail(email) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    return data || null;
  },

  async findById(id) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return data || null;
  },

  async create({ id, email, name, passwordHash }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        email: email.toLowerCase(),
        name: String(name).slice(0, 80).trim(),
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this._normalize(data);
  },

  async update(id, fields) {
    const patch = {};
    if (fields.name   !== undefined) patch.name    = String(fields.name).slice(0, 80);
    if (fields.bio    !== undefined) patch.bio     = String(fields.bio).slice(0, 300);
    if (fields.avatar !== undefined) patch.avatar  = fields.avatar;
    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this._normalize(data);
  },

  toPublic(user) {
    const { passwordHash, password_hash, ...pub } = user;
    return pub;
  },

  _normalize(row) {
    return {
      id:           row.id,
      email:        row.email,
      name:         row.name,
      bio:          row.bio || '',
      avatar:       row.avatar || null,
      passwordHash: row.password_hash,
      createdAt:    row.created_at,
      updatedAt:    row.updated_at,
    };
  },
};

// ── Canvases ──────────────────────────────────────────────────────────────────
export const Canvases = {
  async findById(id) {
    const { data } = await supabase
      .from('canvases')
      .select('*')
      .eq('id', id)
      .single();
    return data ? this._normalize(data) : null;
  },

  async findByOwner(userId) {
    const { data } = await supabase
      .from('canvases')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });
    return (data || []).map(this._normalize);
  },

  async create({ id, roomId, name, ownerId, isPublic = false }) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('canvases')
      .insert({
        id,
        room_id:    roomId,
        name:       String(name).slice(0, 80),
        owner_id:   ownerId,
        is_public:  isPublic,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this._normalize(data);
  },

  async update(id, fields) {
    const patch = { updated_at: new Date().toISOString() };
    if (fields.name      !== undefined) patch.name       = String(fields.name).slice(0, 80);
    if (fields.thumbnail !== undefined) patch.thumbnail  = fields.thumbnail;
    if (fields.isPublic  !== undefined) patch.is_public  = Boolean(fields.isPublic);

    const { data, error } = await supabase
      .from('canvases')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this._normalize(data);
  },

  async delete(id, userId) {
    const { error } = await supabase
      .from('canvases')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId);
    return !error;
  },

  _normalize(row) {
    return {
      id:            row.id,
      roomId:        row.room_id,
      name:          row.name,
      ownerId:       row.owner_id,
      isPublic:      row.is_public,
      thumbnail:     row.thumbnail || null,
      collaborators: row.collaborators || [],
      createdAt:     row.created_at,
      updatedAt:     row.updated_at,
    };
  },
};
