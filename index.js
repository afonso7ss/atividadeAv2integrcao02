const mysql = require('./database/connection'); 
const express = require('express');
const csv = require('csv-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.set('view engine', 'ejs');

const upload = multer({ dest: 'upload/' });


app.get('/', (req, res) => {
  res.render('home'); 
});

app.post('/upload', upload.single('file'), (req, res) => {
  const filepath = req.file.path;

  const results = [];

  fs.createReadStream(filepath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      fs.unlinkSync(filepath); 

      const sql = 'INSERT INTO tasks (nome, descricao, prazo, status) VALUES ?';
      const values = results.map(item => [item.nome, item.descricao, item.prazo, item.status]);

      mysql.query(sql, [values], (err) => {
        if (err) {
          console.error('Erro ao inserir dados no banco:', err);
          res.status(500).send('Erro ao inserir dados no banco.');
          return;
        }
        res.redirect('/');
      });
    });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000...');
});
