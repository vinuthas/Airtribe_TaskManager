const express = require( 'express' );
const fs = require( 'fs' );
const path = require( 'path' );
const tasksData = require( '../tasks.json' );
const validate = require('./helpers/validate')
const app = express();
app.use( express.json() );

const port = 3000;

app.listen( port, ( err ) =>{
  if ( err ) console.log( "something went wrong" );
  else console.log("server is running")
} );


//Get all tasks
app.get( "/tasks", ( req, res ) => {
  if(tasksData)
    return res.status(200).json( tasksData );
  else return res.status(404).send("Resource not found")
});

//Get task by it's id

app.get( "/task/:id", ( req, res ) =>{
  if (tasksData) {
    let requestedTask = tasksData.filter( task => task.id == req.params.id )
    if(requestedTask.length>0)
      res.status( 200 ).json( requestedTask )
    else
      res.status( 404 ).send( `Sorry!! Requested task with id ${ req.params.id } is not found` )
  } else return res.status(404).send("Resource not found")
});

app.post( "/tasks", ( req, res ) => {
  let taskCreated = {};
  let tasksDataModified = JSON.parse( JSON.stringify(tasksData));
  if ( validate.validateTasks(req.body).valid){
    let writePath = path.join( __dirname, "..", "tasks.json" );
    taskCreated.title = req.body.title;
    taskCreated.status = req.body.status;
    taskCreated.description = req.body.description;
    if(!tasksDataModified) tasksDataModified = []
    tasksDataModified.length == 0 ? taskCreated.id = 1 :
    ( taskCreated.id = tasksDataModified[ tasksDataModified.length - 1 ].id + 1 )
    tasksDataModified.push(taskCreated)
    fs.writeFile( writePath, JSON.stringify(tasksDataModified), { encoding: "utf8", flag: "w" }, ( err, data ) => {
      if(err){
        res.status( 500 ).send( "Something went wrong when creating the task" );
      } else
        return res.status( 200 ).send( "Task created successfully" );
    })
  } else {
    res.status(400).send(`Bad request. Msg ${validate.validateTasks( req.body ).message}`)
  }
});

//PUT /tasks/:id: Update an existing task by its ID.
app.put( "/task/:id", ( req, res ) =>{
  if ( validate.validateTasks( req.body ).valid ){
    for ( let i = 0; i < tasksData.length; i++ ){
      if ( tasksData[ i ].id == req.params.id ){
        tasksData.splice( i, 1,req.body )
        break;
     }
  }
  let writePath = path.join( __dirname, "..", "tasks.json" )
  fs.writeFile( writePath, JSON.stringify(tasksData), { encoding: "utf8", flag: "w" }, ( err, data ) =>{
    if ( err ) { res.status(500).send("Something went wrong when updating the task") }
    else return res.status( 200 ).send( "Task updated successfully" );
  })
  } else
    res.status(400).send(`Bad request. Msg ${validate.validateTasks( req.body ).message}`)
} )

//DELETE /tasks/:id: Delete a task by its ID.
app.delete( "/task/:id", ( req, res ) =>{
  let foundElement = false;
  for ( let i = 0; i < tasksData.length; i++ ){
    if ( tasksData[ i ].id == req.params.id ){
      tasksData.splice( i, 1 );
      foundElement = true;
      break;
    }
  }
  if ( foundElement )
  {
    let writePath = path.join( __dirname, "..", "tasks.json" );
    fs.writeFile( writePath, JSON.stringify( tasksData ), { encoding: "utf8", flag: "w" }, ( err, data ) =>{
      if ( err ){
        res.status( 500 ).send( "Something went wrong when deleting the task" );
      } else
        return res.status( 200 ).send( "Task deleted successfully" );
    });
  } else
    res.status(404).send(`Bad request. Msg task is not available`)
});