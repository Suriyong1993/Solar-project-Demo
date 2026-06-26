const http = require('http');

http.get('http://localhost:8080/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    // extract error message if any
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
