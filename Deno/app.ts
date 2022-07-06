import { serve } from 'https://deno.land/std@0.147.0/http/server.ts';

const requestHandler = (req: Request): Response => {
	console.log(req);
	return new Response('Hello World!');
};

serve(requestHandler, { port: 3000 });
