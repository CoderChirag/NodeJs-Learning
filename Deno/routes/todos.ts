import { Router } from 'https://deno.land/x/oak@v10.6.0/mod.ts';

const router = new Router();

interface Todo {
	id: string;
	text: string;
}

let todos: Todo[] = [];

router.get('/', ctx => {
	ctx.response.body = { todos };
});

router.post('/todo', async ctx => {
	const body = ctx.request.body();
	const data = await body.value;
	const newTodo: Todo = {
		id: Date.now().toString(),
		text: data.text,
	};
	todos.push(newTodo);
	ctx.response.body = { message: 'Created todo!', todo: newTodo, todos };
});
router.put('/todo/:todoId', async ctx => {
	const tid = ctx.params.todoId;
	const body = ctx.request.body();
	const data = await body.value;
	const todoIndex = todos.findIndex(todo => todo.id === tid);
	if (todoIndex === -1) {
		ctx.response.body = { error: 'Todo not found' };
	}
	todos[todoIndex] = {
		id: todos[todoIndex].id,
		text: data.text,
	};
	ctx.response.body = {
		message: 'Todo Updated',
		todo: todos[todoIndex],
		todos,
	};
});
router.delete('/todo/:todoId', ctx => {
	const params = ctx.params;
	todos = todos.filter(todoItem => todoItem.id !== params.todoId);
	ctx.response.body = { message: 'Todo Deleted', todos };
});

export default router;
