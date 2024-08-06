import express from 'express';
const app = express();

const PORT: number = 3000;

app.get('/', (req,res) => {
    res.send('Hello from server');
})

app.get('/contact', (req,res) => {
    res.send('contact us now!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT}`);
})