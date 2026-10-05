import { test } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const m = html.match(/<script>([\s\S]*?)<\/script>/)
assert.ok(m, 'index.html has an inline script')

function load() {
  const el = { textContent: '', innerHTML: '' }
  const document = {
    getElementById: () => el,
    addEventListener: () => {},
  }
  const ctx = vm.createContext({ document, globalThis: null, Date, fetch: () => new Promise(() => {}) })
  ctx.globalThis = ctx
  vm.runInContext(m[1], ctx)
  assert.equal(typeof ctx.render, 'function', 'globalThis.render is exported')
  return (data, now) => {
    ctx.render(data, now)
    return el.innerHTML
  }
}

const NOW = Date.parse('2026-10-05T12:00:00Z')
const inc = (o) => ({ id: 'x', title: 'T', severity: 'SEV1', state: 'investigating', started: '2026-10-05T10:00:00Z', updates: [], ...o })

test('no incidents -> all systems operational', () => {
  const out = load()({ updated: '2026-10-05T00:00:00Z', incidents: [] }, NOW)
  assert.match(out, /All systems operational/)
})

test('open SEV1 shows title and Investigating', () => {
  const out = load()({ incidents: [inc({ title: 'Login is down' })] }, NOW)
  assert.match(out, /Login is down/)
  assert.match(out, /Investigating/)
  assert.doesNotMatch(out, /All systems operational/)
})

test('resolved incidents older than 14 days are hidden', () => {
  const old = inc({ title: 'Old one', state: 'resolved', started: '2026-09-01T00:00:00Z', updates: [{ at: '2026-09-01T01:00:00Z', text: 'done' }] })
  const recent = inc({ title: 'Recent one', state: 'resolved', started: '2026-10-01T00:00:00Z', updates: [{ at: '2026-10-01T01:00:00Z', text: 'done' }] })
  const out = load()({ incidents: [old, recent] }, NOW)
  assert.doesNotMatch(out, /Old one/)
  assert.match(out, /Recent one/)
})

for (const bad of [null, 'x', {}]) {
  test(`malformed input ${JSON.stringify(bad)} is never empty`, () => {
    const out = load()(bad, NOW)
    assert.match(out, /Status data unavailable/)
    assert.match(out, /All systems operational unless an incident is listed/)
  })
}

test('html is escaped', () => {
  const out = load()({ incidents: [inc({ title: '<img src=x onerror=1>' })] }, NOW)
  assert.doesNotMatch(out, /<img/)
})
