import { handleUploadPgeUsage } from './services/usageUpload';
import { handleUploadSolarTest } from './services/solarTestUpload';
import { handleBackfillPvwatts } from './services/pvwattsBackfill';
import { handleBackfillSunrise } from './services/sunriseBackfill';
import { handleNemAnalysis } from './services/nemAnalysis';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/upload/pge_usage') {
      return handleUploadPgeUsage(request, env);
    }
    if (request.method === 'POST' && url.pathname === '/upload/solar_test') {
      return handleUploadSolarTest(request, env);
    }
    if (request.method === 'POST' && url.pathname.startsWith('/backfill/pvwatts')) {
      return handleBackfillPvwatts(request, env);
    }
    if (request.method === 'POST' && url.pathname.startsWith('/backfill/sunrise_sunset')) {
      return handleBackfillSunrise(request, env);
    }
    if (request.method === 'GET' && url.pathname.startsWith('/analysis/nem2vnem3')) {
      return handleNemAnalysis(request, env);
    }
    return new Response('Not Found', { status: 404 });
  }
} satisfies ExportedHandler<Env>;
