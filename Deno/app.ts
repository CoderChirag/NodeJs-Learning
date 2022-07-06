import { Application } from 'https://deno.land/x/oak@v10.6.0/mod.ts';

import todosRoutes from './routes/todos.ts';

const app = new Application();

app.use(todosRoutes.routes());
app.use(todosRoutes.allowedMethods());

await app.listen({ port: 3000 });
