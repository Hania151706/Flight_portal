import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import axios from'axios';
import{BrowserRouter,NavLink,Route,Routes,useNavigate}from'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Plane,
  Users,
  MapPin,
  ClipboardList,
  LogOut,
  Plus,
  Download,
  Printer,
  Search,
  Menu,
  BriefcaseBusiness,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import'./style.css';
const API=import.meta.env.VITE_API_URL||'http://localhost:4000/api';
const http=axios.create({baseURL:API});
http.interceptors.request.use(c=>{const t=localStorage.getItem('mgh_token');if(t)c.headers.Authorization=`Bearer ${t}`;return c;});
function Login({onLogin}){const[email,setEmail]=useState('admin@mgh.local'),[password,setPassword]=useState('MGH-Demo-2026!'),[error,setError]=useState('');async function submit(e){e.preventDefault();try{const{data}=await http.post('/auth/login',{email,password});localStorage.setItem('mgh_token',data.token);onLogin(data.user);}catch{setError('Invalid email or password.');}}return <div className="login-wrap"><form className="login-card" onSubmit={submit}><div className="brand-mark">M</div><p className="eyebrow">MERIDIAN GROUP HOLDINGS</p><h1>Executive Portal</h1><p className="muted">Sign in to manage travel and team plans.</p><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)}/><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p className="error">{error}</p>}<button className="btn primary full">Sign in</button><small>Local demo account: admin@mgh.local / MGH-Demo-2026!</small></form></div>}
function App(){const[user,setUser]=useState(null);useEffect(()=>{if(localStorage.getItem('mgh_token'))http.get('/dashboard').then(()=>setUser({name:'Grace Hall'})).catch(()=>localStorage.removeItem('mgh_token'));},[]);if(!user)return <Login onLogin={setUser}/>;return <BrowserRouter><Shell user={user} onLogout={()=>{localStorage.removeItem('mgh_token');setUser(null)}}/></BrowserRouter>}
function Shell({user,onLogout}){const[mobile,setMobile]=useState(false);const links=[['Overview','/',LayoutDashboard],['Team calendar','/calendar',CalendarDays],['Trip planner','/trips',BriefcaseBusiness],['Flights','/flights',Plane],['Team plan','/team',Users],['Directory','/directory',MapPin],['One-pagers','/one-pagers',ClipboardList]];return <div className="app-shell"><aside className={mobile?'sidebar open':'sidebar'}><div className="brand"><div className="brand-mark">M</div><div><b>MGH</b><small>Executive Office</small></div></div><div className="nav-caption">WORKSPACE</div>{links.map(([n,p,I])=><NavLink key={p} to={p} end={p==='/'} onClick={()=>setMobile(false)} className={({isActive})=>isActive?'nav-link active':'nav-link'}><I size={18}/>{n}</NavLink>)}<div className="side-bottom"><div className="avatar">{user.name?.[0]||'G'}</div><div className="user-info"><b>{user.name||'Grace Hall'}</b><small>CEO Office</small></div><button className="icon-btn" title="Sign out" onClick={onLogout}><LogOut size={17}/></button></div></aside><main className="main"><header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobile(!mobile)}><Menu/></button><div><span className="eyebrow">MGH / OPERATIONS</span><h2>Travel & Team Planning</h2></div><span className="confidential">CONFIDENTIAL</span></header><div className="content"><Routes><Route path="/" element={<Dashboard/>}/><Route path="/calendar" element={<CalendarPage/>}/><Route path="/trips" element={<Trips/>}/><Route path="/flights" element={<Flights/>}/><Route path="/team" element={<Team/>}/><Route path="/directory" element={<Directory/>}/><Route path="/one-pagers" element={<OnePagers/>}/></Routes></div></main></div>}
function PageTitle({eyebrow,title,description,action}){return <div className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div>{action}</div>}

function Dashboard() {
  const [k, setK] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [a, b] = await Promise.all([
        http.get('/dashboard'),
        http.get('/trips')
      ]);

      setK(a.data);
      setTrips(b.data);
    } catch (error) {
      console.error('Dashboard loading failed:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function exportData() {
    try {
      const response = await http.get('/export');

      const blob = new Blob(
        [JSON.stringify(response.data, null, 2)],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'mgh-export.json';
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Could not export data.');
    }
  }

  if (loading) {
    return <div className="empty">Loading dashboard...</div>;
  }

  return (
    <>
      <PageTitle
        eyebrow="OVERVIEW"
        title="Good afternoon, Grace"
        description="Here is the latest view of executive travel and team activity."
        action={
          <button className="btn" onClick={exportData}>
            <Download size={16} />
            Export data
          </button>
        }
      />

      {k && (
        <div className="stats">

          <Stat
            label="Total trips"
            value={k.totalTrips ?? trips.length}
            hint="All executive trips"
          />

          <Stat
            label="Upcoming trips"
            value={k.upcomingTrips}
            hint="Across the executive plan"
          />

          <Stat
            label="Travel days"
            value={k.totalTravelDays}
            hint="Based on dated trips"
          />

          <Stat
            label="Meetings planned"
            value={k.meetingsPlanned}
            hint="All trip meetings"
          />

          <Stat
            label="Team entries"
            value={k.teamEntries}
            hint="Travel, leave and remote"
          />

        </div>
      )}

      <div className="section-head">
        <div>
          <h3>Executive trips</h3>
          <p className="muted">
            Current and planned destinations
          </p>
        </div>

        <NavLink className="text-link" to="/trips">
          Manage trips →
        </NavLink>
      </div>

      <div className="trip-list">

        {trips.map(t => (
          <TripCard
            key={t.id}
            trip={t}
          />
        ))}

        {!trips.length && (
          <Empty text="No trips have been created yet." />
        )}

      </div>
    </>
  );
}
function Stat({label,value,hint}){return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>}

// Trip card component along with edit button and meeting list

function TripCard({ trip: t, onEdit, onDelete }) {
  return (
    <article className="trip-card">
      <div className="trip-icon">
        <MapPin />
      </div>

      <div className="trip-main">
        <div className="trip-title">
          <h4>{t.destination}</h4>

          <span className={
            'status ' +
            (t.status === 'Confirmed' ? 'green' : 'amber')
          }>
            {t.status}
          </span>
        </div>

        <p>
          {t.project || 'General travel'}
          {t.entity && ' · ' + t.entity}
        </p>

        <small>
          {t.startDate
            ? new Date(t.startDate).toLocaleDateString()
            : 'Date TBC'}

          {t.endDate
            ? ' — ' + new Date(t.endDate).toLocaleDateString()
            : ''}

          {' · '}{t.meetings?.length || 0} meetings
        </small>
      </div>

      <div className="trip-hotel">
        {t.hotel || 'Hotel TBC'}
        <small>{t.transport || 'Transport TBC'}</small>
      </div>

      {onEdit && (
        <button
          type="button"
          className="btn"
          onClick={() => onEdit(t)}
        >
          Edit trip
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          className="btn danger"
          onClick={() => onDelete(t)}
        >
          <Trash2 size={16} />
          Delete
        </button>
      )}
    </article>
  );
}

function Empty({text}) {
  return <div className="empty">{text}</div>;
}

function Field({label,children,wide}) {
  return (
    <label className={'field '+(wide?'span2':'')}>
      {label}
      {children}
    </label>
  );
}

function Trips() {
  const [data, setData] = useState([]);
  const [people, setPeople] = useState([]);
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    destination: '',
    project: '',
    entity: '',
    origin: '',
    startDate: '',
    endDate: '',
    status: 'Option',
    hotel: '',
    transport: ''
  });

  const [meeting, setMeeting] = useState({
    personName: '',
    priority: 'Medium',
    status: 'Proposed',
    meetingTime: '',
    agenda: ''
  });

  async function load() {
    const [trips, persons] = await Promise.all([
      http.get('/trips'),
      http.get('/people')
    ]);

    setData(trips.data);
    setPeople(persons.data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);


// DELETE AN EXISTING TRIP
async function deleteTrip(trip) {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${trip.destination}?`
  );

  if (!confirmed) return;

  try {
    await http.delete(`/trips/${trip.id}`);

    alert('Trip deleted successfully!');

    await load();

  } catch (error) {
    console.error('Delete error:', error);

    alert(
      error.response?.data?.error ||
      'Could not delete trip.'
    );
  }
}
  // EDIT: Load existing trip information into the form
  function editTrip(trip) {
    setEditingId(trip.id);

    setForm({
      destination: trip.destination || '',
      project: trip.project || '',
      entity: trip.entity || '',
      origin: trip.origin || '',
      startDate: trip.startDate
        ? trip.startDate.slice(0, 10)
        : '',
      endDate: trip.endDate
        ? trip.endDate.slice(0, 10)
        : '',
      status: trip.status || 'Option',
      hotel: trip.hotel || '',
      transport: trip.transport || ''
    });

    setShow(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // CREATE or UPDATE a trip
  async function saveTrip(e) {
    e.preventDefault();

    try {
      if (editingId) {
        await http.patch(`/trips/${editingId}`, form);
        alert('Trip updated successfully!');
      } else {
        const { data: trip } = await http.post('/trips', form);

        if (meeting.personName.trim()) {
          await http.post(
            `/trips/${trip.id}/meetings`,
            meeting
          );
        }

        alert('Trip created successfully!');
      }

      setShow(false);
      setEditingId(null);

      setForm({
        destination: '',
        project: '',
        entity: '',
        origin: '',
        startDate: '',
        endDate: '',
        status: 'Option',
        hotel: '',
        transport: ''
      });

      setMeeting({
        personName: '',
        priority: 'Medium',
        status: 'Proposed',
        meetingTime: '',
        agenda: ''
      });

      await load();

    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.error ||
        'Could not save trip'
      );
    }
  }

  function cancelForm() {
    setShow(false);
    setEditingId(null);
  }

  return (
    <>
      <PageTitle
        eyebrow="PLANNING"
        title="CEO trip planner"
        description="Create trips, attach meeting details and manage executive travel."
        action={
          <button
            className="btn primary"
            onClick={() => {
              setEditingId(null);
              setShow(!show);
            }}
          >
            <Plus size={16} /> New trip
          </button>
        }
      />

      {show && (
        <form
          className="panel form-grid"
          onSubmit={saveTrip}
        >
          <h3 className="span2">
            {editingId ? 'Edit trip details' : 'Trip details'}
          </h3>

          <Field label="Destination *">
            <input
              required
              value={form.destination}
              onChange={e => setForm({
                ...form,
                destination: e.target.value
              })}
            />
          </Field>

          <Field label="Project">
            <input
              value={form.project}
              onChange={e => setForm({
                ...form,
                project: e.target.value
              })}
            />
          </Field>

          <Field label="MGH entity">
            <input
              value={form.entity}
              onChange={e => setForm({
                ...form,
                entity: e.target.value
              })}
            />
          </Field>

          <Field label="Origin">
            <input
              value={form.origin}
              onChange={e => setForm({
                ...form,
                origin: e.target.value
              })}
            />
          </Field>

          <Field label="From">
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm({
                ...form,
                startDate: e.target.value
              })}
            />
          </Field>

          <Field label="To">
            <input
              type="date"
              value={form.endDate}
              onChange={e => setForm({
                ...form,
                endDate: e.target.value
              })}
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={e => setForm({
                ...form,
                status: e.target.value
              })}
            >
              <option>Option</option>
              <option>Tentative</option>
              <option>Confirmed</option>
            </select>
          </Field>

          <Field label="Hotel">
            <input
              value={form.hotel}
              onChange={e => setForm({
                ...form,
                hotel: e.target.value
              })}
            />
          </Field>

          <Field label="Transport">
            <input
              value={form.transport}
              onChange={e => setForm({
                ...form,
                transport: e.target.value
              })}
            />
          </Field>

          {!editingId && (
            <>
              <h3 className="span2">
                First meeting (optional)
              </h3>

              <Field label="Contact / person">
                <input
                  value={meeting.personName}
                  onChange={e => setMeeting({
                    ...meeting,
                    personName: e.target.value
                  })}
                />
              </Field>

              <Field label="Priority">
                <select
                  value={meeting.priority}
                  onChange={e => setMeeting({
                    ...meeting,
                    priority: e.target.value
                  })}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </Field>

              <Field label="Meeting time">
                <input
                  type="time"
                  value={meeting.meetingTime}
                  onChange={e => setMeeting({
                    ...meeting,
                    meetingTime: e.target.value
                  })}
                />
              </Field>

              <Field label="Agenda" wide>
                <textarea
                  value={meeting.agenda}
                  onChange={e => setMeeting({
                    ...meeting,
                    agenda: e.target.value
                  })}
                />
              </Field>
            </>
          )}

          <div className="form-actions span2">
            <button
              type="button"
              className="btn"
              onClick={cancelForm}
            >
              Cancel
            </button>

            <button className="btn primary">
              {editingId ? 'Update trip' : 'Save trip'}
            </button>
          </div>
        </form>
      )}

      <div className="trip-list">
        {data.map(t => (
          <div key={t.id}>
            <TripCard
              trip={t}
              onEdit={editTrip}
              onDelete={deleteTrip}
            />

            <div className="meeting-list">
              {t.meetings?.map(m => (
                <div className="meeting-row" key={m.id}>
                  <b>{m.sortOrder}. {m.personName}</b>
                  <span>
                    {m.meetingTime || 'Time TBC'} ·
                    {' '}{m.priority} · {m.status}
                  </span>
                  <p>{m.agenda}</p>

                  {m.materials?.map(x => (
                    <small key={x.id}>
                      Material: {x.description} —
                      {' '}{x.owner || 'Owner TBC'}
                    </small>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {!data.length && (
          <Empty text="No trips yet. Create your first executive trip." />
        )}
      </div>
    </>
  );
}

function Flights(){const[data,setData]=useState([]),[people,setPeople]=useState([]),[show,setShow]=useState(false),[f,setF]=useState({origin:'',destination:'',flightNumber:'',flightDate:'',departTime:'',arriveTime:'',aircraft:'',status:'Proposed'});async function load(){setData((await http.get('/flights')).data);setPeople((await http.get('/people')).data)}useEffect(()=>{load()},[]);async function save(e){e.preventDefault();await http.post('/flights',f);setShow(false);load()}return <><PageTitle eyebrow="TRAVEL" title="Flights" description="Keep proposed and confirmed flight segments in one place." action={<button className="btn primary" onClick={()=>setShow(!show)}><Plus size={16}/> Add flight</button>}/>{show&&<form className="panel form-grid" onSubmit={save}><Field label="Origin"><input required value={f.origin} onChange={e=>setF({...f,origin:e.target.value})}/></Field><Field label="Destination"><input required value={f.destination} onChange={e=>setF({...f,destination:e.target.value})}/></Field><Field label="Flight number"><input value={f.flightNumber} onChange={e=>setF({...f,flightNumber:e.target.value})}/></Field><Field label="Date"><input type="date" value={f.flightDate} onChange={e=>setF({...f,flightDate:e.target.value})}/></Field><Field label="Depart"><input type="time" value={f.departTime} onChange={e=>setF({...f,departTime:e.target.value})}/></Field><Field label="Arrive"><input type="time" value={f.arriveTime} onChange={e=>setF({...f,arriveTime:e.target.value})}/></Field><Field label="Aircraft"><input value={f.aircraft} onChange={e=>setF({...f,aircraft:e.target.value})}/></Field><div className="form-actions span2"><button type="button" className="btn" onClick={()=>setShow(false)}>Cancel</button><button className="btn primary">Save flight</button></div></form>}<div className="table-wrap"><table><thead><tr><th>Route</th><th>Date</th><th>Flight</th><th>Departure</th><th>Arrival</th><th>Aircraft</th><th>Search</th></tr></thead><tbody>{data.map(x=><tr key={x.id}><td>{x.origin} → {x.destination}</td><td>{x.flightDate?new Date(x.flightDate).toLocaleDateString():'TBC'}</td><td>{x.flightNumber||'TBC'}</td><td>{x.departTime||'—'}</td><td>{x.arriveTime||'—'}</td><td>{x.aircraft||'—'}</td><td><a target="_blank" rel="noreferrer" href={`https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${x.origin} to ${x.destination}`)}`}>Google Flights ↗</a></td></tr>)}</tbody></table></div></>}
function Team(){const[people,setPeople]=useState([]),[entries,setEntries]=useState([]),[show,setShow]=useState(false),[f,setF]=useState({personId:'',startDate:'',endDate:'',destination:'',type:'Trip',approval:'Pending',notes:''});async function load(){const[a,b]=await Promise.all([http.get('/people'),http.get('/team-plan')]);setPeople(a.data);setEntries(b.data)}useEffect(()=>{load()},[]);async function save(e){e.preventDefault();await http.post('/team-plan',f);setShow(false);load()}async function approve(id,approval){await http.patch(`/team-plan/${id}/approval`,{approval});load()}return <><PageTitle eyebrow="PEOPLE" title="Team plan" description="Track team travel, tentative plans, remote work and vacation approvals." action={<button className="btn primary" onClick={()=>setShow(!show)}><Plus size={16}/> Add entry</button>}/>{show&&<form className="panel form-grid" onSubmit={save}><Field label="Person"><select required value={f.personId} onChange={e=>setF({...f,personId:e.target.value})}><option value="">Select person</option>{people.map(p=><option value={p.id}>{p.name}</option>)}</select></Field><Field label="Type"><select value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{['Trip','Option','Vacation','Remote'].map(x=><option>{x}</option>)}</select></Field><Field label="From"><input type="date" value={f.startDate} onChange={e=>setF({...f,startDate:e.target.value})}/></Field><Field label="To"><input type="date" value={f.endDate} onChange={e=>setF({...f,endDate:e.target.value})}/></Field><Field label="City / destination"><input value={f.destination} onChange={e=>setF({...f,destination:e.target.value})}/></Field><Field label="Vacation approval"><select value={f.approval} onChange={e=>setF({...f,approval:e.target.value})}><option>Pending</option><option>Approved</option><option>Rejected</option></select></Field><Field label="Notes" wide><textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></Field><div className="form-actions span2"><button type="button" className="btn" onClick={()=>setShow(false)}>Cancel</button><button className="btn primary">Save entry</button></div></form>}<div className="table-wrap"><table><thead><tr><th>Person</th><th>Dates</th><th>Destination</th><th>Type</th><th>Approval</th><th>Notes</th><th>Action</th></tr></thead><tbody>{entries.map(e=><tr key={e.id}><td>{e.person.name}</td><td>{e.startDate?new Date(e.startDate).toLocaleDateString():'TBC'} – {e.endDate?new Date(e.endDate).toLocaleDateString():'TBC'}</td><td>{e.destination||'—'}</td><td>{e.type}</td><td>{e.type==='Vacation'?e.approval||'Pending':'—'}</td><td>{e.notes}</td><td>{e.type==='Vacation'&&<select value={e.approval||'Pending'} onChange={x=>approve(e.id,x.target.value)}><option>Pending</option><option>Approved</option><option>Rejected</option></select>}</td></tr>)}</tbody></table></div></>}
function Directory(){const[data,setData]=useState([]),[f,setF]=useState({city:'',name:'',organization:'',title:'',email:''});async function load(){setData((await http.get('/contacts')).data)}useEffect(()=>{load()},[]);async function save(e){e.preventDefault();await http.post('/contacts',f);setF({city:'',name:'',organization:'',title:'',email:''});load()}async function del(id){if(confirm('Delete this contact?')){await http.delete(`/contacts/${id}`);load()}}const groups=useMemo(()=>data.reduce((a,c)=>((a[c.city]??=[]).push(c),a),{}),[data]);return <><PageTitle eyebrow="RELATIONSHIPS" title="People directory" description="Contacts grouped by city; these contacts can be attached to trip meetings."/><form className="panel form-grid" onSubmit={save}><h3 className="span2">Add contact</h3><Field label="City"><input required value={f.city} onChange={e=>setF({...f,city:e.target.value})}/></Field><Field label="Name"><input required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field><Field label="Organisation"><input value={f.organization} onChange={e=>setF({...f,organization:e.target.value})}/></Field><Field label="Title"><input value={f.title} onChange={e=>setF({...f,title:e.target.value})}/></Field><Field label="Email"><input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></Field><div className="form-actions span2"><button className="btn primary">Add contact</button></div></form>{Object.entries(groups).map(([city,items])=><section className="directory-group" key={city}><h3>{city} <small>{items.length} contacts</small></h3>{items.map(c=><div className="contact-row" key={c.id}><div><b>{c.name}</b><small>{c.organization} {c.title&&'· '+c.title}</small></div><span>{c.email}</span><button className="btn danger" onClick={()=>del(c.id)}>Remove</button></div>)}</section>)}</>}

function CalendarPage() {
  const [entries, setEntries] = useState([]);
  const [people, setPeople] = useState([]);
  const [view, setView] = useState('half-year');
  const [viewDate, setViewDate] = useState(new Date());
  const [personFilter, setPersonFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date();

  function parseDate(value) {
    if (!value) return null;

    const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  }

  function startOfDay(date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function addMonths(date, amount) {
    return new Date(
      date.getFullYear(),
      date.getMonth() + amount,
      1
    );
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function loadCalendar() {
    setLoading(true);
    setError('');

    return Promise.all([
      http.get('/team-plan'),
      http.get('/people')
    ])
      .then(([entriesResponse, peopleResponse]) => {
        setEntries(entriesResponse.data);
        setPeople(peopleResponse.data);
      })
      .catch(error => {
        console.error('Calendar loading error:', error);
        setError('Could not load calendar data. Please refresh.');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCalendar();
  }, []);

  // Generate timeline columns
  function getColumns() {
    const year = viewDate.getFullYear();
    const columns = [];

    if (view === 'half-year') {
      for (let month = 5; month <= 11; month++) {
        const start = new Date(year, month, 1);

        columns.push({
          label: start.toLocaleDateString('en-GB', {
            month: 'short'
          }),
          start,
          end: new Date(year, month + 1, 0)
        });
      }
    }

    if (view === 'quarter') {
      const quarter = Math.floor(viewDate.getMonth() / 3);
      const firstMonth = quarter * 3;

      for (let i = 0; i < 3; i++) {
        const start = new Date(year, firstMonth + i, 1);

        columns.push({
          label: start.toLocaleDateString('en-GB', {
            month: 'short'
          }),
          start,
          end: new Date(year, firstMonth + i + 1, 0)
        });
      }
    }

    if (view === 'month') {
      const first = new Date(
        year,
        viewDate.getMonth(),
        1
      );

      const days = new Date(
        year,
        viewDate.getMonth() + 1,
        0
      ).getDate();

      for (let i = 0; i < days; i++) {
        const date = addDays(first, i);

        columns.push({
          label: String(date.getDate()),
          start: date,
          end: date
        });
      }
    }

    if (view === 'week') {
      const first = startOfDay(viewDate);
      const weekday = (first.getDay() + 6) % 7;
      const monday = addDays(first, -weekday);

      for (let i = 0; i < 7; i++) {
        const date = addDays(monday, i);

        columns.push({
          label: date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric'
          }),
          start: date,
          end: date
        });
      }
    }

    return columns;
  }

  const columns = getColumns();

  function navigate(direction) {
    setSelectedEntry(null);

    if (view === 'half-year') {
      setViewDate(current =>
        addMonths(current, direction * 6)
      );
    } else if (view === 'quarter') {
      setViewDate(current =>
        addMonths(current, direction * 3)
      );
    } else if (view === 'month') {
      setViewDate(current =>
        addMonths(current, direction)
      );
    } else {
      setViewDate(current =>
        addDays(current, direction * 7)
      );
    }
  }

  function getPeriodLabel() {
    if (view === 'half-year') {
      return `June – December ${viewDate.getFullYear()}`;
    }

    if (view === 'quarter') {
      const quarter = Math.floor(viewDate.getMonth() / 3) + 1;
      return `Q${quarter} ${viewDate.getFullYear()}`;
    }

    if (view === 'month') {
      return viewDate.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric'
      });
    }

    const weekday = (viewDate.getDay() + 6) % 7;
    const monday = addDays(viewDate, -weekday);
    const sunday = addDays(monday, 6);

    return `${formatDate(monday)} – ${formatDate(sunday)}`;
  }

  const filteredPeople = people.filter(person =>
    personFilter === 'all' || person.id === personFilter
  );

  function getPersonEntries(person, column) {
    return entries.filter(entry => {
      if (entry.personId !== person.id) return false;

      const start = parseDate(entry.startDate);
      const end = parseDate(entry.endDate) || start;

      if (!start) return false;

      return start <= column.end && end >= column.start;
    });
  }

  function isToday(column) {
    const current = startOfDay(today);

    return current >= startOfDay(column.start) &&
      current <= startOfDay(column.end);
  }

  function changeView(nextView) {
    setView(nextView);
    setSelectedEntry(null);
  }

  return (
    <>
      <PageTitle
        eyebrow="SCHEDULE"
        title="Team calendar"
        description="Team availability and executive travel schedule."
      />

      <div className="calendar-toolbar">
        <div className="calendar-navigation">
          <button
            className="btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <button
            className="btn"
            onClick={() => setViewDate(new Date())}
          >
            Today
          </button>

          <button
            className="btn"
            onClick={() => navigate(1)}
          >
            →
          </button>

          <h3>{getPeriodLabel()}</h3>
        </div>

        <div className="calendar-filters">
          <select
            value={personFilter}
            onChange={e => setPersonFilter(e.target.value)}
          >
            <option value="all">All team members</option>

            {people.map(person => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>

          <div className="calendar-views">
            {[
              ['half-year', 'Half-year'],
              ['quarter', 'Quarter'],
              ['month', 'Month'],
              ['week', 'Week']
            ].map(([value, label]) => (
              <button
                key={value}
                className={
                  view === value
                    ? 'btn primary'
                    : 'btn'
                }
                onClick={() => changeView(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="calendar-legend">
        <span><i className="legend-trip" /> Trip</span>
        <span><i className="legend-option" /> Option</span>
        <span><i className="legend-vacation" /> Vacation</span>
        <span><i className="legend-remote" /> Remote</span>
      </div>

      {loading && (
        <div className="panel">Loading calendar...</div>
      )}

      {error && (
        <div className="panel">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="calendar-scroll">
            <div
              className="calendar-table calendar-dynamic"
              style={{
                '--calendar-columns': columns.length
              }}
            >
              <div className="calendar-head">
                <b className="calendar-person-heading">
                  Team member
                </b>

                {columns.map((column, index) => (
                  <b
                    key={index}
                    className={
                      isToday(column) ? 'today-column' : ''
                    }
                  >
                    {column.label}
                  </b>
                ))}
              </div>

              {filteredPeople.map(person => (
                <div
                  className="calendar-row"
                  key={person.id}
                >
                  <b className="calendar-person">
                    {person.name}
                  </b>

                  {columns.map((column, index) => {
                    const cellEntries =
                      getPersonEntries(person, column);

                    return (
                      <div
                        key={index}
                        className={
                          'calendar-cell ' +
                          (isToday(column) ? 'today-column' : '')
                        }
                      >
                        {cellEntries.map(entry => (
                          <button
                            key={entry.id}
                            type="button"
                            className={
                              'calendar-pill ' +
                              String(entry.type || 'Option').toLowerCase()
                            }
                            title={`${entry.type}: ${entry.destination || 'No destination'}`}
                            onClick={() => setSelectedEntry(entry)}
                          >
                            {entry.type}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}

              {!filteredPeople.length && (
                <div className="calendar-empty">
                  No team members found.
                </div>
              )}
            </div>
          </div>

          <p className="muted note">
            Select any coloured entry to view its details.
            The highlighted column indicates today when it
            falls within the selected period.
          </p>
        </>
      )}

      {selectedEntry && (
        <div className="panel calendar-detail">
          <div className="calendar-detail-header">
            <h3>Calendar entry details</h3>

            <button
              className="btn"
              onClick={() => setSelectedEntry(null)}
            >
              Close
            </button>
          </div>

          <h4>{selectedEntry.person?.name || 'Team member'}</h4>

          <p>
            <b>Type:</b> {selectedEntry.type}
          </p>

          <p>
            <b>Destination:</b>{' '}
            {selectedEntry.destination || 'Not specified'}
          </p>

          <p>
            <b>From:</b>{' '}
            {selectedEntry.startDate
              ? formatDate(parseDate(selectedEntry.startDate))
              : 'Not specified'}
          </p>

          <p>
            <b>To:</b>{' '}
            {selectedEntry.endDate
              ? formatDate(parseDate(selectedEntry.endDate))
              : 'Not specified'}
          </p>

          <p>
            <b>Approval:</b>{' '}
            {selectedEntry.approval || 'Pending'}
          </p>

          <p>
            <b>Notes:</b>{' '}
            {selectedEntry.notes || 'No additional notes'}
          </p>
        </div>
      )}
    </>
  );
}
function OnePagers(){const[trips,setTrips]=useState([]),[people,setPeople]=useState([]),[person,setPerson]=useState('Alex Morgan');useEffect(()=>{Promise.all([http.get('/trips'),http.get('/people')]).then(([a,b])=>{setTrips(a.data);setPeople(b.data);if(b.data[0])setPerson(b.data[0].name)})},[]);const relevant=trips.filter(t=>t.meetings?.some(m=>m.attendees.includes(person))||person==='Alex Morgan');return <><PageTitle eyebrow="BRIEFING" title="Individual one-pagers" description="Printable itinerary and meeting briefing for each team member." action={<button className="btn" onClick={()=>window.print()}><Printer size={16}/> Print / PDF</button>}/><div className="panel"><Field label="Select team member"><select value={person} onChange={e=>setPerson(e.target.value)}>{people.map(p=><option>{p.name}</option>)}</select></Field></div><div className="print-sheet"><h2>{person} — Travel briefing</h2><p>MGH Executive Office · Confidential</p>{relevant.map(t=><div className="brief-trip" key={t.id}><h3>{t.destination}</h3><p>{t.startDate?new Date(t.startDate).toLocaleDateString():'Date TBC'} – {t.endDate?new Date(t.endDate).toLocaleDateString():'Date TBC'} · {t.project}</p><p>Hotel: {t.hotel||'TBC'} · Transport: {t.transport||'TBC'}</p><h4>Meetings</h4>{t.meetings?.filter(m=>m.attendees.includes(person)||person==='Alex Morgan').map(m=><div className="meeting-row"><b>{m.meetingTime||'Time TBC'} — {m.personName}</b><p>{m.agenda}</p>{m.materials?.map(x=><small>Prepare: {x.description} (Owner: {x.owner||'TBC'})</small>)}</div>)}</div>)}</div></>}
createRoot(document.getElementById('root')).render(<App/>);
