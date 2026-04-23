import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const GRID = 1000
const MIN_ZOOM = 0.3
const MAX_ZOOM = 40
const PALETTE = [
  '#FF4500', '#FFA800', '#FFD635', '#00A368',
  '#7EED56', '#2450A4', '#3690EA', '#51E9F4',
  '#811E9F', '#B44AC0', '#FF99AA', '#FF3881',
  '#FFFFFF', '#D4D7D9', '#888888', '#000000',
  '#9C6926', '#6D482F', '#00756F', '#009EAA',
  '#493AC1', '#6A5CFF', '#DE107F', '#FF6165',
  '#00CC78', '#00CCC0', '#94B3FF', '#E4ABFF',
]

/* ════════════════════════════════════════════
   AUTH SCREEN
   ════════════════════════════════════════════ */
function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        })
        if (err) throw err
        const { error: pErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: form.username,
        })
        if (pErr) throw pErr
        // Reload page to pick up the new session
        window.location.reload()
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (err) throw err
        window.location.reload()
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  async function handleGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0a0a0f', padding: 20,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <div style={{
        fontFamily: "'Silkscreen', cursive", fontSize: 36, color: '#ff3e3e',
        textShadow: '0 0 30px #ff3e3e44', letterSpacing: 3, marginBottom: 8,
      }}>
        PIXEL<span style={{ color: '#e8e8f0' }}>/</span>PLACE
      </div>
      <p style={{ color: '#8888a0', fontSize: 14, textAlign: 'center', maxWidth: 400, marginBottom: 32, lineHeight: 1.6 }}>
        Buy pixels. Paint them. Trade them.<br />1,000,000 pixels. One shared canvas.
      </p>
      <div style={{
        background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 12,
        padding: 36, width: '100%', maxWidth: 380,
      }}>
        <h2 style={{ fontFamily: "'Silkscreen', cursive", fontSize: 16, marginBottom: 24, textAlign: 'center', color: '#e8e8f0' }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8888a0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>Username</label>
              <input type="text" placeholder="pixelking" required value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: 6, color: '#e8e8f0', fontSize: 14, outline: 'none', fontFamily: "'IBM Plex Mono', monospace" }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8888a0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>Email</label>
            <input type="email" placeholder="you@email.com" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: 6, color: '#e8e8f0', fontSize: 14, outline: 'none', fontFamily: "'IBM Plex Mono', monospace" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8888a0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
            <input type="password" placeholder="••••••••" required minLength={6} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: 6, color: '#e8e8f0', fontSize: 14, outline: 'none', fontFamily: "'IBM Plex Mono', monospace" }} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 12, border: 'none', borderRadius: 6, cursor: 'pointer',
            fontSize: 14, fontWeight: 600, background: '#ff3e3e', color: '#fff', marginTop: 4,
            fontFamily: "'IBM Plex Mono', monospace", opacity: loading ? 0.6 : 1,
          }}>
            {loading ? 'Loading...' : mode === 'login' ? 'Enter the Grid' : 'Join the Grid'}
          </button>
          {error && <p style={{ color: '#ff3e3e', fontSize: 12, textAlign: 'center', marginTop: 8 }}>{error}</p>}
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0', color: '#555570', fontSize: 11 }}>
          <div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />or<div style={{ flex: 1, height: 1, background: '#2a2a3a' }} />
        </div>

        <button onClick={handleGitHub} style={{
          width: '100%', padding: 11, border: '1px solid #2a2a3a', borderRadius: 6, cursor: 'pointer',
          fontSize: 13, background: '#12121a', color: '#e8e8f0', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, fontFamily: "'IBM Plex Mono', monospace",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8e8f0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
          Continue with GitHub
        </button>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#8888a0' }}>
          {mode === 'login' ? (
            <>No account? <span style={{ color: '#ff3e3e', cursor: 'pointer' }} onClick={() => { setMode('signup'); setError('') }}>Sign up</span></>
          ) : (
            <>Have an account? <span style={{ color: '#ff3e3e', cursor: 'pointer' }} onClick={() => { setMode('login'); setError('') }}>Sign in</span></>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════ */
export default function Home() {
  const [user, setUser] = useState(undefined) // undefined = checking, null = no user
  const [profile, setProfile] = useState(null)
  const [pixelMap, setPixelMap] = useState(new Map())
  const [dataLoaded, setDataLoaded] = useState(false)
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [color, setColor] = useState('#FF4500')
  const [saleInput, setSaleInput] = useState('')
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('info')
  const [busy, setBusy] = useState(false)
  const [marketPixels, setMarketPixels] = useState([])
  const [leaderboard, setLeaderboard] = useState([])

  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(5)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const lastTouchDist = useRef(null)
  const lastTouchCenter = useRef(null)
  const centered = useRef(false)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  /* ── Auth init ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      // Failsafe: if auth check takes > 4s, just show login
      setUser(prev => (prev === undefined ? null : prev))
    }, 4000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timer)
      if (session?.user) {
        setUser(session.user)
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => { if (data) setProfile(data) })
      } else {
        setUser(null)
      }
    }).catch(() => {
      clearTimeout(timer)
      setUser(null)
    })

    // Listen for OAuth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // Create profile for OAuth users if needed
        const { data: existing } = await supabase.from('profiles').select('id').eq('id', session.user.id).single()
        if (!existing) {
          const uname = session.user.user_metadata?.user_name
            || session.user.user_metadata?.preferred_username
            || session.user.email?.split('@')[0]
            || 'user_' + session.user.id.slice(0, 6)
          await supabase.from('profiles').insert({ id: session.user.id, username: uname })
        }
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (prof) setProfile(prof)
      }
    })

    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  /* ── Load data once user is set ── */
  useEffect(() => {
    if (!user || user === undefined) return

    const timer = setTimeout(() => setDataLoaded(true), 6000) // failsafe

    Promise.all([fetchPixels(), fetchMarket(), fetchLeaderboard()])
      .then(() => { clearTimeout(timer); setDataLoaded(true) })
      .catch(() => { clearTimeout(timer); setDataLoaded(true) })

    // Realtime
    const ch = supabase.channel('grid')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pixels' }, () => {
        fetchPixels()
        fetchMarket()
        fetchLeaderboard()
      })
      .subscribe()

    return () => { supabase.removeChannel(ch); clearTimeout(timer) }
  }, [user])

  /* ── Center canvas when ready ── */
  useEffect(() => {
    if (dataLoaded && containerRef.current && !centered.current) {
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      setOffset({ x: w / 2 - 500 * zoom, y: h / 2 - 500 * zoom })
      centered.current = true
    }
  }, [dataLoaded])

  /* ── Data fetchers ── */
  async function fetchPixels() {
    try {
      const { data } = await supabase.from('pixels').select('*, profiles:owner_id(username)')
      if (data) {
        const m = new Map()
        data.forEach(p => m.set(`${p.x},${p.y}`, p))
        setPixelMap(m)
      }
    } catch (e) { console.error('fetchPixels:', e) }
  }

  async function fetchMarket() {
    try {
      const { data } = await supabase.from('pixels').select('*, profiles:owner_id(username)')
        .eq('for_sale', true).order('sale_price', { ascending: true }).limit(50)
      if (data) setMarketPixels(data)
    } catch (e) { console.error('fetchMarket:', e) }
  }

  async function fetchLeaderboard() {
    try {
      const { data } = await supabase.from('pixels').select('owner_id, profiles:owner_id(username)')
        .not('owner_id', 'is', null)
      if (data) {
        const c = {}
        data.forEach(p => { const n = p.profiles?.username || '?'; c[n] = (c[n] || 0) + 1 })
        setLeaderboard(
          Object.entries(c).map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count).slice(0, 10)
        )
      }
    } catch (e) { console.error('fetchLeaderboard:', e) }
  }

  async function refreshProfile() {
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setProfile(data)
  }

  /* ── Logout ── */
  function handleLogout() {
    supabase.auth.signOut().finally(() => {
      window.location.reload()
    })
  }

  /* ── Canvas drawing ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const w = container.clientWidth
    const h = container.clientHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#0d0d14'
    ctx.fillRect(0, 0, w, h)

    const cs = zoom
    const x0 = Math.max(0, Math.floor(-offset.x / cs))
    const y0 = Math.max(0, Math.floor(-offset.y / cs))
    const x1 = Math.min(GRID, Math.ceil((-offset.x + w) / cs))
    const y1 = Math.min(GRID, Math.ceil((-offset.y + h) / cs))

    // Grid lines
    if (cs >= 4) {
      ctx.strokeStyle = '#1a1a26'
      ctx.lineWidth = 0.5
      for (let x = x0; x <= x1; x++) {
        const px = x * cs + offset.x
        ctx.beginPath()
        ctx.moveTo(px, Math.max(0, y0 * cs + offset.y))
        ctx.lineTo(px, Math.min(h, y1 * cs + offset.y))
        ctx.stroke()
      }
      for (let y = y0; y <= y1; y++) {
        const py = y * cs + offset.y
        ctx.beginPath()
        ctx.moveTo(Math.max(0, x0 * cs + offset.x), py)
        ctx.lineTo(Math.min(w, x1 * cs + offset.x), py)
        ctx.stroke()
      }
    }

    // Pixels
    pixelMap.forEach(p => {
      if (p.x >= x0 && p.x < x1 && p.y >= y0 && p.y < y1) {
        const px = p.x * cs + offset.x
        const py = p.y * cs + offset.y
        ctx.fillStyle = p.color
        ctx.fillRect(px, py, cs, cs)
        // For-sale dot
        if (p.for_sale && cs >= 6) {
          ctx.fillStyle = '#ffd700'
          const d = Math.max(2, cs * 0.2)
          ctx.beginPath()
          ctx.arc(px + cs - d, py + d, d * 0.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    })

    // Hover
    if (hovered && cs >= 3) {
      ctx.strokeStyle = '#ffffff88'
      ctx.lineWidth = 2
      ctx.strokeRect(hovered.x * cs + offset.x, hovered.y * cs + offset.y, cs, cs)
    }

    // Selected
    if (selected) {
      const sx = selected.x * cs + offset.x
      const sy = selected.y * cs + offset.y
      ctx.save()
      ctx.strokeStyle = '#ff3e3e'
      ctx.lineWidth = 2
      ctx.shadowColor = '#ff3e3e'
      ctx.shadowBlur = 10
      ctx.strokeRect(sx - 1, sy - 1, cs + 2, cs + 2)
      ctx.restore()
    }

    // Grid border
    ctx.strokeStyle = '#2a2a3a'
    ctx.lineWidth = 1
    ctx.strokeRect(offset.x, offset.y, GRID * cs, GRID * cs)
  }, [zoom, offset, pixelMap, hovered, selected])

  useEffect(() => { draw() }, [draw])
  useEffect(() => {
    const fn = () => draw()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [draw])

  /* ── Mouse ── */
  function getGridPos(e) {
    const r = canvasRef.current.getBoundingClientRect()
    const gx = Math.floor((e.clientX - r.left - offset.x) / zoom)
    const gy = Math.floor((e.clientY - r.top - offset.y) / zoom)
    return gx >= 0 && gx < GRID && gy >= 0 && gy < GRID ? { x: gx, y: gy } : null
  }

  function onMouseDown(e) {
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }

  function onMouseMove(e) {
    setHovered(getGridPos(e))
    if (dragging) {
      setOffset({
        x: dragStart.current.ox + e.clientX - dragStart.current.x,
        y: dragStart.current.oy + e.clientY - dragStart.current.y,
      })
    }
  }

  function onMouseUp(e) {
    if (dragging) {
      const dx = Math.abs(e.clientX - dragStart.current.x)
      const dy = Math.abs(e.clientY - dragStart.current.y)
      if (dx < 4 && dy < 4) {
        const pos = getGridPos(e)
        if (pos) clickPixel(pos)
      }
    }
    setDragging(false)
  }

  function onWheel(e) {
    e.preventDefault()
    const r = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - r.left
    const my = e.clientY - r.top
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
    const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor))
    setOffset({
      x: mx - (mx - offset.x) * (nz / zoom),
      y: my - (my - offset.y) * (nz / zoom),
    })
    setZoom(nz)
  }

  /* ── Touch ── */
  function onTouchStart(e) {
    if (e.touches.length === 1) {
      setDragging(true)
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: offset.x, oy: offset.y }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.hypot(dx, dy)
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    }
  }

  function onTouchMove(e) {
    e.preventDefault()
    if (e.touches.length === 1 && dragging) {
      setOffset({
        x: dragStart.current.ox + e.touches[0].clientX - dragStart.current.x,
        y: dragStart.current.oy + e.touches[0].clientY - dragStart.current.y,
      })
    } else if (e.touches.length === 2 && lastTouchDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * dist / lastTouchDist.current))
      const c = lastTouchCenter.current
      const r = canvasRef.current.getBoundingClientRect()
      const mx = c.x - r.left
      const my = c.y - r.top
      setOffset({
        x: mx - (mx - offset.x) * (nz / zoom),
        y: my - (my - offset.y) * (nz / zoom),
      })
      setZoom(nz)
      lastTouchDist.current = dist
    }
  }

  function onTouchEnd(e) {
    if (e.touches.length < 2) { lastTouchDist.current = null; lastTouchCenter.current = null }
    if (e.touches.length === 0) setDragging(false)
  }

  /* ── Pixel selection ── */
  function clickPixel(pos) {
    if (selected && selected.x === pos.x && selected.y === pos.y) {
      setSelected(null)
      return
    }
    const existing = pixelMap.get(`${pos.x},${pos.y}`)
    if (existing) {
      setSelected({
        x: pos.x, y: pos.y,
        color: existing.color,
        owner: existing.profiles?.username || null,
        owner_id: existing.owner_id,
        for_sale: existing.for_sale,
        sale_price: existing.sale_price,
        price: existing.price,
        id: existing.id,
      })
    } else {
      setSelected({
        x: pos.x, y: pos.y, color: '#1a1a26',
        owner: null, owner_id: null, for_sale: false,
        sale_price: 0, price: 1, id: null,
      })
    }
    setTab('info')
  }

  /* ── Actions ── */
  async function buyPixel() {
    if (!selected || !profile || busy) return
    setBusy(true)
    try {
      if (selected.id) {
        const cost = selected.for_sale ? selected.sale_price : selected.price
        const { error } = await supabase.rpc('buy_pixel', {
          p_pixel_id: selected.id,
          p_buyer_id: profile.id,
          p_new_color: color,
          p_cost: cost,
        })
        if (error) throw error
        showToast(`Bought (${selected.x}, ${selected.y}) for ⬥${cost}!`)
      } else {
        const { error } = await supabase.rpc('buy_new_pixel', {
          p_x: selected.x,
          p_y: selected.y,
          p_buyer_id: profile.id,
          p_color: color,
        })
        if (error) throw error
        showToast(`Bought (${selected.x}, ${selected.y}) for ⬥1!`)
      }
      await refreshProfile()
      await fetchPixels()
      await fetchMarket()
      await fetchLeaderboard()
      setSelected(null)
    } catch (e) {
      showToast(e.message || 'Purchase failed')
    }
    setBusy(false)
  }

  async function paintPixel() {
    if (!selected || !profile || selected.owner_id !== profile.id || busy) return
    setBusy(true)
    try {
      const { error } = await supabase.from('pixels')
        .update({ color, updated_at: new Date().toISOString() })
        .eq('id', selected.id)
      if (error) throw error
      await fetchPixels()
      showToast('Painted!')
    } catch (e) { showToast('Error painting') }
    setBusy(false)
  }

  async function listForSale() {
    if (!selected || !profile || selected.owner_id !== profile.id || busy) return
    const price = parseInt(saleInput)
    if (isNaN(price) || price < 1) { showToast('Enter a valid price'); return }
    setBusy(true)
    try {
      const { error } = await supabase.from('pixels')
        .update({ for_sale: true, sale_price: price, updated_at: new Date().toISOString() })
        .eq('id', selected.id)
      if (error) throw error
      await fetchPixels()
      await fetchMarket()
      setSaleInput('')
      setSelected(null)
      showToast(`Listed at ⬥${price}`)
    } catch (e) { showToast('Error listing') }
    setBusy(false)
  }

  async function cancelSale() {
    if (!selected || !profile || selected.owner_id !== profile.id || busy) return
    setBusy(true)
    try {
      const { error } = await supabase.from('pixels')
        .update({ for_sale: false, sale_price: 0, updated_at: new Date().toISOString() })
        .eq('id', selected.id)
      if (error) throw error
      await fetchPixels()
      await fetchMarket()
      setSelected(null)
      showToast('Sale cancelled')
    } catch (e) { showToast('Error cancelling') }
    setBusy(false)
  }

  /* ── Derived ── */
  const sel = selected
  const isOwner = sel && profile && sel.owner_id === profile.id
  const isUnowned = sel && !sel.owner_id
  const isForSale = sel && sel.for_sale && sel.owner_id !== profile?.id

  /* ── Screens ── */
  if (user === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f' }}>
        <div style={{ fontFamily: "'Silkscreen', cursive", color: '#555570', fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  if (user === null) return <AuthScreen />

  if (!dataLoaded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f', gap: 12 }}>
        <div style={{ fontFamily: "'Silkscreen', cursive", color: '#ff3e3e', fontSize: 20 }}>
          PIXEL<span style={{ color: '#e8e8f0' }}>/</span>PLACE
        </div>
        <div style={{ fontFamily: "'Silkscreen', cursive", color: '#555570', fontSize: 12 }}>Loading the grid...</div>
      </div>
    )
  }

  /* ── Styles ── */
  const btnBase = {
    width: '100%', padding: '10px 0', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s',
    fontFamily: "'IBM Plex Mono', monospace",
  }

  /* ── Main render ── */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0f', fontFamily: "'IBM Plex Mono', monospace", color: '#e8e8f0' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 999,
          background: '#1a1a26ee', border: '1px solid #3a3a5a', borderRadius: 8, padding: '10px 24px',
          fontFamily: "'Silkscreen', cursive", fontSize: 11, color: '#e8e8f0', boxShadow: '0 4px 24px #0008',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 20px', borderBottom: '1px solid #1a1a26', background: '#0a0a0fdd',
        zIndex: 50, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: "'Silkscreen', cursive", fontSize: 20, letterSpacing: 2, color: '#ff3e3e', textShadow: '0 0 20px #ff3e3e44' }}>
            PIXEL<span style={{ color: '#e8e8f0' }}>/</span>PLACE
          </div>
          <span style={{ fontSize: 10, color: '#555570' }}>1000×1000</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            fontFamily: "'Silkscreen', cursive", fontSize: 12, color: '#ffd700',
            textShadow: '0 0 10px #ffd70033', background: '#1a1a26', padding: '6px 14px',
            borderRadius: 6, border: '1px solid #ffd70022',
          }}>⬥ {profile?.coins || 0}</div>
          <span style={{ fontSize: 12, color: '#8888a0' }}>{profile?.username}</span>
          <button onClick={handleLogout} style={{
            padding: '5px 12px', border: '1px solid #2a2a3a', borderRadius: 4,
            background: 'transparent', color: '#8888a0', fontSize: 11, cursor: 'pointer',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>Logout</button>
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'fixed', bottom: 16, left: 16, zIndex: 50, background: '#1a1a26dd',
        border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button onClick={() => setZoom(z => Math.max(MIN_ZOOM, z / 1.3))} style={{
          background: 'none', border: '1px solid #3a3a5a', borderRadius: 4,
          color: '#e8e8f0', width: 28, height: 28, cursor: 'pointer', fontSize: 16,
        }}>−</button>
        <span style={{ fontSize: 10, color: '#8888a0', fontFamily: "'Silkscreen', cursive", minWidth: 40, textAlign: 'center' }}>
          {zoom.toFixed(1)}x
        </span>
        <button onClick={() => setZoom(z => Math.min(MAX_ZOOM, z * 1.3))} style={{
          background: 'none', border: '1px solid #3a3a5a', borderRadius: 4,
          color: '#e8e8f0', width: 28, height: 28, cursor: 'pointer', fontSize: 16,
        }}>+</button>
      </div>

      {/* Coordinates */}
      {hovered && (
        <div style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          background: '#1a1a26dd', border: '1px solid #2a2a3a', borderRadius: 6, padding: '5px 14px',
          fontSize: 10, color: '#8888a0', fontFamily: "'Silkscreen', cursive",
        }}>({hovered.x}, {hovered.y})</div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Canvas */}
        <div ref={containerRef} style={{ flex: 1, position: 'relative', cursor: dragging ? 'grabbing' : 'grab' }}>
          <canvas ref={canvasRef}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
            onMouseLeave={() => { setDragging(false); setHovered(null) }}
            onWheel={onWheel}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
          <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, color: '#555570', pointerEvents: 'none' }}>
            Scroll to zoom · Drag to pan · Click to select
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 300, borderLeft: '1px solid #1a1a26', background: '#0d0d14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1a1a26' }}>
            {[['info', 'PIXEL'], ['market', 'MARKET'], ['leaders', 'RANKS']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
                fontFamily: "'Silkscreen', cursive", fontSize: 10, letterSpacing: 1,
                background: tab === k ? '#1a1a26' : 'transparent',
                color: tab === k ? '#e8e8f0' : '#555570',
                borderBottom: tab === k ? '2px solid #ff3e3e' : '2px solid transparent',
              }}>{l}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

            {/* PIXEL INFO */}
            {tab === 'info' && (sel ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 8, border: '2px solid #3a3a5a',
                  margin: '0 auto 4px', backgroundColor: sel.color || '#1a1a26',
                  boxShadow: sel.color !== '#1a1a26' ? `0 0 20px ${sel.color}33` : 'none',
                }} />
                {[
                  ['POSITION', `(${sel.x}, ${sel.y})`],
                  ['OWNER', sel.owner || 'Unclaimed'],
                  ['STATUS', isUnowned ? 'Available' : sel.for_sale ? 'For Sale' : 'Owned'],
                  ['PRICE', `⬥ ${sel.for_sale ? sel.sale_price : sel.price}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#555570', fontSize: 10, letterSpacing: 1 }}>{label}</span>
                    <span style={{ color: label === 'PRICE' ? '#ffd700' : '#e8e8f0' }}>{value}</span>
                  </div>
                ))}

                {isUnowned && (
                  <button onClick={buyPixel} disabled={busy} style={{
                    ...btnBase, background: '#ff3e3e', color: '#fff', opacity: busy ? 0.6 : 1,
                  }}>{busy ? 'Buying...' : `Buy for ⬥${sel.price}`}</button>
                )}
                {isForSale && (
                  <button onClick={buyPixel} disabled={busy} style={{
                    ...btnBase, background: '#00e676', color: '#0a0a0f', opacity: busy ? 0.6 : 1,
                  }}>{busy ? 'Buying...' : `Buy for ⬥${sel.sale_price}`}</button>
                )}

                {isOwner && (
                  <>
                    <div>
                      <span style={{ fontSize: 10, color: '#555570', letterSpacing: 1 }}>PAINT COLOR</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginTop: 6 }}>
                        {PALETTE.map(c => (
                          <div key={c} onClick={() => setColor(c)} style={{
                            aspectRatio: '1', borderRadius: 3, cursor: 'pointer', backgroundColor: c,
                            border: color === c ? '2px solid #fff' : '2px solid transparent',
                            boxShadow: color === c ? '0 0 6px #fff6' : 'none',
                            transform: color === c ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all .15s',
                          }} />
                        ))}
                      </div>
                      <button onClick={paintPixel} disabled={busy} style={{
                        ...btnBase, marginTop: 8, background: '#22222e', color: '#e8e8f0',
                        border: '1px solid #3a3a5a', fontWeight: 400,
                      }}>Paint</button>
                    </div>
                    <div>
                      {sel.for_sale ? (
                        <button onClick={cancelSale} disabled={busy} style={{
                          ...btnBase, background: '#22222e', color: '#e8e8f0',
                          border: '1px solid #3a3a5a', fontWeight: 400, fontSize: 11,
                        }}>Cancel Sale (⬥{sel.sale_price})</button>
                      ) : (
                        <>
                          <span style={{ fontSize: 10, color: '#555570', letterSpacing: 1, display: 'block', marginBottom: 6 }}>LIST FOR SALE</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input type="number" min="1" placeholder="Price" value={saleInput}
                              onChange={e => setSaleInput(e.target.value)}
                              style={{
                                width: 80, padding: '6px 10px', background: '#0a0a0f',
                                border: '1px solid #2a2a3a', borderRadius: 4, color: '#ffd700',
                                fontSize: 13, outline: 'none', fontFamily: "'IBM Plex Mono', monospace",
                              }} />
                            <button onClick={listForSale} disabled={busy} style={{
                              padding: '6px 14px', border: 'none', borderRadius: 4, cursor: 'pointer',
                              background: '#00e676', color: '#0a0a0f', fontSize: 11, fontWeight: 600,
                              fontFamily: "'IBM Plex Mono', monospace",
                            }}>List</button>
                          </div>
                          <span style={{ fontSize: 9, color: '#555570', marginTop: 4, display: 'block' }}>10% fee on sales</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#555570', fontSize: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◻</div>
                Zoom in and click a pixel
              </div>
            ))}

            {/* MARKET */}
            {tab === 'market' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: "'Silkscreen', cursive", fontSize: 10, color: '#8888a0', letterSpacing: 1, marginBottom: 8 }}>
                  {marketPixels.length} LISTED
                </span>
                {marketPixels.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: 16, color: '#555570', fontSize: 12 }}>No pixels for sale yet</p>
                ) : marketPixels.map(mp => (
                  <div key={mp.id} onClick={() => {
                    clickPixel({ x: mp.x, y: mp.y })
                    if (containerRef.current) {
                      const w = containerRef.current.clientWidth
                      const h = containerRef.current.clientHeight
                      setOffset({ x: w / 2 - mp.x * zoom, y: h / 2 - mp.y * zoom })
                    }
                  }} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 10px', background: '#12121a', border: '1px solid #1a1a26',
                    borderRadius: 6, cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3a3a5a'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a26'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 3, backgroundColor: mp.color, border: '1px solid #3a3a5a' }} />
                      <div>
                        <div style={{ fontSize: 11, color: '#8888a0' }}>({mp.x},{mp.y})</div>
                        <div style={{ fontSize: 9, color: '#555570' }}>{mp.profiles?.username || 'unknown'}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Silkscreen', cursive", fontSize: 11, color: '#ffd700' }}>⬥{mp.sale_price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* LEADERBOARD */}
            {tab === 'leaders' && (
              <div>
                <span style={{ fontFamily: "'Silkscreen', cursive", fontSize: 10, color: '#8888a0', letterSpacing: 1, display: 'block', marginBottom: 12 }}>
                  {pixelMap.size.toLocaleString()} PIXELS CLAIMED
                </span>
                {leaderboard.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: 16, color: '#555570', fontSize: 12 }}>No pixels claimed yet</p>
                ) : leaderboard.map((entry, i) => (
                  <div key={entry.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 0', borderBottom: i < leaderboard.length - 1 ? '1px solid #1a1a26' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#555570', fontSize: 10, width: 22 }}>#{i + 1}</span>
                      <span style={{ fontSize: 12, color: entry.name === profile?.username ? '#ff3e3e' : '#e8e8f0' }}>
                        {entry.name} {entry.name === profile?.username && '★'}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Silkscreen', cursive", fontSize: 11, color: '#ff3e3e' }}>{entry.count}px</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #1a1a26', fontSize: 9, color: '#555570', textAlign: 'center', letterSpacing: 1 }}>
            {pixelMap.size.toLocaleString()} / 1,000,000 CLAIMED
          </div>
        </div>
      </div>
    </div>
  )
}
