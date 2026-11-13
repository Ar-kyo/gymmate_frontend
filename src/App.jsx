import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from './api.js';

const localDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const money = (amount) => new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
}).format(Number(amount || 0));

function Brand() {
  return <Link className="brand" to="/"><span className="brand-mark">G</span>gym<span>mate</span></Link>;
}

function Header({ user, onLogout }) {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Brand />
        <nav className="main-nav">
          <a href="/#programs">Programs</a>
          <a href="/#trainers">Trainers</a>
          <a href="/#membership">Membership</a>
          <a href="/#location">Location</a>
          <Link to="/contact">Contact</Link>
          {user ? (
            <>
              <Link className="nav-quiet" to="/dashboard">Hi, {user.full_name.split(' ')[0]}</Link>
              <button className="button button-outline button-small" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="nav-quiet" to="/login">Log in</Link>
              <Link className="button button-primary button-small" to="/register">Join GymMate <span>↗</span></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-row"><Brand /><p>Move with intention. Get stronger together.</p><span>© {new Date().getFullYear()} GymMate</span></div></footer>;
}

function Layout({ user, onLogout, appError, children }) {
  return <><Header user={user} onLogout={onLogout} />{appError && <div className="container alert alert-error app-alert" role="alert">{appError}</div>}<main>{children}</main><Footer /></>;
}

function Eyebrow({ children }) {
  return <p className="eyebrow"><span className="eyebrow-dot" />{children}</p>;
}

function Home({ catalog, loading, catalogError }) {
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-layout">
          <div className="hero-copy">
            <Eyebrow>YOUR FITNESS, YOUR WAY</Eyebrow>
            <h1>Make room<br />for <span>stronger.</span></h1>
            <p className="hero-lead">A better routine starts with a plan that fits your life. Find your people, meet your coach, and build strength that stays with you.</p>
            <div className="hero-actions"><Link className="button button-primary" to="/register">Start your journey <span>↗</span></Link><a className="text-link" href="#membership">Explore memberships <span>↓</span></a></div>
            <div className="hero-proof"><span className="proof-avatars"><i>J</i><i>M</i><i>A</i></span><span>Real coaching. Real progress.</span></div>
          </div>
          <div className="hero-art" aria-label="Abstract GymMate strength illustration">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-sun" />
            <div className="art-label label-top"><span>01</span> BUILD YOUR BASE</div>
            <div className="art-person"><span className="person-head" /><span className="person-body" /><span className="person-arm" /><span className="person-leg" /></div>
            <div className="art-weight weight-left" /><div className="art-weight weight-right" />
            <div className="art-label label-bottom"><strong>MOVE</strong><span>AT YOUR PACE</span></div><span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✳</span>
          </div>
        </div>
        <div className="container hero-bottom"><span>01 / MEMBERSHIP</span><span>02 / COACHING</span><span>03 / PROGRESS</span><span className="scroll-hint">SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="intro-section section-pad" id="programs">
        <div className="container intro-layout"><div><Eyebrow>MORE THAN A WORKOUT</Eyebrow><h2>Small steps.<br /><span>Lasting strength.</span></h2></div><p className="intro-text">GymMate brings your gym membership and personal training into one simple place. Choose your plan, meet available trainers, and keep your progress moving forward.</p></div>
        <div className="container feature-grid">
          <article className="feature-card"><span className="feature-number">01</span><div className="feature-icon">↗</div><h3>Find your rhythm</h3><p>Choose a membership plan that supports your goals and your schedule.</p></article>
          <article className="feature-card feature-highlight"><span className="feature-number">02</span><div className="feature-icon">◎</div><h3>Train with a coach</h3><p>Browse available trainers and request the coaching style that fits you.</p></article>
          <article className="feature-card"><span className="feature-number">03</span><div className="feature-icon">⌁</div><h3>Keep your progress</h3><p>Track your membership and coaching requests from your personal dashboard.</p></article>
        </div>
      </section>

      <section className="membership-section section-pad" id="membership">
        <div className="container section-heading"><div><Eyebrow>MEMBERSHIP, MADE SIMPLE</Eyebrow><h2>Pick your <span>pace.</span></h2></div><p>Every plan gets you through the door. Personal training is always a separate service.</p></div>
        <div className="container plan-grid">
          {loading && <p className="empty-state">Loading membership plans…</p>}
          {!loading && catalog.plans.map((plan, index) => (
            <article className={`plan-card ${index === 1 ? 'plan-featured' : ''}`} key={plan.plan_id}>
              {index === 1 && <span className="plan-tag">MOST POPULAR</span>}
              <p className="plan-name">{plan.plan_name}</p><p className="plan-duration">{plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}</p>
              <p className="plan-price">{money(plan.price)}</p><p className="plan-note">One-time membership payment</p>
              <ul><li>Gym floor access</li><li>Member progress dashboard</li><li>Personal training available separately</li></ul>
              <Link className={`button ${index === 1 ? 'button-primary' : 'button-outline'} button-full`} to="/register">Choose {plan.plan_name} <span>↗</span></Link>
            </article>
          ))}
          {!loading && catalog.plans.length === 0 && <p className="empty-state">Membership plans will appear here once they are added to the database.</p>}
        </div>
      </section>

      <section className="trainer-section section-pad" id="trainers">
        <div className="container section-heading"><div><Eyebrow>YOUR GOALS, WITH A GUIDE</Eyebrow><h2>Meet your <span>people.</span></h2></div><p>Personal training is an optional service, separate from your gym membership.</p></div>
        {catalogError && <div className="container alert alert-error" role="alert">{catalogError}</div>}
        <div className="container trainer-grid">
          {catalog.trainers.map((trainer) => (
            <article className="trainer-card" key={trainer.trainer_id}>
              <div className="trainer-avatar">{trainer.full_name.slice(0, 1).toUpperCase()}</div>
              <div className="trainer-info"><div className="trainer-title"><div><h3>{trainer.full_name}</h3><p>{trainer.specialization || 'Personal training'}</p></div><span className="available-dot">AVAILABLE</span></div>
                <p className="trainer-bio">{trainer.bio || 'A supportive coach ready to help you work toward your fitness goals.'}</p>
                <div className="trainer-meta"><span>{trainer.experience_years} years experience</span><strong>{money(trainer.training_rate)}<small> / session</small></strong></div>
              </div>
            </article>
          ))}
          {!loading && catalog.trainers.length === 0 && <p className="empty-state">Available trainers will appear here when their profiles are added.</p>}
        </div>
      </section>
      <section className="location-section section-pad" id="location">
        <div className="container location-layout">
          <div><Eyebrow>COME SAY HELLO</Eyebrow><h2>Find us around <span>Masipit.</span></h2><p className="panel-copy">Our approximate area is Masipit, Calapan City. The map shows a general search area, not a confirmed gym entrance; please contact the team to confirm the exact location before visiting.</p><a className="button button-outline" href="https://www.google.com/maps/search/?api=1&query=Masipit%2C%20Calapan%20City" target="_blank" rel="noreferrer">Open map search <span>↗</span></a></div>
          <iframe title="Approximate map search for Masipit, Calapan City" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Masipit%2C%20Calapan%20City&t=&z=14&ie=UTF8&iwloc=&output=embed" />
        </div>
      </section>
      <section className="cta-section"><div className="container cta-panel"><Eyebrow>YOUR NEXT REP STARTS HERE</Eyebrow><h2>Ready to feel<br /><span>more like you?</span></h2><Link className="button button-dark" to="/register">Create your free account <span>↗</span></Link><div className="cta-mark">G</div></div></section>
    </>
  );
}

function AuthPage({ mode, onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      if (isRegister) {
        const registration = await api('/api/register', { method: 'POST', data });
        const session = await api('/api/login', { method: 'POST', data: { email: data.email, password: data.password } });
        onLogin(session.user, registration.emailSent);
      } else {
        const session = await api('/api/login', { method: 'POST', data });
        onLogin(session.user, null);
      }
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="container auth-layout">
        <aside className="auth-aside"><Eyebrow>{isRegister ? 'YOUR STRONGER STARTS HERE' : 'WELCOME BACK'}</Eyebrow><h1>{isRegister ? <>Get to know<br /><span>yourself.</span></> : <>Your next<br /><span>chapter.</span></>}</h1><p>{isRegister ? 'Your account includes the basics your team needs to support a safe, personal fitness journey.' : 'Pick up where you left off. Your membership and training updates are waiting.'}</p><div className="auth-note"><span>✳</span><p>Your health information is shared with your GymMate team to support your training.</p></div></aside>
        <div className="form-card">
          <div className="form-heading"><Eyebrow>{isRegister ? 'CREATE AN ACCOUNT' : 'MEMBER ACCESS'}</Eyebrow><h2>{isRegister ? 'Join GymMate' : 'Sign in'}</h2><p>{isRegister ? <>Already a member? <Link to="/login">Sign in</Link></> : <>New to GymMate? <Link to="/register">Create an account</Link></>}</p></div>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <form className="stack-form" onSubmit={submit}>
            {isRegister ? <RegistrationFields /> : <><label>Email address<input type="email" name="email" autoComplete="email" required /></label><label>Password<input type="password" name="password" autoComplete="current-password" required /></label></>}
            <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <span>↗</span></button>
          </form>
          {isRegister && <p className="form-footnote">New sign-ups are trainee/member accounts. Trainer access is assigned by the GymMate administrator; administrator access is not available through sign-up.</p>}
          {!isRegister && <p className="form-footnote">For your security, always sign out when you finish on a shared device.</p>}
        </div>
      </div>
    </section>
  );
}

function RegistrationFields() {
  return (
    <>
      <div className="form-section-label">ACCOUNT DETAILS</div>
      <label>Full name<input name="full_name" autoComplete="name" maxLength="100" required /></label>
      <label>Email address<input type="email" name="email" autoComplete="email" maxLength="100" required /></label>
      <div className="form-row"><label>Password<input type="password" name="password" autoComplete="new-password" minLength="8" required /></label><label>Confirm password<input type="password" name="password_confirmation" autoComplete="new-password" minLength="8" required /></label></div>
      <div className="form-row"><label>Contact number<input name="contact_number" autoComplete="tel" maxLength="20" /></label><label>Birthdate<input type="date" name="birthdate" max={new Date().toISOString().slice(0, 10)} /></label></div>
      <label>Address<input name="address" autoComplete="street-address" maxLength="255" /></label>
      <label>Sex<select name="sex" defaultValue=""><option value="">Prefer not to say</option><option>Male</option><option>Female</option><option>Other</option></select></label>
      <div className="form-section-label form-section-spaced">HEALTH & FITNESS</div>
      <div className="form-row"><label>Height (cm)<input type="number" step="0.1" min="1" name="height_cm" /></label><label>Weight (kg)<input type="number" step="0.1" min="1" name="weight_kg" /></label></div>
      <label>Blood pressure<input name="blood_pressure" maxLength="10" placeholder="e.g. 120/80" /></label>
      <label>Fitness goal<input name="fitness_goal" maxLength="100" placeholder="e.g. Build strength, improve endurance" /></label>
      <div className="form-row"><label>Emergency contact name<input name="emergency_name" maxLength="100" /></label><label>Emergency contact number<input name="emergency_contact" maxLength="20" /></label></div>
      <label>Medical conditions<textarea name="medical_conditions" rows="2" /></label>
      <label>Allergies<textarea name="allergies" rows="2" /></label>
      <label>Previous injuries<textarea name="previous_injuries" rows="2" /></label>
      <label>Current medications<textarea name="current_medications" rows="2" /></label>
    </>
  );
}

function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api('/api/contact', {
        method: 'POST',
        data: Object.fromEntries(new FormData(event.currentTarget).entries()),
      });
      setMessage(result.message);
      event.currentTarget.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="auth-section">
    <div className="container auth-layout">
      <aside className="auth-aside"><Eyebrow>WE'RE HERE TO HELP</Eyebrow><h1>Say <span>hello.</span></h1><p>Send a message to the GymMate administrator about memberships, training, or visiting the gym.</p><div className="auth-note"><span>✳</span><p>The map is only an approximate area around Masipit, Calapan City. Please confirm the exact gym location with the team before visiting.</p></div></aside>
      <div className="form-card"><div className="form-heading"><Eyebrow>CONTACT GYMMATE</Eyebrow><h2>Send us a message</h2><p>Your note goes to the administrator's configured email address.</p></div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
        <form className="stack-form" onSubmit={submit}>
          <label>Your name<input name="name" maxLength="100" autoComplete="name" required /></label>
          <label>Email address<input name="email" type="email" maxLength="254" autoComplete="email" required /></label>
          <label>Message<textarea name="message" rows="6" maxLength="5000" required /></label>
          <label className="contact-honeypot" aria-hidden="true" tabIndex="-1">Leave this field empty<input name="website" tabIndex="-1" autoComplete="off" /></label>
          <button className="button button-primary button-full" disabled={busy}>{busy ? 'Sending…' : 'Send message'} <span>↗</span></button>
        </form>
      </div>
    </div>
  </section>;
}

function Status({ value }) {
  const status = String(value || 'pending');
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

function DashboardSections({ items, label }) {
  return <nav className="dashboard-section-nav" aria-label={label}>
    {items.map(([id, title]) => <a href={`#${id}`} key={id}>{title}</a>)}
  </nav>;
}

function MemberPass() {
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const refreshPass = useCallback(async () => {
    try {
      const result = await api('/api/member/pass');
      setPass(result);
      setError('');
    } catch (requestError) {
      setPass(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPass();
  }, [refreshPass]);

  return <section className="dashboard-panel member-pass" id="member-pass">
    <div className="panel-heading"><div><Eyebrow>GYM ENTRY</Eyebrow><h2>Your membership pass</h2></div><span className="panel-index">UNIQUE QR</span></div>
    {pass ? <div className="pass-layout"><div className="pass-qr"><QRCodeSVG value={pass.token} size={208} level="M" includeMargin /></div><div><h3>{pass.membership.plan_name}</h3><p className="panel-copy">This is your unique GymMate check-in QR. Show it to a GymMate trainer or administrator. It stays the same; your current membership is checked each time it is scanned. Avoid sharing screenshots.</p><small>Membership valid through {new Date(`${pass.membership.end_date}T00:00:00`).toLocaleDateString()}</small><p><button className="button button-outline button-small" type="button" onClick={refreshPass}>Reload pass</button></p></div></div> : <p className={error && !loading ? 'panel-copy' : 'empty-state'}>{loading ? 'Loading your secure pass…' : error || 'Your membership pass is unavailable.'}</p>}
  </section>;
}

function SessionBooking({ requests, onRefresh }) {
  const accepted = requests.filter((request) => request.status === 'accepted');
  const [requestId, setRequestId] = useState('');
  const [date, setDate] = useState(() => localDate(new Date(Date.now() + 86400000)));
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setSlots([]);
    setSlot('');
    setError('');
    if (requestId && date) {
      api(`/api/member/session-slots?request_id=${encodeURIComponent(requestId)}&date=${encodeURIComponent(date)}`)
        .then((result) => { if (active) setSlots(result.slots); })
        .catch((requestError) => { if (active) setError(requestError.message); });
    }
    return () => { active = false; };
  }, [requestId, date]);

  async function book(event) {
    event.preventDefault();
    if (!slot) return;
    setBusy(true);
    setError('');
    setMessage('');
    const [scheduleId, startTime] = slot.split('|');
    const notes = new FormData(event.currentTarget).get('notes');
    try {
      const result = await api('/api/member/sessions', {
        method: 'POST',
        data: { request_id: requestId, session_date: date, schedule_id: scheduleId, start_time: startTime, notes },
      });
      setMessage(result.message);
      setSlot('');
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="dashboard-panel" id="member-booking">
    <div className="panel-heading"><div><Eyebrow>PERSONAL TRAINING</Eyebrow><h2>Book a trainer session</h2></div></div>
    {accepted.length ? <form className="dashboard-form" onSubmit={book}>
      <label>Accepted trainer request<select value={requestId} onChange={(event) => setRequestId(event.target.value)} required><option value="">Choose a trainer</option>{accepted.map((request) => <option value={request.request_id} key={request.request_id}>{request.trainer_name} · {request.fitness_goal}</option>)}</select></label>
      <label>Session date<input type="date" min={localDate()} max={localDate(new Date(Date.now() + 90 * 86400000))} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      <label>Available one-hour time<select value={slot} onChange={(event) => setSlot(event.target.value)} required disabled={!slots.length}><option value="">{slots.length ? 'Choose an available time' : 'No times available for this date'}</option>{slots.map((item) => <option value={`${item.schedule_id}|${item.start_time}`} key={`${item.schedule_id}-${item.start_time}`}>{item.start_time}–{item.end_time}</option>)}</select></label>
      <label>Note for your trainer (optional)<textarea name="notes" rows="2" maxLength="255" /></label>
      {error && <div className="alert alert-error" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
      <button className="button button-primary" disabled={busy || !slot}>{busy ? 'Booking…' : 'Book session'} <span>↗</span></button>
    </form> : <p className="panel-copy">After your selected trainer accepts your request, you can book a time from their weekly availability.</p>}
  </section>;
}

function MemberDashboard({ data, onRefresh }) {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const membershipPlans = data.catalog.plans;
  const trainers = data.catalog.trainers;

  async function submit(event, path) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const result = await api(path, { method: 'POST', data: Object.fromEntries(new FormData(event.currentTarget).entries()) });
      setMessage(result.message);
      event.currentTarget.reset();
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function startMembershipCheckout(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const result = await api('/api/memberships', {
        method: 'POST',
        data: Object.fromEntries(new FormData(event.currentTarget).entries()),
      });
      window.location.assign(result.checkout_url);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  }

  const plans = Object.values(data.training_plans.reduce((grouped, exercise) => {
    if (!grouped[exercise.plan_id]) grouped[exercise.plan_id] = { ...exercise, exercises: [] };
    if (exercise.exercise_name) grouped[exercise.plan_id].exercises.push(exercise);
    return grouped;
  }, {}));

  return (
    <>
      <div className="dashboard-welcome"><div><Eyebrow>YOUR GYMMATE SPACE</Eyebrow><h1>Good to see you, <span>{data.user.full_name.split(' ')[0]}.</span></h1><p>Manage your gym membership and coaching requests in one place.</p></div><div className="dash-stats"><span>MEMBER ID</span><strong>#{String(data.user.user_id).padStart(5, '0')}</strong></div></div>
      {message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-error" role="alert">{error}</div>}
      <DashboardSections label="Member dashboard sections" items={[
        ['member-pass', 'Membership pass'],
        ['member-sessions', 'Trainer sessions'],
        ['member-attendance', 'Attendance'],
        ['member-membership', 'Membership & payment'],
        ['member-coaching', 'Trainer requests'],
        ['member-health', 'Health profile'],
        ['member-progress', 'Plans & progress'],
      ]} />
      <MemberPass />
      <div className="dashboard-columns" id="member-sessions">
        <SessionBooking requests={data.requests} onRefresh={onRefresh} />
        <section className="dashboard-panel"><div className="panel-heading"><div><Eyebrow>YOUR SCHEDULE</Eyebrow><h2>Trainer sessions</h2></div><span className="panel-index">{data.sessions.length}</span></div>
          {data.sessions.length ? <div className="record-list">{data.sessions.map((session) => <article className="record-card" key={session.session_id}><div><h3>{session.trainer_name}</h3><p>{new Date(`${session.session_date}T00:00:00`).toLocaleDateString()} · {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}</p></div><div className="record-status"><Status value={session.status} />{session.status === 'booked' && new Date(`${session.session_date}T${session.start_time}`) > new Date() && <button className="button button-outline button-small" type="button" onClick={async () => { try { await api('/api/member/sessions/cancel', { method: 'POST', data: { session_id: session.session_id } }); await onRefresh(); } catch (requestError) { setError(requestError.message); } }}>Cancel</button>}</div></article>)}</div> : <p className="panel-copy">Your booked trainer sessions will appear here.</p>}
        </section>
      </div>
      <section className="dashboard-panel" id="member-attendance"><div className="panel-heading"><div><Eyebrow>GYM VISITS</Eyebrow><h2>Attendance history</h2></div><span className="panel-index">{data.attendance.length} CHECK-INS</span></div>
        {data.attendance.length ? <div className="record-list">{data.attendance.map((item) => <article className="record-card" key={item.log_id}><div><h3>{item.plan_name}</h3><p>{new Date(item.check_in_time.replace(' ', 'T')).toLocaleString()}</p></div></article>)}</div> : <p className="panel-copy">Your check-ins will appear here after a trainer or administrator scans your active membership pass.</p>}
      </section>
      <div className="dashboard-columns">
        <section className="dashboard-panel" id="member-membership"><div className="panel-heading"><div><Eyebrow>YOUR MEMBERSHIP</Eyebrow><h2>Plan & payment</h2></div><span className="panel-index">01</span></div>
          {data.memberships.length ? <div className="record-list">{data.memberships.map((item) => <article className="record-card" key={item.membership_id}><div><h3>{item.plan_name}</h3><p>{item.duration_months} {item.duration_months === 1 ? 'month' : 'months'} · {money(item.price)}</p></div><div className="record-status"><Status value={item.payment_status || item.status} /><small>{item.payment_method || 'Payment pending'}</small></div></article>)}</div> : <p className="panel-copy">Choose a plan to get started. Your membership payment is separate from personal training.</p>}
          <form className="dashboard-form" onSubmit={startMembershipCheckout}>
            <label>Membership plan<select name="plan_id" required defaultValue=""><option value="" disabled>Choose a plan</option>            {membershipPlans.map((plan) => <option value={plan.plan_id} key={plan.plan_id}>{plan.plan_name} — {money(plan.price)} / {plan.duration_months} mo</option>)}</select></label>
            <div className="payment-method-note"><strong>Payment method: GCash</strong><span>Secure checkout opens on PayMongo. Your membership activates only after payment confirmation.</span></div>
            <button className="button button-primary" type="submit" disabled={!membershipPlans.length || busy}>{busy ? 'Starting secure checkout…' : 'Pay with GCash'} <span>↗</span></button>
          </form>
        </section>
        <section className="dashboard-panel" id="member-coaching"><div className="panel-heading"><div><Eyebrow>ONE-TO-ONE COACHING</Eyebrow><h2>Trainer requests</h2></div><span className="panel-index">02</span></div>
          {data.requests.length ? <div className="record-list">{data.requests.map((item) => <article className="record-card" key={item.request_id}><div><h3>{item.trainer_name}</h3><p>{item.fitness_goal} · {item.preferred_schedule}</p></div><div className="record-status"><Status value={item.status} /><small>{money(item.training_rate)} / session</small></div></article>)}</div> : <p className="panel-copy">Tell a trainer what you're working toward. Personal training is billed separately from your gym plan.</p>}
          <form className="dashboard-form" onSubmit={(event) => submit(event, '/api/trainer-requests')}>
            <label>Available trainer<select name="trainer_id" required defaultValue=""><option value="" disabled>Choose a trainer</option>{trainers.map((trainer) => <option value={trainer.trainer_id} key={trainer.trainer_id}>{trainer.full_name} · {trainer.specialization || 'Personal training'}</option>)}</select></label>
            <label>Fitness goal<input name="fitness_goal" maxLength="100" required placeholder="e.g. Improve strength" /></label>
            <div className="form-row"><label>Preferred schedule<input name="preferred_schedule" maxLength="100" required placeholder="e.g. Weekday evenings" /></label><label>Training preference<select name="training_preference" required defaultValue=""><option value="" disabled>Select</option><option>One-on-one</option><option>Online</option><option>Flexible</option></select></label></div>
            <label>Additional notes<textarea name="additional_notes" maxLength="1000" rows="2" /></label>
            <button className="button button-primary" type="submit" disabled={!trainers.length}>Request a trainer <span>↗</span></button>
          </form>
        </section>
      </div>
      <HealthProfile health={data.health} onRefresh={onRefresh} />
      <div className="dashboard-columns member-progress-columns" id="member-progress">
        <section className="dashboard-panel"><div className="panel-heading"><div><Eyebrow>YOUR TRAINING</Eyebrow><h2>Training plans</h2></div><span className="panel-index">{plans.length} PLANS</span></div>
          {plans.length ? <div className="record-list">{plans.map((plan) => <article className="record-card member-plan-card" key={plan.plan_id}><div><h3>{plan.goal || 'Training plan'}</h3><p>Coach: {plan.trainer_name} · {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : 'Recently added'}</p><ul>{plan.exercises.map((exercise) => <li key={`${exercise.plan_id}-${exercise.day_of_week}-${exercise.exercise_name}`}><strong>{exercise.day_of_week}</strong> — {exercise.exercise_name}{exercise.sets ? ` · ${exercise.sets} sets` : ''}{exercise.reps ? ` × ${exercise.reps} reps` : ''}{exercise.duration_min ? ` · ${exercise.duration_min} min` : ''}{exercise.notes ? ` · ${exercise.notes}` : ''}</li>)}</ul></div></article>)}</div> : <p className="panel-copy">Your trainer’s workout plans will appear here after they add them.</p>}
        </section>
        <section className="dashboard-panel"><div className="panel-heading"><div><Eyebrow>YOUR JOURNEY</Eyebrow><h2>Progress history</h2></div><span className="panel-index">{data.progress.length} RECORDS</span></div>
          {data.progress.length ? <div className="record-list">{data.progress.map((record) => <article className="record-card" key={record.progress_id}><div><h3>{new Date(`${record.record_date}T00:00:00`).toLocaleDateString()} · {record.workout_completed ? 'Workout completed' : 'Progress check-in'}</h3><p>Coach: {record.trainer_name}{record.weight_kg ? ` · ${record.weight_kg} kg` : ''}{record.bmi ? ` · BMI ${record.bmi}` : ''}{record.duration_min ? ` · ${record.duration_min} min` : ''}{record.calories_burned ? ` · ${record.calories_burned} kcal` : ''}</p>{record.trainer_notes && <p className="progress-notes">{record.trainer_notes}</p>}</div></article>)}</div> : <p className="panel-copy">Progress check-ins from your trainer will appear here.</p>}
        </section>
      </div>
    </>
  );
}

function HealthProfile({ health, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api('/api/member/health', { method: 'POST', data: Object.fromEntries(new FormData(event.currentTarget).entries()) });
      setMessage(result.message);
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="dashboard-panel health-profile" id="member-health"><div className="panel-heading"><div><Eyebrow>YOUR WELLBEING</Eyebrow><h2>Health & fitness profile</h2></div><span className="panel-index">PRIVATE</span></div>
    <p className="panel-copy">Keep these details current so your coaching can be tailored safely. Your assigned trainer can view relevant details while working with you.</p>
    {message && <div className="alert alert-success" role="status">{message}</div>}{error && <div className="alert alert-error" role="alert">{error}</div>}
    <form className="dashboard-form health-form" onSubmit={submit}>
      <div className="form-row"><label>Height (cm)<input type="number" step="0.1" min="1" max="300" name="height_cm" defaultValue={health?.height_cm || ''} /></label><label>Weight (kg)<input type="number" step="0.1" min="1" max="700" name="weight_kg" defaultValue={health?.weight_kg || ''} /></label></div>
      <div className="form-row"><label>Blood pressure<input name="blood_pressure" maxLength="10" placeholder="e.g. 120/80" defaultValue={health?.blood_pressure || ''} /></label><label>Fitness goal<input name="fitness_goal" maxLength="100" defaultValue={health?.fitness_goal || ''} /></label></div>
      <div className="form-row"><label>Emergency contact name<input name="emergency_name" maxLength="100" defaultValue={health?.emergency_name || ''} /></label><label>Emergency contact number<input name="emergency_contact" maxLength="20" defaultValue={health?.emergency_contact || ''} /></label></div>
      <label>Medical conditions<textarea name="medical_conditions" rows="2" maxLength="5000" defaultValue={health?.medical_conditions || ''} /></label>
      <label>Allergies<textarea name="allergies" rows="2" maxLength="5000" defaultValue={health?.allergies || ''} /></label>
      <label>Previous injuries<textarea name="previous_injuries" rows="2" maxLength="5000" defaultValue={health?.previous_injuries || ''} /></label>
      <label>Current medications<textarea name="current_medications" rows="2" maxLength="5000" defaultValue={health?.current_medications || ''} /></label>
      <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save health profile'} <span>↗</span></button>
    </form>
  </section>;
}

function TrainerDashboard({ members, progress, schedules, sessions, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const assignedMembers = members.filter((member) => ['accepted', 'completed'].includes(member.status));
  const planMembers = members.filter((member) => member.status === 'accepted');

  async function updateSession(sessionId, status) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api('/api/trainer/sessions', { method: 'POST', data: { session_id: sessionId, status } });
      setMessage(result.message);
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function submit(event, path) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api(path, { method: 'POST', data: Object.fromEntries(new FormData(event.currentTarget).entries()) });
      setMessage(result.message);
      event.currentTarget.reset();
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function reviewRequest(requestId, status) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api('/api/trainer/requests', {
        method: 'POST',
        data: { request_id: requestId, status },
      });
      setMessage(result.message);
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="dashboard-panel" id="trainer-roster">
    <DashboardSections label="Trainer dashboard sections" items={[
      ['trainer-roster', 'Member requests'],
      ['trainer-availability', 'Availability'],
      ['trainer-check-in', 'QR check-in'],
      ['trainer-programs', 'Training plans'],
      ['trainer-sessions', 'Booked sessions'],
      ['trainer-progress', 'Progress history'],
    ]} />
    <div className="panel-heading"><div><Eyebrow>YOUR ROSTER</Eyebrow><h2>Member requests</h2></div><span className="panel-index">{members.length}</span></div>
    {members.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Member</th><th>Goal</th><th>Preferred schedule</th><th>Status / response</th><th>Health details</th></tr></thead><tbody>{members.map((member) => <tr key={member.request_id}><td><strong>{member.member_name}</strong><small>{member.email}</small></td><td>{member.fitness_goal}</td><td>{member.preferred_schedule}</td><td><Status value={member.status} />{member.status === 'pending' && <div className="admin-actions request-actions"><button className="button button-primary button-small" disabled={busy} onClick={() => reviewRequest(member.request_id, 'accepted')}>{busy ? 'Saving…' : 'Accept'}</button><button className="button button-outline button-small" disabled={busy} onClick={() => reviewRequest(member.request_id, 'declined')}>Decline</button></div>}</td><td><details><summary>{member.height_cm || '—'} cm / {member.weight_kg || '—'} kg</summary><small>Blood pressure: {member.blood_pressure || 'Not provided'}</small><small>Conditions: {member.medical_conditions || 'None provided'}</small><small>Allergies: {member.allergies || 'None provided'}</small><small>Injuries: {member.previous_injuries || 'None provided'}</small><small>Medications: {member.current_medications || 'None provided'}</small><small>Emergency contact: {member.emergency_name || '—'} {member.emergency_contact || ''}</small></details></td></tr>)}</tbody></table></div> : <p className="panel-copy">Member requests will show here when someone selects your trainer profile.</p>}
    {error && <div className="alert alert-error" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    <div className="dashboard-columns trainer-tools">
      <section className="dashboard-panel" id="trainer-availability"><div className="panel-heading"><div><Eyebrow>SET YOUR HOURS</Eyebrow><h2>Weekly availability</h2></div></div>
        <form className="dashboard-form" onSubmit={(event) => submit(event, '/api/trainer/schedules')}>
          <label>Day<select name="day_of_week" required defaultValue=""><option value="" disabled>Choose a day</option>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day}>{day}</option>)}</select></label>
          <div className="form-row"><label>Start time<input name="start_time" type="time" required /></label><label>End time<input name="end_time" type="time" required /></label></div>
          <button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Add availability'} <span>↗</span></button>
        </form>
        {schedules.length ? <div className="record-list">{schedules.map((schedule) => <article className="record-card" key={schedule.schedule_id}><div><h3>{schedule.day_of_week}</h3><p>{schedule.start_time.slice(0, 5)}–{schedule.end_time.slice(0, 5)}</p></div></article>)}</div> : <p className="panel-copy">Add weekly availability so accepted members can book one-hour sessions.</p>}
      </section>
      <QrCheckIn onRefresh={onRefresh} />
      <section className="dashboard-panel" id="trainer-programs"><div className="panel-heading"><div><Eyebrow>WORKOUT PROGRAM</Eyebrow><h2>Create a training plan</h2></div></div>
        {planMembers.length ? <form className="dashboard-form" onSubmit={(event) => submit(event, '/api/trainer/training-plans')}>
          <label>Member<select name="request_id" required defaultValue=""><option value="" disabled>Select an accepted member</option>{planMembers.map((member) => <option value={member.request_id} key={member.request_id}>{member.member_name} · {member.fitness_goal}</option>)}</select></label>
          <label>Plan goal<input name="goal" maxLength="100" required placeholder="e.g. Build strength safely" /></label>
          <div className="form-row"><label>Day<select name="day_of_week" required defaultValue=""><option value="" disabled>Select a day</option>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day}>{day}</option>)}</select></label><label>Exercise<input name="exercise_name" maxLength="100" required placeholder="e.g. Bodyweight squat" /></label></div>
          <div className="form-row"><label>Sets<input name="sets" type="number" min="1" max="100" /></label><label>Reps<input name="reps" type="number" min="1" max="1000" /></label></div>
          <label>Duration (minutes)<input name="duration_min" type="number" min="1" max="1440" /></label><label>Exercise notes<input name="notes" maxLength="255" /></label>
          <button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Add exercise to plan'} <span>↗</span></button>
        </form> : <p className="panel-copy">An admin must accept a trainer request before you can add a plan.</p>}
      </section>
      <section className="dashboard-panel"><div className="panel-heading"><div><Eyebrow>MEMBER CHECK-IN</Eyebrow><h2>Record progress</h2></div></div>
        {assignedMembers.length ? <form className="dashboard-form" onSubmit={(event) => submit(event, '/api/trainer/progress')}>
          <label>Member<select name="request_id" required defaultValue=""><option value="" disabled>Select an accepted member</option>{assignedMembers.map((member) => <option value={member.request_id} key={member.request_id}>{member.member_name} · {member.fitness_goal}</option>)}</select></label>
          <div className="form-row"><label>Date<input name="record_date" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={new Date().toISOString().slice(0, 10)} required /></label><label>Workout completed?<select name="workout_completed" defaultValue="0"><option value="1">Yes</option><option value="0">Not today</option></select></label></div>
          <div className="form-row"><label>Weight (kg)<input name="weight_kg" type="number" min="0.1" max="700" step="0.1" /></label><label>BMI<input name="bmi" type="number" min="1" max="100" step="0.1" /></label></div>
          <div className="form-row"><label>Duration (minutes)<input name="duration_min" type="number" min="1" max="1440" /></label><label>Calories burned<input name="calories_burned" type="number" min="1" max="50000" /></label></div>
          <label>Trainer notes<textarea name="trainer_notes" rows="2" maxLength="5000" /></label>
          <button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save progress check-in'} <span>↗</span></button>
        </form> : <p className="panel-copy">An admin must accept a trainer request before you can record progress.</p>}
      </section>
    </div>
    <section className="dashboard-panel trainer-progress" id="trainer-sessions"><div className="panel-heading"><div><Eyebrow>UPCOMING COACHING</Eyebrow><h2>Booked sessions</h2></div><span className="panel-index">{sessions.length}</span></div>
      {sessions.length ? <div className="record-list">{sessions.map((session) => <article className="record-card" key={session.session_id}><div><h3>{session.member_name}</h3><p>{new Date(`${session.session_date}T00:00:00`).toLocaleDateString()} · {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}</p>{session.notes && <p>{session.notes}</p>}</div><div className="record-status"><Status value={session.status} />{session.status === 'booked' && <div className="admin-actions"><button className="button button-primary button-small" disabled={busy} onClick={() => updateSession(session.session_id, 'completed')}>Complete</button><button className="button button-outline button-small" disabled={busy} onClick={() => updateSession(session.session_id, 'cancelled')}>Cancel</button></div>}</div></article>)}</div> : <p className="panel-copy">Member bookings will appear here when sessions are scheduled.</p>}
    </section>
    <section className="dashboard-panel trainer-progress" id="trainer-progress"><div className="panel-heading"><div><Eyebrow>RECENT CHECK-INS</Eyebrow><h2>Member progress</h2></div><span className="panel-index">{progress.length} RECORDS</span></div>
      {progress.length ? <div className="record-list">{progress.map((record) => <article className="record-card" key={record.progress_id}><div><h3>{record.member_name} · {new Date(`${record.record_date}T00:00:00`).toLocaleDateString()}</h3><p>{record.workout_completed ? 'Workout completed' : 'Progress check-in'}{record.weight_kg ? ` · ${record.weight_kg} kg` : ''}{record.duration_min ? ` · ${record.duration_min} min` : ''}{record.calories_burned ? ` · ${record.calories_burned} kcal` : ''}</p>{record.trainer_notes && <p>{record.trainer_notes}</p>}</div></article>)}</div> : <p className="panel-copy">Your check-ins will appear here after you record progress.</p>}
    </section>
  </section>;
}

function QrCheckIn({ onRefresh }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  async function checkIn(value) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api('/api/attendance/check-in', { method: 'POST', data: { token: value } });
      setMessage(result.message);
      setToken('');
      setOpen(false);
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    let scanner;
    let disposed = false;
    let submitted = false;
    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (disposed) return;
      scanner = new Html5QrcodeScanner('gymmate-qr-reader', { fps: 10, qrbox: { width: 240, height: 240 } }, false);
      scanner.render((decodedText) => {
        if (submitted) return;
        submitted = true;
        setOpen(false);
        checkIn(decodedText);
      }, () => {});
    }).catch(() => {
      if (!disposed) setError('The QR scanner could not be loaded. Please try again or paste the pass token.');
    });
    return () => {
      disposed = true;
      if (scanner) scanner.clear().catch(() => {});
    };
  }, [open]);

  return <section className="dashboard-panel" id="trainer-check-in">
    <div className="panel-heading"><div><Eyebrow>GYM FLOOR</Eyebrow><h2>Member check-in</h2></div></div>
    {message && <div className="alert alert-success" role="status">{message}</div>}
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    {open && <div id="gymmate-qr-reader" className="qr-reader" />}
    <div className="admin-actions"><button className="button button-primary" type="button" disabled={busy} onClick={() => { setError(''); setOpen(!open); }}>{open ? 'Close camera' : 'Scan membership QR'} <span>◎</span></button><span className="panel-copy">Camera access works on localhost or a secure HTTPS site.</span></div>
    <form className="dashboard-form qr-manual" onSubmit={(event) => { event.preventDefault(); checkIn(token.trim()); }}>
      <label>Or paste a scanned pass token<textarea value={token} onChange={(event) => setToken(event.target.value)} maxLength="2048" rows="2" required /></label>
      <button className="button button-outline" disabled={busy || !token.trim()}>{busy ? 'Checking…' : 'Check in member'}</button>
    </form>
  </section>;
}

function AdminUserRow({ account, busy, onSave }) {
  const [role, setRole] = useState(account.role === 'trainer' ? 'trainer' : 'member');
  const [specialization, setSpecialization] = useState(account.specialization || '');
  const [experience, setExperience] = useState(account.experience_years ?? '');
  const [rate, setRate] = useState(account.training_rate ?? '');

  async function submit(event) {
    event.preventDefault();
    await onSave({
      user_id: account.user_id,
      role,
      specialization,
      experience_years: experience,
      training_rate: rate,
    });
  }

  if (account.role === 'admin') {
    return <tr><td><strong>{account.full_name}</strong><small>{account.email}</small></td><td>{account.contact_number || '—'}</td><td><Status value="admin" /></td><td>Administrator access is managed directly in the database.</td></tr>;
  }

  return <tr>
    <td><strong>{account.full_name}</strong><small>{account.email}</small></td>
    <td>{account.contact_number || '—'}</td>
    <td><Status value={account.role} /></td>
    <td>
      <form className="admin-role-form" onSubmit={submit}>
        <select aria-label={`Role for ${account.full_name}`} value={role} onChange={(event) => setRole(event.target.value)} disabled={busy}>
          <option value="member">Trainee / member</option>
          <option value="trainer">Trainer</option>
        </select>
        {role === 'trainer' && <>
          <input aria-label="Trainer specialization" value={specialization} onChange={(event) => setSpecialization(event.target.value)} maxLength="100" placeholder="Specialization" required disabled={busy} />
          <input aria-label="Trainer experience in years" type="number" value={experience} onChange={(event) => setExperience(event.target.value)} min="0" max="80" placeholder="Years experience" disabled={busy} />
          <input aria-label="Trainer session rate" type="number" value={rate} onChange={(event) => setRate(event.target.value)} min="0.01" step="0.01" placeholder="Rate / session" required disabled={busy} />
        </>}
        <button className="button button-outline button-small" type="submit" disabled={busy || role === account.role}>{busy ? 'Saving…' : 'Save role'}</button>
      </form>
    </td>
  </tr>;
}

function AdminCreateAccount({ busy, onCreate }) {
  const [role, setRole] = useState('member');

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    if (await onCreate(values)) {
      form.reset();
      setRole('member');
    }
  }

  return <section className="dashboard-panel admin-panel">
    <div className="panel-heading"><div><Eyebrow>NEW ACCOUNT</Eyebrow><h2>Add a member or trainer</h2></div></div>
    <p className="panel-copy">Create an account and share its temporary password securely with the new user.</p>
    <form className="dashboard-form admin-create-form" onSubmit={submit}>
      <label>Full name<input name="full_name" maxLength="100" autoComplete="name" required disabled={busy} /></label>
      <label>Email<input name="email" type="email" maxLength="254" autoComplete="email" required disabled={busy} /></label>
      <label>Temporary password<input name="password" type="password" minLength="8" autoComplete="new-password" required disabled={busy} /></label>
      <label>Confirm password<input name="password_confirmation" type="password" minLength="8" autoComplete="new-password" required disabled={busy} /></label>
      <label>Account type<select name="role" value={role} onChange={(event) => setRole(event.target.value)} disabled={busy}><option value="member">Member</option><option value="trainer">Gym trainer</option></select></label>
      <label>Contact number (optional)<input name="contact_number" type="tel" maxLength="20" autoComplete="tel" disabled={busy} /></label>
      {role === 'trainer' && <>
        <label>Specialization<input name="specialization" maxLength="100" placeholder="e.g. Strength training" required disabled={busy} /></label>
        <label>Years of experience (optional)<input name="experience_years" type="number" min="0" max="80" step="1" disabled={busy} /></label>
        <label>Session rate<input name="training_rate" type="number" min="0.01" max="99999999.99" step="0.01" required disabled={busy} /></label>
      </>}
      <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <span>↗</span></button>
    </form>
  </section>;
}

function AdminDashboard({ data, onRefresh }) {
  const { stats } = data;
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const items = [['MEMBERS', stats.members], ['TRAINERS', stats.trainers], ['PENDING MEMBERSHIP PAYMENTS', stats.pending_payments], ['PENDING TRAINER REQUESTS', stats.pending_requests]];

  async function runAction(path, payload, key) {
    setBusyAction(key);
    setError('');
    setMessage('');
    try {
      const result = await api(path, { method: 'POST', data: payload });
      setMessage(result.message);
      await onRefresh();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setBusyAction('');
    }
  }

  return <>
    <div className="admin-stat-grid">{items.map(([label, count]) => <article className="admin-stat" key={label}><span>{label}</span><strong>{count}</strong></article>)}</div>
    {message && <div className="alert alert-success admin-feedback" role="status">{message}</div>}
    {error && <div className="alert alert-error admin-feedback" role="alert">{error}</div>}
    <AdminCreateAccount busy={!!busyAction} onCreate={(payload) => runAction('/api/admin/users', payload, 'create-user')} />
    <div className="dashboard-columns"><QrCheckIn onRefresh={onRefresh} /><section className="dashboard-panel"><div className="panel-heading"><div><Eyebrow>RECENT VISITS</Eyebrow><h2>Attendance log</h2></div><span className="panel-index">{data.attendance.length} CHECK-INS</span></div>
      {data.attendance.length ? <div className="record-list">{data.attendance.map((visit) => <article className="record-card" key={visit.log_id}><div><h3>{visit.member_name}</h3><p>{visit.plan_name} · {new Date(visit.check_in_time.replace(' ', 'T')).toLocaleString()}</p></div></article>)}</div> : <p className="panel-copy">Verified membership scans will appear here.</p>}
    </section></div>
    <section className="dashboard-panel admin-panel">
      <div className="panel-heading"><div><Eyebrow>PEOPLE & ACCESS</Eyebrow><h2>Members and trainers</h2></div><span className="panel-index">{data.users.length} ACCOUNTS</span></div>
      <p className="panel-copy">Assign trainer access and maintain member accounts. Public registration cannot create trainers or admins.</p>
      <div className="table-wrap"><table className="data-table admin-table"><thead><tr><th>Account</th><th>Contact</th><th>Current role</th><th>Role management</th></tr></thead><tbody>
        {data.users.map((account) => <AdminUserRow key={account.user_id} account={account} busy={busyAction === `role-${account.user_id}`} onSave={(payload) => runAction('/api/admin/users/role', payload, `role-${account.user_id}`)} />)}
      </tbody></table></div>
    </section>
    <section className="dashboard-panel admin-panel">
      <div className="panel-heading"><div><Eyebrow>MEMBERSHIP</Eyebrow><h2>Payment reviews</h2></div><span className="panel-index">{stats.pending_payments} PENDING</span></div>
      {data.payments.length ? <div className="table-wrap"><table className="data-table admin-table"><thead><tr><th>Member / plan</th><th>Amount</th><th>Payment details</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {data.payments.map((payment) => <tr key={payment.payment_id}>
          <td><strong>{payment.full_name}</strong><small>{payment.email}</small><small>{payment.plan_name}</small></td>
          <td>{money(payment.amount)}</td>
          <td>{payment.payment_method}<small>Reference: {payment.reference_number || '—'}</small></td>
          <td><Status value={payment.payment_status} /></td>
          <td>{payment.payment_status === 'Pending' && (payment.payment_method !== 'GCash' || !String(payment.reference_number || '').startsWith('GM-')) ? <div className="admin-actions">
            <button className="button button-primary button-small" disabled={!!busyAction} onClick={() => runAction('/api/admin/membership-payments', { payment_id: payment.payment_id, status: 'Verified' }, `payment-${payment.payment_id}`)}>{busyAction === `payment-${payment.payment_id}` ? 'Saving…' : 'Verify'}</button>
            <button className="button button-outline button-small" disabled={!!busyAction} onClick={() => { if (window.confirm(`Reject ${payment.full_name}'s ${payment.plan_name} payment?`)) runAction('/api/admin/membership-payments', { payment_id: payment.payment_id, status: 'Rejected' }, `payment-${payment.payment_id}`); }}>Reject</button>
          </div> : payment.payment_status === 'Pending' && payment.payment_method === 'GCash' && String(payment.reference_number || '').startsWith('GM-') ? 'Waiting for PayMongo payment confirmation' : <span>{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : payment.verified_at ? new Date(payment.verified_at).toLocaleDateString() : 'Reviewed'}</span>}</td>
        </tr>)}
      </tbody></table></div> : <p className="panel-copy">No membership payments have been submitted yet.</p>}
    </section>
    <section className="dashboard-panel admin-panel">
      <div className="panel-heading"><div><Eyebrow>COACHING</Eyebrow><h2>Trainer request status</h2></div><span className="panel-index">{stats.pending_requests} PENDING</span></div>
      <p className="panel-copy">The assigned trainer reviews and accepts or declines requests from their dashboard.</p>
      {data.trainer_requests.length ? <div className="table-wrap"><table className="data-table admin-table"><thead><tr><th>Member</th><th>Trainer</th><th>Goal & schedule</th><th>Status</th><th>Response owner</th></tr></thead><tbody>
        {data.trainer_requests.map((request) => <tr key={request.request_id}>
          <td><strong>{request.member_name}</strong><small>{request.member_email}</small></td>
          <td>{request.trainer_name}</td>
          <td>{request.fitness_goal || '—'}<small>{request.preferred_schedule || 'Schedule not provided'} · {request.training_preference || 'Flexible'}</small></td>
          <td><Status value={request.status} /></td>
          <td>Assigned trainer only</td>
        </tr>)}
      </tbody></table></div> : <p className="panel-copy">No trainer requests have been submitted yet.</p>}
    </section>
  </>;
}

function PaymentReturn() {
  const search = new URLSearchParams(window.location.search);
  const reference = search.get('reference') || '';
  const wasCancelled = search.get('status') === 'cancelled';
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    let timer;
    let attempts = 0;
    async function checkStatus() {
      try {
        const result = await api(`/api/memberships/payment-status?reference=${encodeURIComponent(reference)}`);
        if (!active) return;
        setPayment(result.payment);
        setError('');
        attempts += 1;
        if (result.payment.payment_status === 'Pending' && attempts < 20 && !wasCancelled) {
          timer = window.setTimeout(checkStatus, 3000);
        } else {
          setChecking(false);
        }
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message);
        setChecking(false);
      }
    }

    if (reference) checkStatus();
    else {
      setError('The payment reference is missing.');
      setChecking(false);
    }
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [reference, wasCancelled]);

  const paid = payment?.payment_status === 'Paid';
  return <section className="auth-section">
    <div className="container payment-return-card">
      <Eyebrow>{paid ? 'PAYMENT CONFIRMED' : 'GCASH CHECKOUT'}</Eyebrow>
      <h1>{paid ? 'You’re all set.' : wasCancelled ? 'Checkout not completed.' : 'Confirming your payment.'}</h1>
      {paid ? <p>Your GCash payment for {payment.plan_name} is confirmed, and your membership is active.</p>
        : error ? <div className="alert alert-error" role="alert">{error} If you completed the payment, sign in and check your membership status.</div>
          : wasCancelled ? <p>You returned from checkout without a payment confirmation. No membership will activate until PayMongo confirms a successful GCash payment.</p>
            : <p>{checking ? 'Waiting for PayMongo’s secure payment confirmation. This can take a few moments.' : 'We have not received confirmation yet. Check your membership dashboard again shortly.'}</p>}
      {payment && !paid && <p className="panel-copy">Payment status: <Status value={payment.payment_status} /></p>}
      <div className="payment-return-actions"><Link className="button button-primary" to="/dashboard">Go to dashboard <span>↗</span></Link>{!paid && <button className="button button-outline" type="button" onClick={() => window.location.reload()}>Check again</button>}</div>
    </div>
  </section>;
}

function Dashboard({ user, catalog, emailSent }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const refresh = useCallback(async () => {
    try {
      const result = await api('/api/dashboard');
      setData({ ...result, catalog });
      setError('');
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.message.includes('sign in')) navigate('/login');
    }
  }, [catalog, navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  if (error && !data) return <section className="dashboard-section"><div className="container"><div className="alert alert-error">{error}</div></div></section>;
  if (!data) return <section className="dashboard-section"><div className="container"><p className="empty-state">Loading your GymMate dashboard…</p></div></section>;

  return <section className="dashboard-section"><div className="container">
    {emailSent !== null && <div className={`alert ${emailSent ? 'alert-success' : 'alert-error'}`} role="status">{emailSent ? 'Your account is ready, and a welcome email was sent to your inbox.' : 'Your account was created, but the welcome email could not be sent. Please check the SMTP settings with your administrator.'}</div>}
    {data.user.role === 'member' ? <MemberDashboard data={data} onRefresh={refresh} /> : <><div className="dashboard-welcome"><div><Eyebrow>{data.user.role === 'admin' ? 'GYMMATE ADMIN' : 'TRAINER SPACE'}</Eyebrow><h1>Welcome, <span>{data.user.full_name}.</span></h1><p>{data.user.role === 'admin' ? 'Manage accounts, verify membership payments, and monitor trainer requests.' : 'Review and respond to member requests, manage bookings, and set availability.'}</p></div></div>{data.user.role === 'trainer' ? <TrainerDashboard members={data.members} progress={data.progress} schedules={data.schedules} sessions={data.sessions} onRefresh={refresh} /> : <AdminDashboard data={data} onRefresh={refresh} />}</>}
  </div></section>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [catalog, setCatalog] = useState({ plans: [], trainers: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [appError, setAppError] = useState('');
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api('/api/catalog')
      .then((result) => { if (active) setCatalog(result); })
      .catch((error) => { if (active) setCatalogError(error.message); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    api('/api/me')
      .then((result) => { if (active) setUser(result.user); })
      .catch((error) => {
        if (!active || error.status === 401) return;
        setAppError(error.message);
      })
      .finally(() => {
        if (active) setSessionReady(true);
      });
    return () => { active = false; };
  }, []);

  async function logout() {
    try {
      await api('/api/logout', { method: 'POST' });
      setUser(null);
      setWelcomeEmailSent(null);
      setAppError('');
      navigate('/');
    } catch (error) {
      setAppError(error.message);
    }
  }

  function handleLogin(nextUser, emailSent) {
    setUser(nextUser);
    setWelcomeEmailSent(emailSent ?? null);
    setAppError('');
  }

  if (!sessionReady) return null;

  return <Layout user={user} onLogout={logout} appError={appError}><Routes>
    <Route path="/" element={<Home catalog={catalog} loading={catalogLoading} catalogError={catalogError} />} />
    <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" onLogin={handleLogin} />} />
    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" onLogin={handleLogin} />} />
    <Route path="/payment-return" element={<PaymentReturn />} />
    <Route path="/dashboard" element={user ? <Dashboard user={user} catalog={catalog} emailSent={welcomeEmailSent} /> : <Navigate to="/login" replace />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Layout>;
}
