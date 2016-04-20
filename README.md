# Lambda Tile Provider
A lambda function that listens to an SNS topic, checks the requested tile ids and adds the matching content to a corresponding (DynamoDB) search bucket.

## Status
[ ![Codeship Status for numo-labs/lambda-tile-provider](https://codeship.com/projects/a7474ec0-e85f-0133-675c-46bb3aa6b241/status?branch=master)](https://codeship.com/projects/147193)

## _Current_ Content
Currently the content will be passed through in the event until we figure out a **better solution to store the actual content**. Currently we are storing the content inside the tags in our tagging system.

## Event
The incoming event is the same as the schema from [lambda-search-request-handler](https://github.com/numo-labs/lambda-search-request-handler/tree/master/schema).

We Will have the tiles available in the content object.
The tile object will have following format:

```js
{
  ...
  "content": {
    "tiles": [
      {
        "id": "tile:article.12456",
        "type": "article",
        "content": { --depends on the tile-- }
      }
    ]
  }
  ...
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
