const fs = require('fs'); // file system for IO of file
const http = require('http');
const url = require('url');

const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

////////////////////////////////////////////////////////////////////
/////////////FILES
//Blocking, synchronous way
/* const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);
const textOut = `This is what we know about avocado: ${textIn}. \nCreated on ${Date.now()} `;

fs.writeFileSync("./txt/output.text", textOut);
console.log("File written");

//Non-Blocking, Asynchronous way
fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  if (err) {
    return console.log("ERROR!");
  }
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);
      fs.writeFile(".txt/final.txt", `${data2} \n ${data3}`, "utf-8", (err) => {
        console.log("Your file has been written");
      });
    });
  });
});
console.log("Will read file"); */

///////////////////////////////////////////////////////
//////SERVER

//These readFileSync is happening synchronously because it is called once application starts
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  //Overview Page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);
  }

  //Product Page
  else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }
  // API Call
  else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json',
    });
    res.end(data);
  }
  //Not Found
  else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-header': 'Hello World',
    });
    res.end('<h1>Page Not Found!</h1>');
  }
});
//Start Server
server.listen(8181, '127.0.0.1', () => {
  console.log('Listening to request on port 8181');
});
