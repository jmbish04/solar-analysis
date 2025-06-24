import { execute, queryDB } from '../db/client';

function dateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

async function fetchYearData(env: Env, year: number): Promise<number[]> {
  const url = `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${env.PVWATTS_API_KEY}&lat=0&lon=0&system_capacity=1&azimuth=180&tilt=0&array_type=1&module_type=1&losses=10&timeframe=hourly&year=${year}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('PVWatts request failed');
  const data = await resp.json<any>();
  return data.outputs.ac as number[];
}

export async function handleBackfillPvwatts(request: Request, env: Env): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');
  if (!startStr || !endStr) {
    return new Response('missing start or end', { status: 400 });
  }
  const start = new Date(startStr);
  const end = new Date(endStr);
  const dates = dateRange(start, end);
  let inserted = 0;

  const years = new Set(dates.map(d => d.slice(0,4)));
  const yearData: Record<string, number[]> = {};
  for (const y of years) {
    yearData[y] = await fetchYearData(env, parseInt(y));
  }

  for (const date of dates) {
    const exist = await queryDB(env.DB, 'SELECT 1 FROM pvwatts WHERE date=? LIMIT 1', [date]);
    if (exist.length) continue;
    const year = date.slice(0,4);
    const yearArray = yearData[year];
    const idx = Math.floor((new Date(date).valueOf() - new Date(`${year}-01-01`).valueOf()) / 86400000);
    const hours = yearArray.slice(idx*24, idx*24+24);
    const dayAc = hours.reduce((a,b)=>a+(b||0),0);
    await execute(env.DB, 'INSERT INTO pvwatts (date, ac_wh) VALUES (?, ?)', [date, dayAc]);
    for (let h=0; h<24; h++) {
      const hour = h.toString().padStart(2,'0');
      await execute(env.DB, 'INSERT INTO pvwatts_hourly (date, hour, ac_wh) VALUES (?, ?, ?)', [date, hour, hours[h] || 0]);
    }
    inserted++;
  }

  return new Response(JSON.stringify({ inserted }), { headers: { 'Content-Type': 'application/json' } });
}
