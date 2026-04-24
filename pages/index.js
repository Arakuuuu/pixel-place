import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const GRID = 1000
const MIN_ZOOM = 0.3
const MAX_ZOOM = 40

const PALETTE = [
  '#FF4500','#FFA800','#FFD635','#00A368',
  '#7EED56','#2450A4','#3690EA','#51E9F4',
  '#811E9F','#B44AC0','#FF99AA','#FF3881',
  '#FFFFFF','#D4D7D9','#888888','#000000',
  '#9C6926','#6D482F','#00756F','#009EAA',
  '#493AC1','#6A5CFF','#DE107F','#FF6165',
  '#00CC78','#00CCC0','#94B3FF','#E4ABFF',
]

// ─── AUTH SCREEN (unchanged from working version) ────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email, password: form.password,
      })
      if (err) { setError(err.message); setLoading(false); return }
      const { error: pErr } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username: form.username })
      if (pErr) { setError(pErr.message); setLoading(false); return }
      onLogin(data.user)
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: form.email, password: form.password,
      })
      if (err) { setError(err.message); setLoading(false); return }
      onLogin(data.user)
    }
    setLoading(false)
  }

  async function handleGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    })
  }

  const s = {
    wrap: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0a0f', padding:20 },
    logo: { fontFamily:"'Silkscreen',cursive", fontSize:36, color:'#ff3e3e', textShadow:'0 0 30px #ff3e3e44, 0 0 60px #ff3e3e22', letterSpacing:3, marginBottom:8 },
    sub: { color:'#8888a0', fontSize:14, textAlign:'center', maxWidth:400, marginBottom:32, lineHeight:1.6 },
    box: { background:'#1a1a26', border:'1px solid #2a2a3a', borderRadius:12, padding:36, width:'100%', maxWidth:380 },
    h2: { fontFamily:"'Silkscreen',cursive", fontSize:16, marginBottom:24, textAlign:'center' },
    label: { display:'block', fontSize:11, color:'#8888a0', marginBottom:5, textTransform:'uppercase', letterSpacing:1 },
    input: { width:'100%', padding:'10px 14px', background:'#0a0a0f', border:'1px solid #2a2a3a', borderRadius:6, color:'#e8e8f0', fontSize:14, outline:'none', marginBottom:14 },
    btn: { width:'100%', padding:'12px', border:'none', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:600, background:'#ff3e3e', color:'#fff', marginTop:4 },
    divider: { display:'flex', alignItems:'center', gap:12, margin:'18px 0', color:'#555570', fontSize:11 },
    line: { flex:1, height:1, background:'#2a2a3a' },
    ghBtn: { width:'100%', padding:'11px', border:'1px solid #2a2a3a', borderRadius:6, cursor:'pointer', fontSize:13, background:'#12121a', color:'#e8e8f0', display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
    toggle: { textAlign:'center', marginTop:18, fontSize:13, color:'#8888a0' },
    link: { color:'#ff3e3e', cursor:'pointer' },
    err: { color:'#ff3e3e', fontSize:12, textAlign:'center', marginTop:8 },
  }

  return (
    <div style={s.wrap}>
      <div style={s.logo}>PIXEL<span style={{color:'#e8e8f0'}}>/</span>PLACE</div>
      <p style={s.sub}>Buy pixels. Paint them. Trade them.<br/>1,000,000 pixels. One shared canvas.</p>
      <div style={s.box}>
        <h2 style={s.h2}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div>
              <label style={s.label}>Username</label>
              <input style={s.input} type="text" placeholder="pixelking" required
                value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            </div>
          )}
          <div>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="you@email.com" required
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="••••••••" required minLength={6}
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" style={{...s.btn, opacity: loading ? 0.6 : 1}} disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Enter the Grid' : 'Join the Grid'}
          </button>
          {error && <p style={s.err}>{error}</p>}
        </form>

        <div style={s.divider}><div style={s.line}/> or <div style={s.line}/></div>

        <button onClick={handleGitHub} style={s.ghBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8e8f0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          Continue with GitHub
        </button>

        <div style={s.toggle}>
          {mode === 'login' ? (
            <>No account? <span style={s.link} onClick={() => { setMode('signup'); setError('') }}>Sign up</span></>
          ) : (
            <>Have an account? <span style={s.link} onClick={() => { setMode('login'); setError('') }}>Sign in</span></>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [pixelMap, setPixelMap] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [color, setColor] = useState('#FF4500')
  const [saleInput, setSaleInput] = useState('')
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('info')
  const [actionLoading, setActionLoading] = useState(false)
  const [marketPixels, setMarketPixels] = useState([])
  const [leaderboard, setLeaderboard] = useState([])

  // Canvas state
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(3)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x:0, y:0, ox:0, oy:0 })
  const lastTouchDist = useRef(null)
  const lastTouchCenter = useRef(null)

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [tutorialTextIndex, setTutorialTextIndex] = useState(0)
  const [tutorialTextDone, setTutorialTextDone] = useState(false)
  const audioCtxRef = useRef(null)

  const TUTORIAL_STEPS = [
    { text: "Hey there, adventurer! Welcome to Pixel/Place!", highlight: null },
    { text: "This is the Grid — a massive 1000×1000 canvas. That's ONE MILLION pixels!", highlight: 'canvas' },
    { text: "You can scroll to zoom in and out, and drag to move around. Try it!", highlight: 'canvas' },
    { text: "See that sidebar? Click any pixel on the grid and its info shows up here.", highlight: 'sidebar' },
    { text: "When you find an unclaimed pixel, you can BUY it for just ⬥1 coin!", highlight: 'sidebar' },
    { text: "Once you own a pixel, you can PAINT it any color you want.", highlight: 'sidebar' },
    { text: "You can also LIST your pixels for sale on the marketplace. Other players can buy them!", highlight: 'market-tab' },
    { text: "The seller gets 90% of the sale price. Smart traders can make big profits!", highlight: null },
    { text: "Check the RANKS tab to see who owns the most pixels on the grid.", highlight: 'ranks-tab' },
    { text: "You're starting with ⬥10 coins. Spend them wisely... or trade your way to the top!", highlight: 'coins' },
    { text: "That's everything! Now go claim your territory. Good luck out there!", highlight: null },
  ]

  // Pixel sound effect
  function playPixelSound(type) {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      gain.gain.value = 0.08

      if (type === 'pop') {
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.05)
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.15)
      } else if (type === 'next') {
        osc.frequency.setValueAtTime(500, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.12)
      } else if (type === 'complete') {
        osc.frequency.setValueAtTime(523, ctx.currentTime)
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2)
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.5)
      } else if (type === 'char') {
        osc.frequency.setValueAtTime(300 + Math.random() * 200, ctx.currentTime)
        gain.gain.value = 0.03
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.04)
      }
    } catch(e) {}
  }

  // Typewriter effect for tutorial
  useEffect(() => {
    if (!showTutorial) return
    setTutorialTextIndex(0)
    setTutorialTextDone(false)
    const fullText = TUTORIAL_STEPS[tutorialStep].text
    let i = 0
    const interval = setInterval(() => {
      i++
      setTutorialTextIndex(i)
      if (i % 2 === 0) playPixelSound('char')
      if (i >= fullText.length) {
        clearInterval(interval)
        setTutorialTextDone(true)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [showTutorial, tutorialStep])

  function nextTutorialStep() {
    if (!tutorialTextDone) {
      // Skip to end of text
      setTutorialTextIndex(TUTORIAL_STEPS[tutorialStep].text.length)
      setTutorialTextDone(true)
      return
    }
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      playPixelSound('next')
      setTutorialStep(tutorialStep + 1)
    } else {
      // Tutorial complete - give coins
      playPixelSound('complete')
      setShowTutorial(false)
      setTutorialStep(0)
      if (typeof window !== 'undefined' && profile) {
        localStorage.setItem('tutorial_done_' + profile.id, 'true')
      }
      showToast('Tutorial complete! You earned ⬥10 coins!')
    }
  }

  // Refs to access current zoom/offset in native event listeners
  const zoomRef = useRef(3)
  const offsetRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { offsetRef.current = offset }, [offset])
  useEffect(() => { draggingRef.current = dragging }, [dragging])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ── Init (unchanged) ──
  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      await loadProfile(session.user.id)
    }
    setLoading(false)
  }

  // Listen for auth changes / GitHub OAuth redirect (unchanged)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)

        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()
        if (!existing) {
          const username = session.user.user_metadata?.user_name
            || session.user.user_metadata?.preferred_username
            || session.user.email?.split('@')[0]
            || 'user_' + session.user.id.slice(0, 6)
          await supabase.from('profiles').insert({ id: session.user.id, username })
          await loadProfile(session.user.id)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load data once logged in (unchanged)
  useEffect(() => {
    if (!user) return
    loadPixels()
    loadMarket()
    loadLeaderboard()

    // Center canvas
    if (containerRef.current) {
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      setOffset({ x: w/2 - 500 * zoom, y: h/2 - 500 * zoom })
    }

    // Realtime
    const channel = supabase
      .channel('pixels-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pixels' }, () => {
        loadPixels()
        loadMarket()
        loadLeaderboard()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // ══ FIX #1: Native event listeners for wheel + touch with {passive:false} ══
  // This prevents the "Unable to preventDefault inside passive event listener" error
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onNativeWheel(e) {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const currentZoom = zoomRef.current
      const currentOffset = offsetRef.current
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
      const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom * factor))
      setOffset({
        x: mx - (mx - currentOffset.x) * (nz / currentZoom),
        y: my - (my - currentOffset.y) * (nz / currentZoom),
      })
      setZoom(nz)
    }

    function onNativeTouchMove(e) {
      // Only preventDefault to stop page scroll - actual logic is in React handler
      if (e.touches.length >= 1) {
        e.preventDefault()
      }
    }

    canvas.addEventListener('wheel', onNativeWheel, { passive: false })
    canvas.addEventListener('touchmove', onNativeTouchMove, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', onNativeWheel)
      canvas.removeEventListener('touchmove', onNativeTouchMove)
    }
  }, [])

  // Data loaders (all unchanged)
  async function loadProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (data) setProfile(data)
  }

  async function loadPixels() {
    const { data } = await supabase.from('pixels').select('*, profiles:owner_id(username)')
    if (data) {
      const map = new Map()
      data.forEach(p => map.set(`${p.x},${p.y}`, p))
      setPixelMap(map)
    }
  }

  async function loadMarket() {
    const { data } = await supabase
      .from('pixels')
      .select('*, profiles:owner_id(username)')
      .eq('for_sale', true)
      .order('sale_price', { ascending: true })
      .limit(50)
    if (data) setMarketPixels(data)
  }

  async function loadLeaderboard() {
    const { data } = await supabase
      .from('pixels')
      .select('owner_id, profiles:owner_id(username)')
      .not('owner_id', 'is', null)
    if (data) {
      const counts = {}
      data.forEach(p => {
        const name = p.profiles?.username || 'unknown'
        counts[name] = (counts[name] || 0) + 1
      })
      setLeaderboard(
        Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      )
    }
  }

  // ══ FIX #2: Logout now does hard reload so it always works ══
  function handleLogout() {
    supabase.auth.signOut().finally(() => {
      window.location.reload()
    })
  }

  // ── Canvas Drawing (unchanged) ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const w = container.clientWidth
    const h = container.clientHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#0d0d14'
    ctx.fillRect(0, 0, w, h)

    const cellSize = zoom
    const startX = Math.max(0, Math.floor(-offset.x / cellSize))
    const startY = Math.max(0, Math.floor(-offset.y / cellSize))
    const endX = Math.min(GRID, Math.ceil((-offset.x + w) / cellSize))
    const endY = Math.min(GRID, Math.ceil((-offset.y + h) / cellSize))

    if (cellSize >= 4) {
      ctx.strokeStyle = '#1a1a26'
      ctx.lineWidth = 0.5
      for (let x = startX; x <= endX; x++) {
        const sx = x * cellSize + offset.x
        ctx.beginPath()
        ctx.moveTo(sx, Math.max(0, startY * cellSize + offset.y))
        ctx.lineTo(sx, Math.min(h, endY * cellSize + offset.y))
        ctx.stroke()
      }
      for (let y = startY; y <= endY; y++) {
        const sy = y * cellSize + offset.y
        ctx.beginPath()
        ctx.moveTo(Math.max(0, startX * cellSize + offset.x), sy)
        ctx.lineTo(Math.min(w, endX * cellSize + offset.x), sy)
        ctx.stroke()
      }
    }

    pixelMap.forEach((pixel) => {
      if (pixel.x >= startX && pixel.x < endX && pixel.y >= startY && pixel.y < endY) {
        const sx = pixel.x * cellSize + offset.x
        const sy = pixel.y * cellSize + offset.y
        ctx.fillStyle = pixel.color
        ctx.fillRect(sx, sy, cellSize, cellSize)
        if (pixel.for_sale && cellSize >= 6) {
          ctx.fillStyle = '#ffd700'
          const d = Math.max(2, cellSize * 0.2)
          ctx.beginPath()
          ctx.arc(sx + cellSize - d, sy + d, d * 0.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    })

    if (hovered && cellSize >= 3) {
      const sx = hovered.x * cellSize + offset.x
      const sy = hovered.y * cellSize + offset.y
      ctx.strokeStyle = '#ffffff88'
      ctx.lineWidth = 2
      ctx.strokeRect(sx, sy, cellSize, cellSize)
    }

    if (selected) {
      const sx = selected.x * cellSize + offset.x
      const sy = selected.y * cellSize + offset.y
      ctx.strokeStyle = '#ff3e3e'
      ctx.lineWidth = 2
      ctx.shadowColor = '#ff3e3e'
      ctx.shadowBlur = 10
      ctx.strokeRect(sx - 1, sy - 1, cellSize + 2, cellSize + 2)
      ctx.shadowBlur = 0
    }

    ctx.strokeStyle = '#2a2a3a'
    ctx.lineWidth = 1
    ctx.strokeRect(offset.x, offset.y, GRID * cellSize, GRID * cellSize)
  }, [zoom, offset, pixelMap, hovered, selected])

  useEffect(() => { draw() }, [draw])
  useEffect(() => {
    const r = () => draw()
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [draw])

  // ── Mouse handlers (unchanged) ──
  function getGridPos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const gx = Math.floor((mx - offset.x) / zoom)
    const gy = Math.floor((my - offset.y) / zoom)
    if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) return { x: gx, y: gy }
    return null
  }

  function handleMouseDown(e) {
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }

  function handleMouseMove(e) {
    setHovered(getGridPos(e))
    if (dragging) {
      setOffset({
        x: dragStart.current.ox + e.clientX - dragStart.current.x,
        y: dragStart.current.oy + e.clientY - dragStart.current.y,
      })
    }
  }

  function handleMouseUp(e) {
    if (dragging) {
      const dx = Math.abs(e.clientX - dragStart.current.x)
      const dy = Math.abs(e.clientY - dragStart.current.y)
      if (dx < 4 && dy < 4) {
        const pos = getGridPos(e)
        if (pos) selectPixelAt(pos)
      }
    }
    setDragging(false)
  }

  // Pixel selection (unchanged)
  function selectPixelAt(pos) {
    if (selected && selected.x === pos.x && selected.y === pos.y) {
      setSelected(null)
      return
    }
    const key = `${pos.x},${pos.y}`
    const existing = pixelMap.get(key)
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
        x: pos.x, y: pos.y,
        color: '#1a1a26', owner: null, owner_id: null,
        for_sale: false, sale_price: 0, price: 1, id: null,
      })
    }
    setTab('info')
  }

  // Touch handlers (unchanged EXCEPT removed e.preventDefault() - now handled by native listener)
  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      setDragging(true)
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: offset.x, oy: offset.y }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.hypot(dx, dy)
      lastTouchCenter.current = { x:(e.touches[0].clientX+e.touches[1].clientX)/2, y:(e.touches[0].clientY+e.touches[1].clientY)/2 }
    }
  }

  function handleTouchMove(e) {
    // NOTE: e.preventDefault() is now handled by native listener in useEffect above
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
      const rect = canvasRef.current.getBoundingClientRect()
      const mx = c.x - rect.left, my = c.y - rect.top
      setOffset({ x: mx - (mx - offset.x) * (nz / zoom), y: my - (my - offset.y) * (nz / zoom) })
      setZoom(nz)
      lastTouchDist.current = dist
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length < 2) { lastTouchDist.current = null; lastTouchCenter.current = null }
    if (e.touches.length === 0) setDragging(false)
  }

  // ══ FIX #3: Buy pixel now uses secure RPC functions ══
  // This ensures seller gets paid 90% on resales
  async function buyPixel() {
    if (!selected || !profile || actionLoading) return
    setActionLoading(true)

    try {
      if (selected.id) {
        // Existing pixel - use buy_pixel RPC (handles payment to seller)
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
        // New unclaimed pixel - use buy_new_pixel RPC
        const { error } = await supabase.rpc('buy_new_pixel', {
          p_x: selected.x,
          p_y: selected.y,
          p_buyer_id: profile.id,
          p_color: color,
        })
        if (error) throw error
        showToast(`Bought (${selected.x}, ${selected.y}) for ⬥1!`)
      }

      await loadProfile(profile.id)
      await loadPixels()
      await loadMarket()
      await loadLeaderboard()
      setSelected(null)
    } catch (e) {
      showToast(e.message || 'Purchase failed')
    }
    setActionLoading(false)
  }

  // Paint pixel (unchanged)
  async function paintPixel() {
    if (!selected || !profile || selected.owner_id !== profile.id || actionLoading) return
    setActionLoading(true)
    await supabase.from('pixels').update({ color, updated_at: new Date().toISOString() }).eq('id', selected.id)
    await loadPixels()
    setActionLoading(false)
    showToast('Painted!')
  }

  // List for sale (unchanged)
  async function listForSale() {
    if (!selected || !profile || selected.owner_id !== profile.id || actionLoading) return
    const price = parseInt(saleInput)
    if (isNaN(price) || price < 1) { showToast('Enter a valid price'); return }
    setActionLoading(true)
    await supabase.from('pixels').update({ for_sale: true, sale_price: price, updated_at: new Date().toISOString() }).eq('id', selected.id)
    await loadPixels()
    await loadMarket()
    setSaleInput('')
    setSelected(null)
    setActionLoading(false)
    showToast(`Listed at ⬥${price}`)
  }

  // Cancel sale (unchanged)
  async function cancelSale() {
    if (!selected || !profile || selected.owner_id !== profile.id || actionLoading) return
    setActionLoading(true)
    await supabase.from('pixels').update({ for_sale: false, sale_price: 0, updated_at: new Date().toISOString() }).eq('id', selected.id)
    await loadPixels()
    await loadMarket()
    setSelected(null)
    setActionLoading(false)
    showToast('Sale cancelled')
  }

  // ── Derived state (unchanged) ──
  const sel = selected
  const isOwner = sel && profile && sel.owner_id === profile.id
  const isUnowned = sel && !sel.owner_id
  const isForSale = sel && sel.for_sale && sel.owner_id !== profile?.id

  // ── Render (unchanged) ──
  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0f' }}>
        <div style={{ fontFamily:"'Silkscreen',cursive", color:'#555570', fontSize:14 }}>Loading...</div>
      </div>
    )
  }

  if (!user) return <AuthScreen onLogin={(u) => { setUser(u); loadProfile(u.id) }} />

  // Show tutorial for new users (coins === 10 and no pixels owned)
  const userPixelCount = Array.from(pixelMap.values()).filter(p => p.owner_id === profile?.id).length
  if (profile && profile.coins === 10 && userPixelCount === 0 && !showTutorial && tutorialStep === 0) {
    // Check if they already completed it (they might have refreshed)
    // We use a simple localStorage flag
    if (typeof window !== 'undefined' && !localStorage.getItem('tutorial_done_' + profile.id)) {
      setShowTutorial(true)
    }
  }

  const btnBase = { width:'100%', padding:'10px 0', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:600, transition:'all .2s' }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', background:'#0a0a0f' }}>
      {toast && (
        <div style={{
          position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', zIndex:999,
          background:'#1a1a26ee', border:'1px solid #3a3a5a', borderRadius:8, padding:'10px 24px',
          fontFamily:"'Silkscreen',cursive", fontSize:11, color:'#e8e8f0', boxShadow:'0 4px 24px #0008',
        }}>{toast}</div>
      )}

      {/* ═══ TUTORIAL OVERLAY ═══ */}
      {showTutorial && (
        <div style={{
          position:'fixed', inset:0, zIndex:1000,
          background:'rgba(0,0,0,0.75)', backdropFilter:'blur(2px)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end',
          padding:'20px 20px 60px', cursor:'pointer',
        }} onClick={nextTutorialStep}>

          {/* Highlight indicators */}
          {TUTORIAL_STEPS[tutorialStep].highlight === 'canvas' && (
            <div style={{
              position:'absolute', top:50, left:10, right:310, bottom:10,
              border:'2px solid #ff3e3e', borderRadius:12, pointerEvents:'none',
              boxShadow:'0 0 30px #ff3e3e44, inset 0 0 30px #ff3e3e11',
              animation:'pulse-border 1.5s ease-in-out infinite',
            }}/>
          )}
          {TUTORIAL_STEPS[tutorialStep].highlight === 'sidebar' && (
            <div style={{
              position:'absolute', top:50, right:0, width:300, bottom:0,
              border:'2px solid #ff3e3e', borderRadius:12, pointerEvents:'none',
              boxShadow:'0 0 30px #ff3e3e44, inset 0 0 30px #ff3e3e11',
              animation:'pulse-border 1.5s ease-in-out infinite',
            }}/>
          )}
          {TUTORIAL_STEPS[tutorialStep].highlight === 'coins' && (
            <div style={{
              position:'absolute', top:4, right:120, width:100, height:36,
              border:'2px solid #ffd700', borderRadius:8, pointerEvents:'none',
              boxShadow:'0 0 20px #ffd70044',
              animation:'pulse-border 1.5s ease-in-out infinite',
            }}/>
          )}

          {/* Frieren + Speech Bubble */}
          <div style={{
            display:'flex', alignItems:'flex-end', gap:16,
            maxWidth:700, width:'100%',
          }}>
            {/* Frieren avatar */}
            <div style={{
              flexShrink:0, width:120, height:140,
              backgroundImage:'url(/frieren.png)',
              backgroundSize:'contain', backgroundRepeat:'no-repeat',
              backgroundPosition:'bottom center',
              imageRendering:'pixelated',
              filter:'drop-shadow(0 0 12px #ff3e3e44)',
              animation:'float 2s ease-in-out infinite',
            }}/>

            {/* Speech bubble */}
            <div style={{
              flex:1, position:'relative',
              background:'#1a1a26', border:'2px solid #3a3a5a',
              borderRadius:'16px 16px 16px 4px',
              padding:'20px 24px',
              boxShadow:'0 4px 24px #0008',
            }}>
              {/* Triangle pointer */}
              <div style={{
                position:'absolute', bottom:12, left:-12,
                width:0, height:0,
                borderTop:'8px solid transparent',
                borderBottom:'8px solid transparent',
                borderRight:'12px solid #3a3a5a',
              }}/>
              <div style={{
                position:'absolute', bottom:12, left:-9,
                width:0, height:0,
                borderTop:'7px solid transparent',
                borderBottom:'7px solid transparent',
                borderRight:'10px solid #1a1a26',
              }}/>

              {/* Text with typewriter */}
              <p style={{
                fontFamily:"'Silkscreen',cursive", fontSize:13, color:'#e8e8f0',
                lineHeight:1.8, margin:0, minHeight:50,
              }}>
                {TUTORIAL_STEPS[tutorialStep].text.slice(0, tutorialTextIndex)}
                {!tutorialTextDone && <span style={{ opacity: 0.5, animation:'blink 0.5s infinite' }}>▌</span>}
              </p>

              {/* Step counter + hint */}
              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                marginTop:14, borderTop:'1px solid #2a2a3a', paddingTop:10,
              }}>
                <span style={{ fontFamily:"'Silkscreen',cursive", fontSize:9, color:'#555570' }}>
                  {tutorialStep + 1} / {TUTORIAL_STEPS.length}
                </span>
                <span style={{
                  fontFamily:"'Silkscreen',cursive", fontSize:10, color:'#8888a0',
                  animation:'blink 1.5s ease-in-out infinite',
                }}>
                  {tutorialTextDone ? (tutorialStep < TUTORIAL_STEPS.length - 1 ? '▶ Click to continue' : '▶ Click to start!') : '▶ Click to skip'}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                position:'absolute', bottom:0, left:0, right:0, height:3,
                background:'#2a2a3a', borderRadius:'0 0 14px 0', overflow:'hidden',
              }}>
                <div style={{
                  height:'100%', background:'linear-gradient(90deg, #ff3e3e, #ffd700)',
                  width: `${((tutorialStep + 1) / TUTORIAL_STEPS.length) * 100}%`,
                  transition:'width 0.3s ease',
                  borderRadius:'0 0 14px 0',
                }}/>
              </div>
            </div>
          </div>

          {/* CSS animations */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
            @keyframes pulse-border {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Header */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'10px 20px', borderBottom:'1px solid #1a1a26', background:'#0a0a0fdd',
        zIndex:50, flexWrap:'wrap', gap:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ fontFamily:"'Silkscreen',cursive", fontSize:20, letterSpacing:2, color:'#ff3e3e', textShadow:'0 0 20px #ff3e3e44' }}>
            PIXEL<span style={{color:'#e8e8f0'}}>/</span>PLACE
          </div>
          <span style={{ fontSize:10, color:'#555570' }}>1000×1000</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div style={{
            fontFamily:"'Silkscreen',cursive", fontSize:12, color:'#ffd700', textShadow:'0 0 10px #ffd70033',
            background:'#1a1a26', padding:'6px 14px', borderRadius:6, border:'1px solid #ffd70022',
          }}>⬥ {profile?.coins || 0}</div>
          <span style={{ fontSize:12, color:'#8888a0' }}>{profile?.username}</span>
          <button onClick={handleLogout} style={{
            padding:'5px 12px', border:'1px solid #2a2a3a', borderRadius:4, background:'transparent',
            color:'#8888a0', fontSize:11, cursor:'pointer',
          }}>Logout</button>
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{
        position:'fixed', bottom:16, left:16, zIndex:50, background:'#1a1a26dd',
        border:'1px solid #2a2a3a', borderRadius:8, padding:'8px 12px', display:'flex', alignItems:'center', gap:8,
      }}>
        <button onClick={() => setZoom(z => Math.max(MIN_ZOOM, z/1.3))} style={{
          background:'none', border:'1px solid #3a3a5a', borderRadius:4, color:'#e8e8f0', width:28, height:28, cursor:'pointer', fontSize:16,
        }}>−</button>
        <span style={{ fontSize:10, color:'#8888a0', fontFamily:"'Silkscreen',cursive", minWidth:40, textAlign:'center' }}>{zoom.toFixed(1)}x</span>
        <button onClick={() => setZoom(z => Math.min(MAX_ZOOM, z*1.3))} style={{
          background:'none', border:'1px solid #3a3a5a', borderRadius:4, color:'#e8e8f0', width:28, height:28, cursor:'pointer', fontSize:16,
        }}>+</button>
      </div>

      {hovered && (
        <div style={{
          position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', zIndex:50,
          background:'#1a1a26dd', border:'1px solid #2a2a3a', borderRadius:6, padding:'5px 14px',
          fontSize:10, color:'#8888a0', fontFamily:"'Silkscreen',cursive",
        }}>({hovered.x}, {hovered.y})</div>
      )}

      {/* Main */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div ref={containerRef} style={{ flex:1, position:'relative', cursor: dragging ? 'grabbing' : 'grab' }}>
          <canvas ref={canvasRef}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
            onMouseLeave={() => { setDragging(false); setHovered(null) }}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            style={{ display:'block', width:'100%', height:'100%' }}
          />
          <div style={{ position:'absolute', top:10, left:10, fontSize:10, color:'#555570', pointerEvents:'none' }}>
            Scroll to zoom · Drag to pan · Click to select
          </div>
        </div>

        {/* Sidebar (all unchanged) */}
        <div style={{ width:300, borderLeft:'1px solid #1a1a26', background:'#0d0d14', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #1a1a26' }}>
            {[['info','PIXEL'],['market','MARKET'],['leaders','RANKS']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                flex:1, padding:'12px 0', border:'none', cursor:'pointer',
                fontFamily:"'Silkscreen',cursive", fontSize:10, letterSpacing:1,
                background: tab===k ? '#1a1a26' : 'transparent',
                color: tab===k ? '#e8e8f0' : '#555570',
                borderBottom: tab===k ? '2px solid #ff3e3e' : '2px solid transparent',
              }}>{l}</button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:16 }}>
            {tab === 'info' && (
              sel ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{
                    width:48, height:48, borderRadius:8, border:'2px solid #3a3a5a',
                    margin:'0 auto 4px', backgroundColor: sel.color || '#1a1a26',
                    boxShadow: sel.color !== '#1a1a26' ? `0 0 20px ${sel.color}33` : 'none',
                  }}/>
                  {[
                    ['POSITION', `(${sel.x}, ${sel.y})`],
                    ['OWNER', sel.owner || 'Unclaimed'],
                    ['STATUS', isUnowned ? 'Available' : sel.for_sale ? 'For Sale' : 'Owned'],
                    ['PRICE', `⬥ ${sel.for_sale ? sel.sale_price : sel.price}`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                      <span style={{ color:'#555570', fontSize:10, letterSpacing:1 }}>{label}</span>
                      <span style={{ color: label==='PRICE' ? '#ffd700' : '#e8e8f0' }}>{value}</span>
                    </div>
                  ))}

                  {isUnowned && (
                    <button onClick={buyPixel} disabled={actionLoading} style={{
                      ...btnBase, background:'#ff3e3e', color:'#fff', opacity: actionLoading ? 0.6 : 1,
                    }}>{actionLoading ? 'Buying...' : `Buy for ⬥${sel.price}`}</button>
                  )}

                  {isForSale && (
                    <button onClick={buyPixel} disabled={actionLoading} style={{
                      ...btnBase, background:'#00e676', color:'#0a0a0f', opacity: actionLoading ? 0.6 : 1,
                    }}>{actionLoading ? 'Buying...' : `Buy for ⬥${sel.sale_price}`}</button>
                  )}

                  {isOwner && (
                    <>
                      <div>
                        <span style={{ fontSize:10, color:'#555570', letterSpacing:1 }}>PAINT COLOR</span>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginTop:6 }}>
                          {PALETTE.map(c => (
                            <div key={c} onClick={() => setColor(c)} style={{
                              aspectRatio:'1', borderRadius:3, cursor:'pointer', backgroundColor:c,
                              border: color===c ? '2px solid #fff' : '2px solid transparent',
                              boxShadow: color===c ? '0 0 6px #fff6' : 'none',
                              transform: color===c ? 'scale(1.1)' : 'scale(1)', transition:'all .15s',
                            }}/>
                          ))}
                        </div>
                        <button onClick={paintPixel} disabled={actionLoading} style={{
                          ...btnBase, marginTop:8, background:'#22222e', color:'#e8e8f0',
                          border:'1px solid #3a3a5a', fontWeight:400, opacity: actionLoading ? 0.6 : 1,
                        }}>Paint</button>
                      </div>
                      <div>
                        {sel.for_sale ? (
                          <button onClick={cancelSale} disabled={actionLoading} style={{
                            ...btnBase, background:'#22222e', color:'#e8e8f0',
                            border:'1px solid #3a3a5a', fontWeight:400, fontSize:11,
                          }}>Cancel Sale (⬥{sel.sale_price})</button>
                        ) : (
                          <>
                            <span style={{ fontSize:10, color:'#555570', letterSpacing:1, display:'block', marginBottom:6 }}>LIST FOR SALE</span>
                            <div style={{ display:'flex', gap:6 }}>
                              <input type="number" min="1" placeholder="Price" value={saleInput}
                                onChange={e => setSaleInput(e.target.value)}
                                style={{
                                  width:80, padding:'6px 10px', background:'#0a0a0f',
                                  border:'1px solid #2a2a3a', borderRadius:4, color:'#ffd700', fontSize:13, outline:'none',
                                }}/>
                              <button onClick={listForSale} disabled={actionLoading} style={{
                                padding:'6px 14px', border:'none', borderRadius:4, cursor:'pointer',
                                background:'#00e676', color:'#0a0a0f', fontSize:11, fontWeight:600,
                              }}>List</button>
                            </div>
                            <span style={{ fontSize:9, color:'#555570', marginTop:4, display:'block' }}>10% fee on sales</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:40, color:'#555570', fontSize:12 }}>
                  <div style={{ fontSize:32, marginBottom:12, opacity:0.3 }}>◻</div>
                  Zoom in and click a pixel
                </div>
              )
            )}

            {tab === 'market' && (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <span style={{ fontFamily:"'Silkscreen',cursive", fontSize:10, color:'#8888a0', letterSpacing:1, marginBottom:8 }}>
                  {marketPixels.length} LISTED
                </span>
                {marketPixels.length === 0 ? (
                  <p style={{ textAlign:'center', padding:16, color:'#555570', fontSize:12 }}>No pixels for sale yet</p>
                ) : marketPixels.map(mp => (
                  <div key={mp.id} onClick={() => {
                    selectPixelAt({ x: mp.x, y: mp.y })
                    if (containerRef.current) {
                      const w = containerRef.current.clientWidth
                      const h = containerRef.current.clientHeight
                      setOffset({ x: w/2 - mp.x * zoom, y: h/2 - mp.y * zoom })
                    }
                  }} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'9px 10px', background:'#12121a', border:'1px solid #1a1a26',
                    borderRadius:6, cursor:'pointer', transition:'border-color .2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#3a3a5a'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='#1a1a26'}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:18, height:18, borderRadius:3, backgroundColor:mp.color, border:'1px solid #3a3a5a' }}/>
                      <div>
                        <div style={{ fontSize:11, color:'#8888a0' }}>({mp.x},{mp.y})</div>
                        <div style={{ fontSize:9, color:'#555570' }}>{mp.profiles?.username || 'unknown'}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily:"'Silkscreen',cursive", fontSize:11, color:'#ffd700' }}>⬥{mp.sale_price}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'leaders' && (
              <div>
                <span style={{ fontFamily:"'Silkscreen',cursive", fontSize:10, color:'#8888a0', letterSpacing:1, display:'block', marginBottom:12 }}>
                  {pixelMap.size.toLocaleString()} PIXELS CLAIMED
                </span>
                {leaderboard.length === 0 ? (
                  <p style={{ textAlign:'center', padding:16, color:'#555570', fontSize:12 }}>No pixels claimed yet</p>
                ) : leaderboard.map((entry, i) => (
                  <div key={entry.name} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'9px 0', borderBottom: i < leaderboard.length-1 ? '1px solid #1a1a26' : 'none',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ color:'#555570', fontSize:10, width:22 }}>#{i+1}</span>
                      <span style={{ fontSize:12, color: entry.name===profile?.username ? '#ff3e3e' : '#e8e8f0' }}>
                        {entry.name} {entry.name===profile?.username && '★'}
                      </span>
                    </div>
                    <span style={{ fontFamily:"'Silkscreen',cursive", fontSize:11, color:'#ff3e3e' }}>{entry.count}px</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding:'10px 16px', borderTop:'1px solid #1a1a26', fontSize:9, color:'#555570', textAlign:'center', letterSpacing:1 }}>
            {pixelMap.size.toLocaleString()} / 1,000,000 CLAIMED
          </div>
        </div>
      </div>
    </div>
  )
}
