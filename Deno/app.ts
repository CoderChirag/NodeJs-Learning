const text = 'This is a test = and it should be stored in a file!';

const encoder = new TextEncoder();
const data = encoder.encode(text);

Deno.writeFile('test.txt', data).then(() => {
	console.log('Wrote to file!');
});
