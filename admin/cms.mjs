import { collections, displayStatus, fieldValue, readFields } from './fields.mjs';

const byId = id => document.getElementById(id);
const login = byId('login');
const editor = byId('editor');
const dashboard = byId('dashboard');
const signOut = byId('sign-out');
const pageSize = 20;
let client;
let collection = 'places';
let rows = [];
let places = [];
let current;
let page = 0;
let loading = false;
let saving = false;
let dirty = false;
let generation = 0;

function message(text, error = false, target = 'notice') {
  const output = byId(target);
  output.textContent = text;
  output.hidden = !text;
  output.classList.toggle('error', error);
}

function showError(error, target) {
  message(error.message || 'Something went wrong. Please try again.', true, target);
}

function showLogin() {
  ++generation;
  loading = false;
  dashboard.hidden = true;
  signOut.hidden = true;
  login.hidden = false;
  closeEditor();
  rows = [];
  places = [];
  byId('list').replaceChildren();
}

function closeEditor() {
  current = undefined;
  dirty = false;
  editor.hidden = true;
  byId('fields').replaceChildren();
  message('', false, 'editor-message');
}

function canLeaveEditor() {
  return !saving && (!dirty || window.confirm('Discard unsaved edits?'));
}

async function readAll(table, fields, title) {
  const results = [];
  const limit = 200;
  for (let offset = 0; ; offset += limit) {
    const { data, error } = await client.from(table).select(fields)
      .order(title).order('id').range(offset, offset + limit - 1);
    if (error) throw error;
    results.push(...data);
    if (data.length < limit) return results;
  }
}

async function loadCollection() {
  const revision = ++generation;
  const table = collection;
  loading = true;
  byId('add').disabled = true;
  message('Loading ' + collections[table].label.toLowerCase() + '…');
  try {
    const [listings, locations] = await Promise.all([
      readAll(table, '*', collections[table].title),
      ['events', 'services'].includes(table) ? readAll('places', 'id,name,status', 'name') : [],
    ]);
    if (revision !== generation) return;
    rows = listings;
    places = locations;
    byId('add').disabled = false;
    message('');
  } catch (error) {
    if (revision === generation) showError(error);
  } finally {
    if (revision === generation) {
      loading = false;
      renderList();
    }
  }
}

function renderList() {
  const query = byId('search').value.trim().toLowerCase();
  const status = byId('status').value;
  const config = collections[collection];
  const matches = rows.filter(row => (!status || row.status === status) &&
    config.fields.some(([key, , type]) => type !== 'place' && fieldValue(type, row[key]).toLowerCase().includes(query)));
  page = Math.min(page, Math.max(0, Math.ceil(matches.length / pageSize) - 1));
  const start = page * pageSize;
  byId('count').textContent = matches.length ? (start + 1) + '–' + Math.min(start + pageSize, matches.length) +
    ' of ' + matches.length : (loading ? 'Loading…' : 'No matching listings.');
  byId('previous').disabled = page === 0;
  byId('next').disabled = start + pageSize >= matches.length;
  byId('list').replaceChildren(...matches.slice(start, start + pageSize).map(row => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = row[config.title];
    const badge = document.createElement('span');
    const status = displayStatus(collection, row);
    badge.className = 'badge ' + status;
    badge.textContent = status;
    button.append(badge);
    button.addEventListener('click', () => { if (canLeaveEditor()) openEditor(row); });
    item.append(button);
    return item;
  }));
}

function openEditor(row) {
  current = row;
  dirty = false;
  const config = collections[collection];
  byId('editor-title').textContent = (row ? 'Edit ' : 'New ') + config.singular;
  byId('editor-status').textContent = row ? 'Status: ' + displayStatus(collection, row) : 'New draft';
  byId('save').textContent = row ? 'Save changes' : 'Save draft';
  byId('publish').textContent = row?.status === 'published' ? 'Save published changes' : 'Publish';
  byId('save').hidden = row?.status === 'published';
  byId('draft').hidden = !row || row.status === 'draft';
  byId('archive').hidden = !row || row.status === 'archived';
  message('', false, 'editor-message');
  byId('fields').replaceChildren(...config.fields.map(([key, label, type, required]) => {
    const wrapper = document.createElement('label');
    wrapper.textContent = label;
    const input = document.createElement(type === 'textarea' ? 'textarea' : type === 'place' ? 'select' : 'input');
    input.name = key;
    input.required = Boolean(required);
    if (type === 'place') {
      input.add(new Option('Choose a place', ''));
      for (const place of places) input.add(new Option(place.name + ' · ' + place.status, place.id));
    } else if (input instanceof HTMLInputElement) {
      input.type = type;
      if (type === 'number') input.step = 'any';
    }
    input.value = fieldValue(type, row?.[key]);
    wrapper.append(input);
    return wrapper;
  }));
  editor.hidden = false;
  editor.querySelector('input')?.focus();
}

async function switchCollection(table) {
  collection = table;
  rows = [];
  places = [];
  page = 0;
  closeEditor();
  document.querySelectorAll('#collections button').forEach(button => {
    button.setAttribute('aria-current', String(button.dataset.collection === table));
  });
  byId('collection-title').textContent = collections[table].label;
  byId('add').textContent = 'Add ' + collections[table].singular;
  byId('search').value = '';
  byId('status').value = '';
  renderList();
  await loadCollection();
}

async function enter(user) {
  if (user?.app_metadata?.campus_admin !== true) {
    await client.auth.signOut({ scope: 'local' });
    showLogin();
    message('This account does not have campus publishing access.', true);
    return;
  }
  login.reset();
  login.hidden = true;
  dashboard.hidden = false;
  signOut.hidden = false;
  await switchCollection('places');
}

login.addEventListener('submit', async event => {
  event.preventDefault();
  const button = login.querySelector('button');
  button.disabled = true;
  message('Signing in…');
  try {
    const data = new FormData(login);
    const response = await client.auth.signInWithPassword({ email: data.get('email').trim(), password: data.get('password') });
    if (response.error) throw response.error;
    await enter(response.data.user);
  } catch (error) {
    showError(error);
  } finally {
    button.disabled = false;
  }
});

signOut.addEventListener('click', async () => {
  if (!canLeaveEditor()) return;
  signOut.disabled = true;
  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
    showLogin();
    message('Signed out.');
  } catch (error) {
    showError(error);
  } finally {
    signOut.disabled = false;
  }
});

editor.addEventListener('input', () => { dirty = true; });
editor.addEventListener('submit', async event => {
  event.preventDefault();
  if (saving || loading) return;
  const action = event.submitter?.value || 'save';
  const status = action === 'save' ? (current?.status ?? 'draft') : action;
  const archive = status === 'archived' && action === 'archived';
  if (archive && !window.confirm('Archive this listing? Unsaved changes will be discarded.')) return;
  const revision = generation;
  const buttons = [...editor.querySelectorAll('button')];
  saving = true;
  buttons.forEach(button => { button.disabled = true; });
  try {
    const record = archive ? { status } : readFields(collection, new FormData(editor), status);
    if (status === 'published' && record.place_id && places.find(place => place.id === record.place_id)?.status !== 'published') {
      throw new Error('Publish the linked campus place before publishing this listing.');
    }
    const table = client.from(collection);
    const operation = current ? table.update(record).eq('id', current.id).eq('status', current.status) : table.insert(record);
    const { data, error } = await operation.select().single();
    if (error) throw error;
    if (revision !== generation) return;
    openEditor(data);
    rows = [data, ...rows.filter(row => row.id !== data.id)].sort((a, b) =>
      a[collections[collection].title].localeCompare(b[collections[collection].title]));
    renderList();
    message('Saved · ' + displayStatus(collection, data), false, 'editor-message');
  } catch (error) {
    if (revision === generation) showError(error, 'editor-message');
  } finally {
    saving = false;
    buttons.forEach(button => { button.disabled = false; });
  }
});

byId('add').addEventListener('click', () => { if (canLeaveEditor()) openEditor(); });
byId('close').addEventListener('click', () => { if (canLeaveEditor()) closeEditor(); });
for (const id of ['search', 'status']) byId(id).addEventListener('input', () => { page = 0; renderList(); });
byId('previous').addEventListener('click', () => { page--; renderList(); });
byId('next').addEventListener('click', () => { page++; renderList(); });

for (const [table, config] of Object.entries(collections)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.collection = table;
  button.textContent = config.label;
  button.addEventListener('click', () => {
    if (table !== collection && canLeaveEditor()) void switchCollection(table);
  });
  byId('collections').append(button);
}

try {
  const response = await fetch('/config.json');
  if (!response.ok) throw new Error('Could not load CMS configuration.');
  const { url, key } = await response.json();
  if (!url || !key) throw new Error('Set the Supabase URL and publishable key, then restart the CMS.');
  client = window.supabase.createClient(url, key, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });
  client.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT' && !dashboard.hidden) showLogin();
  });
  showLogin();
} catch (error) {
  showError(error);
}
