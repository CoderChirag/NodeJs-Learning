import { Router } from 'express';

import { Todo } from '../models/todo';

type RequestBody = { text: string };
type RequestParams = { todoId: string };

let todos: Todo[] = [];

const router = Router();

router.get('/', (req, res, next) => {
	res.status(200).json({ todos: todos });
});

router.post('/todo', (req, res, next) => {
	const body = req.body as RequestBody;
	const newTodo: Todo = {
		id: Date.now().toString(),
		text: body.text,
	};

	todos.push(newTodo);
	res.status(201).json({ message: 'Todo Added', todo: newTodo, todos });
});

router.put('/todo/:todoId', (req, res, next) => {
	const params = req.params as RequestParams;
	const tid = params.todoId;
	const body = req.body as RequestBody;
	const todoIndex = todos.findIndex(todo => todo.id === tid);
	if (todoIndex === -1) {
		return res.status(404).json({ error: 'Todo not found' });
	}
	todos[todoIndex] = {
		id: todos[todoIndex].id,
		text: body.text,
	};
	return res.status(200).json({
		message: 'Todo Updated',
		todo: todos[todoIndex],
		todos,
	});
});

router.delete('/todo/:todoId', (req, res, next) => {
	const params = req.params as RequestParams;
	todos = todos.filter(todoItem => todoItem.id !== params.todoId);
	console.log(todos);
	res.status(200).json({ message: 'Todo Deleted', todos });
});

export default router;
