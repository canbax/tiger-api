import express from 'express';
import got from 'got';
import bodyParser from 'body-parser';

const app = express();

// allow every browser to get response from this server, this MUST BE AT THE TOP
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());

function errResponseFn(err, res) {
  res.write('Error: ', JSON.stringify(err));
  res.end();
}

// get token 
app.post('/requesttoken', async (req, res) => {
  try {
    const { body } = await got.post(req.body.url + '/requesttoken',
      {
        body: JSON.stringify({ graph: req.body.graph }),
        username: req.body.username,
        password: req.body.password
      });
    res.write(body);
    res.end();
  } catch (err) {
    errResponseFn(err, res);
  }
});

// get echo
app.post('/echo', async (req, res) => {
  try {
    const { body } = await got(req.body.url + '/echo', {
      headers: {
        'Authorization': 'Bearer ' + req.body.token,
      }
    });
    res.write(body);
    res.end();
  } catch (err) {
    errResponseFn(err, res);
  }
});

app.post('/gsql', async (req, res) => {
  try {
    const url = req.body.url.slice(0, -4) + '14240/gsqlserver/interpreted_query'
    const { body } = await got.post(url, {
      body: req.body.q,
      username: req.body.username,
      password: req.body.password
    });
    res.write(body);
    res.end();
  } catch (err) {
    errResponseFn(err, res);
  }
});

app.post('/samplenodes', async (req, res) => {
  try {
    const cnt = req.body.cnt;
    const type = req.body.type;
    const graphName = req.body.graphName;
    const u = req.body.url;
    const token = req.body.token;

    let nodes = [];
    const url = `${u}/graph/${graphName}/vertices/${type}?_api=v2&limit=${cnt}`;
    const { body } = await got(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
      }
    });
    let res2 = JSON.parse(body);
    nodes = nodes.concat(res2.results);

    res.write(JSON.stringify({ nodes: nodes, edges: [] }));
    res.end();
  } catch (err) {
    errResponseFn(err, res);
  }
});

app.post('/edges4nodes', async (req, res) => {
  try {
    const cnt = req.body.cnt;
    const id = req.body.id;
    const src_type = req.body.src_type;
    const graphName = req.body.graphName;
    const u = req.body.url;
    const token = req.body.token;

    let edges = [];
    const url = `${u}/graph/${graphName}/edges/${src_type}/${id}?_api=v2&limit=${cnt}`;
    const { body } = await got(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
      }
    });
    let res2 = JSON.parse(body);
    edges = edges.concat(res2.results);

    res.write(JSON.stringify({ nodes: [], edges: edges }));
    res.end();
  } catch (err) {
    errResponseFn(err, res);
  }
});

app.post('/nodes4edges', async (req, res) => {
  try {
    const cnt = req.body.cnt;
    const type = req.body.type;
    const id = req.body.id;
    const graphName = req.body.graphName;
    const u = req.body.url;
    const token = req.body.token;

    let nodes = [];
    const url = `${u}/graph/${graphName}/vertices/${type}/${id}?_api=v2&limit=${cnt}`;
    const { body } = await got(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
      }
    });
    let res2 = JSON.parse(body);
    nodes = nodes.concat(res2.results);

    res.write(JSON.stringify({ nodes: nodes, edges: [] }));
    res.end();
  } catch (err) {
    errResponseFn(err, res);
  }
});

app.post('/query', async (req, res) => {
  try {
    const q = req.body.query;
    const params = req.body.params;
    const graphName = req.body.graphName;
    const u = req.body.url;
    const token = req.body.token;

    let s = '';
    for (let i = 0; i < params.length; i++) {
      s += Object.keys(params[i])[0] + '=' + Object.values(params[i])[0] + '&';
    }
    s = s.slice(0, -1);
    let nodes = [];
    const url = u + `/query/${graphName}/${q}?${s}`;
    const { body } = await got(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
      }
    });
    let res2 = JSON.parse(body);
    nodes = nodes.concat(res2.results);

    res.write(JSON.stringify({ nodes: nodes, edges: [] }));
    res.end();
  } catch (err) {
    errResponseFn(err, res);
  }
});

app.post('/endpoints', async (req, res) => {
  try {
    const url = req.body.url;
    const token = req.body.token;

    const { body } = await got(url + '/endpoints ', {
      headers: {
        'Authorization': 'Bearer ' + token,
      }
    });
    res.write(body);
    res.end();
  } catch (err) {
    errResponseFn(err, res);
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log('proxy server on 9000'));