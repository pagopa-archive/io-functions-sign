# io-functions-sign ✍️

## <a name="installation-and-usage"></a>Installation and Usage

Prerequisites:
* [Node.js](https://nodejs.org/) (`>= 16.0.0`)
* [npm](https://www.npmjs.com) (`8.x`)

Install dependencies using `npm`

```sh
npm install
```

And create the "local.settings.json" file with the following content

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

Now you can build the TypeScript sources using

```sh
npm run build
```


