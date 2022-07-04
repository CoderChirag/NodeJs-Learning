"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
let todos = [];
const router = (0, express_1.Router)();
router.get('/', (req, res, next) => {
    res.status(200).json({ todos: todos });
});
router.post('/todo', (req, res, next) => {
    const newTodo = {
        id: Date.now().toString(),
        text: req.body.text,
    };
    todos.push(newTodo);
    res.status(201).json({ message: 'Todo Added', todo: newTodo, todos });
});
router.put('/todo/:todoId', (req, res, next) => {
    const tid = req.params.todoId;
    const todoIndex = todos.findIndex(todo => todo.id === tid);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    todos[todoIndex] = {
        id: todos[todoIndex].id,
        text: req.body.text,
    };
    return res.status(200).json({
        message: 'Todo Updated',
        todo: todos[todoIndex],
        todos,
    });
});
router.delete('/todo/:todoId', (req, res, next) => {
    console.log(req.params.todoId);
    todos = todos.filter(todoItem => todoItem.id !== req.params.todoId);
    console.log(todos);
    res.status(200).json({ message: 'Todo Deleted', todos });
});
exports.default = router;
