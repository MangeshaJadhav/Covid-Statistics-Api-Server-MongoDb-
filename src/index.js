const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require("./connector");

//here we using aggresion pipeline to handle
/*Aggrestion framework pipelineis array with operator
pipiline=[op1,op2,op3..]no of individual operator
and op2 will work on result of 1 then 3 rd will
work on 2nd result on after another.
1)Group
var data=[ {$group:{_id:"total",//total is name of final document that will created
                  field:{$sum:"$age"},
                  minAge:{$min:$age},
                  maxAge:{$max:$age},
                  avgAge:{$avg:"$age"}
                }//here we pass the field as key and next object as value with opeartor
}]//sum,min,max is operator

*/
//Route:1 : Find total recovered patients of state and UT
app.get("/totalRecovered", async (req, res) => {
  try {
    const data = await connection.aggregate([
      {
        $group: {
          _id: "total",
          recovered: {$sum: "$recovered"},},
      },
    ]);
    res.status(200).json({ data: data[0] });
  } catch (error) {
    res.status(400).json({
      status: "Not found",
      message: error.message,
    });
  }
});

//Route:2 : Here  find total active covid patients by total infected- total recovered
//Here we have to suntract inside sum to get total sum(substarct(infected-recovered))
app.get("/totalActive", async (req, res) => {
  try {
    const data = await connection.aggregate([
      {
        $group: {
          _id: "total",
          active: {$sum: {$subtract: ["$infected", "$recovered"],},},
        },
      },
    ]);
    res.status(200).json({ data: data[0] });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: error.message,
    });
  }
});

//Route:3 : Here tp find total deaths count//value directlty given so sum only
app.get("/totalDeath", async (req, res) => {
  try {
    const data = await connection.aggregate([
      {
        $group: {
          _id: "total",
          death: {$sum: "$death"},
        },
      },
    ]);
    res.status(200).json({ data: data[0] });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: error.message,
    });
  }
});
/*
match will give result of all value matcing with that age
let pipiline=[
    {$match:{"age":18}},
  ]//this will all the document

  let pipeline=[{$match:{"age":18},{l$imit:1}}]
  //this will print only 1 value as limit 1

  let pipeline=[{$match:{"age":18},{$skip:1}}]
  //it skip first then write next all
  
  this above 3 help in paging for website like google searh
  let data=[{
    $match:{"age":10},{$skip:10*pagenumber},{$limit:8}
  }]

  $unwind-first it separate wrt criteria then we match it and group it into one single doc
  let data=[{
    $unwind:"language"
  },{
    $match:{language:/^c/}},
  {$group:{
    _id:"$username",
    favlanguage:{$push:"$language"}
  }}
  ]

  $project:-it allow only field to him
  let data=[{
    $project:{"username":1,"language":1}
  }]
  //it also allow to change the name of the field
  let data=[{
    $project:{"Name of user":username","new language":"language"}
  }]

*/
//Route:4 :hotspotStates:-
//first cal the cases by ((infected - recovered)/infected) 
//so divide then subtract and
//2 condition here $round upto 5th decimal and then gt than 0.1 rate
app.get("/hotspotStates", async (req, res) => {
  try {
    const data = await connection.aggregate([
      {
        $match: {$expr: {$gt: [ { $round: [{ $divide: [
                      {
                        $subtract: ["$infected", "$recovered"],
                      },
                      "$infected",],},5,],}, 0.1,],},
        },
      },
      
      //Another way using project
      // {
      //   $project: {
      //     _id: 0,
      //     state: 1,
      //     rate: {
      //       $round: [{$divide: [
      //             {
      //               $subtract: ["$infected", "$recovered"],
      //             },
      //             "$infected",],},5,],
      //           },
      //   },
      // },
    ]);

    res.json({ data });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "Wrong Query",
      message: error.message,
    });
  }
});

//Route:5 : healthy states
/*
db.monthlyBudget.find( { $expr: { $gt: [ "$spent" , "$budget" ] } } )
expr operator give spent is greater than budget field value
 it also compare the feild in match stage

 healthy state whose mortality value is less than 0.005. 
 mortality value can be calculated as (death/infected),with round

*/
app.get("/healthyStates", async (req, res) => {
  try {
    const data = await connection.aggregate([
      {
        $project: {
          _id: 0,
          state: 1,
          mortality: {
            $round: [
              {
                $divide: ["$death", "$infected"],
              },5,
            ],},
        },
      },
      //Another way
      // {
      //   $match: {
      //     $expr: {$lt: [{
      //           $round: [
      //             {
      //               $divide: ["$death", "$infected"],
      //             },5,
      //           ],},0.005,
      //       ],
      //     },
      //   },
      // },
      
    ]);

    res.json({ data });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failure",
      message: error.message,
    });
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;

// const { MongoClient } = require('mongodb');
// // or as an es module:
// // import { MongoClient } from 'mongodb'

// // Connection URL
// const url = 'mongodb://localhost:27017';
// const client = new MongoClient(url);

// // Database Name
// const dbName = 'myProjectCovidStatics';

// async function main() {
//   // Use connect method to connect to the server
//   await client.connect();
//   console.log('Connected successfully to server');
//   const db = client.db(dbName);
//   const collection = db.collection('documents');

//   // the following code examples can be pasted here...

//   return 'done.';
// }

// main()
//   .then(console.log)
//   .catch(console.error)
//   .finally(() => client.close());
