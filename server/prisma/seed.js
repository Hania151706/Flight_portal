import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('MGH-Demo-2026!', 12);
  await prisma.user.upsert({where:{email:'admin@mgh.local'},update:{},create:{name:'Grace Hall',email:'admin@mgh.local',passwordHash,role:'ADMIN'}});
  const names=['Alex Morgan','Jamie Morgan','Sam Baker','Robin Garcia','Wesley Stone','Kevin Marks','Grace Hall','Pierre'];
  for (const name of names) await prisma.person.upsert({where:{name},update:{},create:{name}});
  const tripCount=await prisma.trip.count();
  if (!tripCount) {
    const trip=await prisma.trip.create({data:{project:'Northwind (Czechia)',entity:'Northwind (JV)',destination:'Prague, Czechia',origin:'Vienna, Austria',startDate:new Date('2026-06-23'),endDate:new Date('2026-06-25'),status:'Confirmed',hotel:'Riverside Grand',transport:'Car / driver'}});
    const c1=await prisma.contact.create({data:{city:'Prague, Czechia',name:'Karel Novak',organization:'Northwind',title:'Group Finance & Accounting Director'}});
    const c2=await prisma.contact.create({data:{city:'Prague, Czechia',name:'Elena Vargova',organization:'VLTAVA Tax & Legal',title:'Managing Partner'}});
    await prisma.meeting.create({data:{tripId:trip.id,contactId:c1.id,personName:'Karel Novak',sortOrder:1,priority:'High',status:'Confirmed',meetingTime:'10:00',agenda:'Review Northwind financials and align on valuation / NBO basis.',attendees:['Jamie Morgan','Kevin Marks'],materials:{create:[{description:'Northwind financials review + valuation / NBO basis',owner:'Sam Baker'}]}}});
    await prisma.meeting.create({data:{tripId:trip.id,contactId:c2.id,personName:'Elena Vargova',sortOrder:2,priority:'High',status:'Confirmed',meetingTime:'13:00',agenda:'Discuss JV structure options; confirm NDA.',attendees:['Jamie Morgan'],materials:{create:[{description:'International JV structure options',owner:'Jamie Morgan'},{description:'Signed NDA copy',owner:'Grace Hall'}]}}});
    const people=await prisma.person.findMany();
    const byName=Object.fromEntries(people.map(p=>[p.name,p.id]));
    await prisma.teamPlanEntry.createMany({data:[{personId:byName['Alex Morgan'],startDate:new Date('2026-06-23'),endDate:new Date('2026-06-25'),destination:'Prague, Czechia',type:'Trip',notes:'Northwind JV meetings.'},{personId:byName['Wesley Stone'],startDate:new Date('2026-07-04'),endDate:new Date('2026-07-11'),type:'Vacation',approval:'Pending',notes:'Away on vacation.'},{personId:byName['Jamie Morgan'],startDate:new Date('2026-06-23'),endDate:new Date('2026-06-25'),destination:'Prague, Czechia',type:'Trip',notes:'Travelling from Singapore.'}]});
    await prisma.flight.createMany({data:[{origin:'Vienna, Austria',destination:'Prague, Czechia',flightNumber:'TransEuro TE451',flightDate:new Date('2026-06-23'),departTime:'17:35',arriveTime:'19:30',aircraft:'A320neo',status:'Proposed'},{origin:'Prague, Czechia',destination:'Vienna, Austria',flightNumber:'TransEuro TE452',flightDate:new Date('2026-06-25'),departTime:'20:30',arriveTime:'22:25',aircraft:'A320neo',status:'Proposed'}]});
  }
}
main().finally(()=>prisma.$disconnect());
