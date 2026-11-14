import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
const app=express(), prisma=new PrismaClient();
app.use(helmet()); app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'})); app.use(express.json({limit:'2mb'}));
const SECRET=process.env.JWT_SECRET||'development-only-secret';
const auth=(req,res,next)=>{const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');try{req.user=jwt.verify(token,SECRET);next();}catch{return res.status(401).json({error:'Authentication required'});}};
app.get('/api/health',(_,res)=>res.json({status:'ok'}));
app.post('/api/auth/login',async(req,res)=>{const parsed=z.object({email:z.string().email(),password:z.string().min(1)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Valid email and password required'});const user=await prisma.user.findUnique({where:{email:parsed.data.email}});if(!user||!await bcrypt.compare(parsed.data.password,user.passwordHash))return res.status(401).json({error:'Invalid credentials'});const token=jwt.sign({sub:user.id,name:user.name,role:user.role},SECRET,{expiresIn:'8h'});res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role}});});
app.use('/api',auth);

app.get('/api/dashboard', async (_, res) => {
  const [trips, meetings, teamEntries] = await Promise.all([
    prisma.trip.findMany({
      orderBy: { startDate: 'asc' }
    }),
    prisma.meeting.count(),
    prisma.teamPlanEntry.findMany()
  ]);

  const now = new Date();

  const upcoming = trips.filter(
    t => !t.startDate || t.startDate >= now
  );

  const days = trips.reduce((n, t) => {
    return n + (
      t.startDate && t.endDate
        ? Math.max(
            1,
            Math.ceil(
              (t.endDate - t.startDate) / 86400000
            ) + 1
          )
        : 0
    );
  }, 0);

  res.json({
    totalTrips: trips.length,
    upcomingTrips: upcoming.length,
    nextDeparture: upcoming[0] || null,
    totalTravelDays: days,
    meetingsPlanned: meetings,
    teamEntries: teamEntries.length
  });
});

app.get('/api/trips',async(_,res)=>res.json(await prisma.trip.findMany({include:{meetings:{include:{materials:true},orderBy:{sortOrder:'asc'}},flights:true},orderBy:{createdAt:'desc'}})));
// UPDATE AN EXISTING TRIP
app.patch('/api/trips/:id', async (req, res) => {
  try {
    const schema = z.object({
      destination: z.string().min(2).optional(),
      project: z.string().optional(),
      entity: z.string().optional(),
      origin: z.string().optional(),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      status: z.string().optional(),
      hotel: z.string().optional(),
      transport: z.string().optional(),
      notes: z.string().optional()
    });

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten()
      });
    }

    const existing = await prisma.trip.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const d = parsed.data;

    const startDate = d.startDate === undefined
      ? existing.startDate
      : d.startDate ? new Date(d.startDate) : null;

    const endDate = d.endDate === undefined
      ? existing.endDate
      : d.endDate ? new Date(d.endDate) : null;

    if (startDate && endDate && endDate < startDate) {
      return res.status(400).json({
        error: 'End date must be on or after start date'
      });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        ...d,
        startDate,
        endDate
      }
    });

    res.json(updatedTrip);

  } catch (error) {
    console.error('Trip update error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(500).json({ error: 'Could not update trip' });
  }
});
// DELETE AN EXISTING TRIP
app.delete('/api/trips/:id', async (req, res) => {
  try {
    const existingTrip = await prisma.trip.findUnique({
      where: { id: req.params.id }
    });

    if (!existingTrip) {
      return res.status(404).json({
        error: 'Trip not found'
      });
    }

    await prisma.trip.delete({
      where: { id: req.params.id }
    });

    return res.status(200).json({
      message: 'Trip deleted successfully'
    });

  } catch (error) {
    console.error('Trip deletion error:', error);

    return res.status(500).json({
      error: 'Could not delete trip'
    });
  }
});
app.post('/api/trips/:id/meetings',async(req,res)=>{const s=z.object({personName:z.string().min(1),project:z.string().optional(),entity:z.string().optional(),sortOrder:z.number().int().optional(),priority:z.string().optional(),status:z.string().optional(),meetingTime:z.string().optional(),agenda:z.string().optional(),attendees:z.array(z.string()).optional()}).safeParse(req.body);if(!s.success)return res.status(400).json({error:s.error.flatten()});res.status(201).json(await prisma.meeting.create({data:{...s.data,tripId:req.params.id}}));});
app.get('/api/people',async(_,res)=>res.json(await prisma.person.findMany({include:{teamEntries:true},orderBy:{name:'asc'}})));
app.post('/api/people',async(req,res)=>{const s=z.object({name:z.string().min(2),title:z.string().optional(),function:z.string().optional()}).safeParse(req.body);if(!s.success)return res.status(400).json({error:s.error.flatten()});res.status(201).json(await prisma.person.create({data:s.data}));});
app.get('/api/team-plan',async(_,res)=>res.json(await prisma.teamPlanEntry.findMany({include:{person:true},orderBy:{startDate:'asc'}})));
app.post('/api/team-plan',async(req,res)=>{const s=z.object({personId:z.string(),startDate:z.string().optional(),endDate:z.string().optional(),destination:z.string().optional(),type:z.enum(['Trip','Option','Vacation','Remote']),approval:z.enum(['Pending','Approved','Rejected']).optional(),notes:z.string().optional()}).safeParse(req.body);if(!s.success)return res.status(400).json({error:s.error.flatten()});const d=s.data;if(d.startDate&&d.endDate&&d.endDate<d.startDate)return res.status(400).json({error:'End date must be on or after start date'});res.status(201).json(await prisma.teamPlanEntry.create({data:{...d,startDate:d.startDate?new Date(d.startDate):null,endDate:d.endDate?new Date(d.endDate):null}}));});
app.patch('/api/team-plan/:id/approval',async(req,res)=>{const s=z.object({approval:z.enum(['Pending','Approved','Rejected'])}).safeParse(req.body);if(!s.success)return res.status(400).json({error:s.error.flatten()});res.json(await prisma.teamPlanEntry.update({where:{id:req.params.id},data:{approval:s.data.approval}}));});
app.get('/api/contacts',async(req,res)=>{const city=req.query.city;res.json(await prisma.contact.findMany({where:city?{city:String(city)}:{},orderBy:[{city:'asc'},{name:'asc'}]}));});
app.post('/api/contacts',async(req,res)=>{const s=z.object({city:z.string().min(2),name:z.string().min(2),organization:z.string().optional(),title:z.string().optional(),email:z.string().email().optional()}).safeParse(req.body);if(!s.success)return res.status(400).json({error:s.error.flatten()});res.status(201).json(await prisma.contact.create({data:s.data}));});
app.delete('/api/contacts/:id',async(req,res)=>{await prisma.contact.delete({where:{id:req.params.id}});res.status(204).end();});
app.get('/api/flights',async(_,res)=>res.json(await prisma.flight.findMany({include:{person:true,trip:true},orderBy:{flightDate:'asc'}})));
app.post('/api/flights',async(req,res)=>{const s=z.object({origin:z.string().min(2),destination:z.string().min(2),flightNumber:z.string().optional(),flightDate:z.string().optional(),departTime:z.string().optional(),arriveTime:z.string().optional(),aircraft:z.string().optional(),status:z.string().optional(),personId:z.string().optional(),tripId:z.string().optional()}).safeParse(req.body);if(!s.success)return res.status(400).json({error:s.error.flatten()});const d=s.data;res.status(201).json(await prisma.flight.create({data:{...d,flightDate:d.flightDate?new Date(d.flightDate):null}}));});
app.get('/api/export',async(_,res)=>{const data={people:await prisma.person.findMany(),trips:await prisma.trip.findMany({include:{meetings:{include:{materials:true}},flights:true}}),teamPlan:await prisma.teamPlanEntry.findMany({include:{person:true}}),contacts:await prisma.contact.findMany(),flights:await prisma.flight.findMany()};res.setHeader('Content-Disposition','attachment; filename="mgh-portal-export.json"');res.json({exportedAt:new Date().toISOString(),version:1,data});});
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Unexpected server error'});});
const port=Number(process.env.PORT||4000);app.listen(port,()=>console.log(`MGH API listening on ${port}`));
