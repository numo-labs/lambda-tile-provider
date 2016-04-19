# Lambda Tile Provider
A lambda function that listens to an SNS topic, checks the requested tile ids and adds the matching content to a corresponding (DynamoDB) search bucket.

## _Current_ Content
Currently the content will be passed through in the event until we figure out a **better solution to store the actual content**. Currently we are storing the content inside the tags in our tagging system.

## Dynamodb
The incoming tiles get mapped to a preferred object and get inserted into _**dynamodb**_.

The format of a record looks like this:

| Key | sortKey | value |
| --- | ------- | ----- |
| bucket_id.tile | Unique tile key for this bucket | The tile content |

## invoke.js
An invoke script has been added to execute/test this lambda locally.
