const express = require('express');
const app = express();
const port = 3000;

const types = require('./routes/types');
const parties = require('./routes/parties');

app.route('/api/types', types);
app.route('/api/parties', parties);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
