const express=require("express");
const app=express();
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const date=require(__dirname + '\\date.js');
const _ =require("lodash");

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

app.use(express.static("public"));


const url="mongodb+srv://bprasantpatnaik2002:Prasant@cluster0.snjid1o.mongodb.net/ToDoListdb?retryWrites=true&w=majority"


mongoose.set("strictQuery",true);
mongoose.connect(url).then(()=>
{
  console.log("You have Successfully Setup your mongo db");
}).catch((err)=>{console.log(err)});


const Todo=new mongoose.Schema({
  job:String,
});
const ToDoList=new mongoose.model('TodoList',Todo);

const Task1=new ToDoList({
    job:"Complete Assignment"
})
const Task2=new ToDoList({
    job:"Study Web dev. for 2 hr/day"
})
const Task3=new ToDoList({
    job:"Be Regular with your classes"
})

const tasks=[Task1,Task2,Task3];


const Listschema=mongoose.Schema(
    {
        name:String,
        list:[Todo]
    }
)
const List=new mongoose.model("List",Listschema);



app.get('/',function(req,res)
{
   

   ToDoList.find({}).then(function(data,err){

       
        if(data.length===0)
        {
            ToDoList.insertMany(tasks).then(()=>{
            console.log("You have Successfully inserted the default tasks");
             }).catch((err)=>{console.log(err)});

             res.redirect('/');
        }
        else{
            
            res.render("list",{Heading:"Today",ToDoList:data});
        }
  })
});


app.get("/:newurl",function(req,res)
{
    const newurl=_.capitalize(req.params.newurl);

    List.findOne({name:newurl}).then(function(founditems,err){
        if(!err)
        {
            if(!founditems)
            {
                const NewUrlList=new List({
                    name:newurl,
                    list:tasks
                })
            
                NewUrlList.save();
                res.redirect("/"+ newurl);
            }

            else
            {
                res.render("list",{Heading:newurl,ToDoList:founditems.list})
            }
        }
  })
    
})


app.post("/",function(req,res)
{
        var item=req.body.todo;
        if(req.body.List==="Today"){

            const Task=new ToDoList({
                job:item
            })
            Task.save();
            res.redirect("/");
            res.redirect("/");
        }
        else{
            const Task=new ToDoList({
                job:item
            })
            var names=req.body.List;
            List.findOne({name:names}).then(function(founditems,err){
                if(!err)
                {
                    founditems.list.push(Task);
                    founditems.save();
                    res.redirect("/" + names);
                }      
          })

        }
})

app.post("/delete",function(req,res)
{
    const deletedID=req.body.checkbox;
    const ListName=req.body.HeadingName;

    if(ListName==="Today")
    {
        ToDoList.deleteOne({_id:deletedID})
    .then(updatedDocument => {
      console.log("Deleted document:");
    })
    .catch(error => {
      console.error("Error Deleted document:", error);
    });
    res.redirect("/");
    }

    else{
    List.findOneAndUpdate({name:ListName},{$pull:{list:{_id: deletedID}}}).then(function(foundList,err){

        if(!err)
        {
            res.redirect("/"+ListName);
        }
    })

    }
    
})



app.listen(3000,function(){
    console.log("Your server is listening in port 3000");
})