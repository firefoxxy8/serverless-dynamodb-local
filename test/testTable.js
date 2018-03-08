"use strict";
//Define the modules required to mocha testing
const assert = require("chai").assert;
const http = require ("http");
const expect = require("chai").expect;
const should = require("should");
const aws = require ("aws-sdk");
const dynamodbLocal = require("../index.js");

aws.config.update({ accessKeyId: "localAccessKey", secretAccessKey: "localSecretAccessKey", region: "localRegion"});
var db = new aws.DynamoDB({ endpoint: 'http://localhost:8000' });

describe("Check Table operations", function() {
  describe("#update table", function(){
    this.timeout(50000);
    it("should update the table", function(done){
      var params = {
          "AttributeDefinitions": [ 
              { 
                "AttributeName": "batch",
                "AttributeType": "N"
              }
          ],   
          "ProvisionedThroughput": { 
              "ReadCapacityUnits": 10,
              "WriteCapacityUnits": 10
          },
          "TableName": "Movies"
        }
 
    db.updateTable(params,function(err,data){
        if (err){
            should.not.exist(data);
        } else {
            data.TableDescription.should.have.property("TableName","Movies");
            should.exist(data);
        }
        done();
      });
    });
  });
  describe("queue-handler", function() {
    this.timeout(50000);
      var params = {
        TableName: 'example_table',
        KeySchema: [ // The type of of schema.  Must start with a HASH type, with an optional second RANGE.
            { // Required HASH type attribute
                AttributeName: 'hash_key_attribute_name',
                KeyType: 'HASH',
            }    
        ],
        AttributeDefinitions: [ // The names and types of all primary and index key attributes only
            {
                AttributeName: 'hash_key_attribute_name',
                AttributeType: 'S', // (S | N | B) for string, number, binary
            }   
        ],
        ProvisionedThroughput: { // required provisioned throughput for the table
            ReadCapacityUnits: 1, 
            WriteCapacityUnits: 1, 
        },
        GlobalSecondaryIndexes: [ // optional (list of GlobalSecondaryIndex)
            { 
                IndexName: 'index_name_1', 
                KeySchema: [
                    { // Required HASH type attribute
                        AttributeName: 'index_hash_key_attribute_name_1',
                        KeyType: 'HASH',
                    },
                    { // Optional RANGE key type for HASH + RANGE secondary indexes
                        AttributeName: 'index_range_key_attribute_name_1', 
                        KeyType: 'RANGE', 
                    }
                ],
                Projection: { // attributes to project into the index
                    ProjectionType: 'INCLUDE', // (ALL | KEYS_ONLY | INCLUDE)
                    NonKeyAttributes: [ // required / allowed only for INCLUDE
                        'attribute_name_1',
                    ],
                },
                ProvisionedThroughput: { // throughput to provision to the index
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1,
                },
            },
        ],
        LocalSecondaryIndexes: [ // optional (list of LocalSecondaryIndex)
            { 
                IndexName: 'index_name_2',
                KeySchema: [ 
                    { // Required HASH type attribute - must match the table's HASH key attribute name
                        AttributeName: 'hash_key_attribute_name',
                        KeyType: 'HASH',
                    },
                    { // alternate RANGE key attribute for the secondary index
                        AttributeName: 'index_range_key_attribute_name_2', 
                        KeyType: 'RANGE', 
                    }
                ],
                Projection: { // required
                    ProjectionType: 'INCLUDE', // (ALL | KEYS_ONLY | INCLUDE)
                    NonKeyAttributes: [ // required / allowed only for INCLUDE
                        'attribute_name_1',
                        // ... more attribute names ...
                    ],
                },
            },
        ],
    };
    it("should connect to dynamodb and list tables", function(done) {
      db.listTables({}, function(err, data) {
        if(err){
            should.exist(err);
        } else {
            should.exist(data);
        }
        done();     
        });
    });
  });

  describe("#getItems", function() {
    this.timeout(50000);
    var tableDes = db.getItem({"TableName": "Movies"})
    it("Retrieve hostname from created tables", function() {
      assert.equal(tableDes.httpRequest.endpoint.hostname,"localhost");
    });
    
    it("Retrieves the path of the table",function(){
      assert.equal(tableDes.httpRequest.path, "/");
    });
  });
});
