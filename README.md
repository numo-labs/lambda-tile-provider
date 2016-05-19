# Lambda Tile Provider
 [ ![Codeship Status for numo-labs/lambda-tile-provider](https://codeship.com/projects/a7474ec0-e85f-0133-675c-46bb3aa6b241/status?branch=master)](https://codeship.com/projects/147193)

## What?
A lambda function that listens to an SNS topic, checks the requested tile ids and adds the matching content to a corresponding (DynamoDB) search bucket.

## How?
The lambda will start by extracting the **tile ids** from the event object. (_See the event section_)<br/>
Afterwards it will fetch the content for those ids from an **S3 bucket**.<br/>
_If the content is not found an error will be logged but the process will **continue** for
all the successfully found tiles._

The results (tiles and their content) are currently handled in 2 ways:
1. Stored in dynamodb. (_see dynamodb section_).
2. Pushed to a websocket and s3.

The storage is dynamodb will be replace by the second option completely once we get
everything implemented and tested.

## What?
In order to get data

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

## Dynamodb
The incoming tiles get mapped to a preferred object and get inserted into _**dynamodb**_.

The format of a record looks like this:

| Key | sortKey | value |
| --- | ------- | ----- |
| bucket_id.tile | Unique tile key for this bucket | The tile content |

## invoke.js
An invoke script has been added to execute/test this lambda locally.
