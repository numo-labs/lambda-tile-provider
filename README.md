# Lambda Tile Provider
 [ ![Codeship Status for numo-labs/lambda-tile-provider](https://codeship.com/projects/a7474ec0-e85f-0133-675c-46bb3aa6b241/status?branch=master)](https://codeship.com/projects/147193)
 [![codecov](https://codecov.io/gh/numo-labs/lambda-tile-provider/branch/master/graph/badge.svg)](https://codecov.io/gh/numo-labs/lambda-tile-provider)
 [![Dependency Status](https://david-dm.org/numo-labs/lambda-tile-provider.svg)](https://david-dm.org/numo-labs/lambda-tile-provider)
 [![devDependency Status](https://david-dm.org/numo-labs/lambda-tile-provider/dev-status.svg)](https://david-dm.org/numo-labs/lambda-tile-provider#info=devDependencies)

## What?
A lambda function that listens to an SNS topic, checks the requested tile ids and adds the matching content to a corresponding (DynamoDB) search bucket.

## How?
The lambda will start by extracting the **tile ids** from the event object. (_See the event section_)<br/>
Afterwards it will fetch the content for those ids from an **S3 bucket**.<br/>
_If the content is not found an error will be logged but the process will **continue** for
all the successfully found tiles._

The results (tiles and their content) are Pushed to a websocket and s3.

## Event
The incoming event is the same as the schema from [lambda-search-request-handler](https://github.com/numo-labs/lambda-search-request-handler/tree/master/schema).

We Will have the tiles available in the content object.
The tile object will have following format:

```js
{
  "content": {
    "tiles": ['tile:article.dk.10'] // A list of tile ids
  }
}
```

## Environment variables needed to run the integration tests locally

Look at the codeship settings to get the values for these variables. https://codeship.com/projects/147193/configure_environment

Look at [.env.example](.env.example)
