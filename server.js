const express = require('express');
const path = require('path');
const connection = require('./db/connection');
const PORT = 4000;


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  connection.query('SELECT * FROM task', (err, tasks) => {
    if (err) {
      console.error('Error retrieving tasks:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.render('home', { tasks });
  });
});
app.get('/adicionar', (req, res) => {
    res.render('adicionar');
  });
  
  app.post('/adicionar', (req, res) => {
    const { title, description } = req.body;
    connection.query('INSERT INTO task (title, description) VALUES (?, ?)', [title, description], (err) => {
      if (err) {
        console.error('Error adding task:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.redirect('/');
    });
  });
  
  app.get('/update/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM task WHERE id = ?', [id], (err, tasks) => {
      if (err) {
        console.error('Error fetching task:', err);
        return res.status(500).send('Internal Server Error');
      }
      if (tasks.length === 0) {
        return res.status(404).send('Task not found');
      }
      res.render('update', { task: tasks[0] });
    });
  });
  app.post('/update/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed_at } = req.body;
    connection.query(
      'UPDATE task SET title = ?, description = ?, completed_at = ? WHERE id = ?',
      [title, description, completed_at, id],
      (err) => {
        if (err) {
          console.error('Error updating task:', err);
          return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
      }
    );
  });
  
  app.post('/delete/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM task WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting task:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.redirect('/');
    });
  });
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});