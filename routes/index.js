const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/comic');
mongoose.Promise = require("bluebird");

const comicSchema = new Schema({
  label     : { type:String, required:true, unique: true },
  author    : { type:String, required: true },
  version   : { type:Number, default: 1},
  language  : { type:String, default: "English"},
  publisher : [{
                name: {type:String, required:true},
                country:{type: String}
              }],
  date      : { type: Date, default: Date.now }
});

const Comic = mongoose.model("comic", comicSchema);
let getComics;

router.get("/", function(req, res){
      Comic.find().then(function(comics) {   //Find All Books available
      getComics = comics;
      res.redirect("index");
  });
});

router.get("/index", function(req,res){
  res.render("index", {comics:getComics});
});

router.post("/", function(req, res){
  if(req.body.action == "add"){

    let errors = "";
    let messages = [];

    req.checkBody("title", "Please enter book title").notEmpty().isLength({max: 30});
    req.checkBody("author", "Please enter author").notEmpty().isLength({max: 30});
    req.checkBody("publisher", "Please enter publisher name").notEmpty().isLength({max: 50});
    req.checkBody("country", "Please enter country").notEmpty().isLength({max: 30});

      errors = req.validationErrors();
      if(errors) {
          errors.forEach(function(error){
          messages.push(error.msg);
        });
        res.render("/", {errors: messages, comics:getComics});
      }
      else {

      //To add records to Database
        var comic = new Comic({
          label     : req.body.title,
          author    : req.body.author,
        });
        comic.publisher.push({name: req.body.publisher , country: req.body.country});
         comic.save().then(function(Comic) {
           res.redirect("/")
         }).catch(function(err) {
             res.render("/", {errors:err, comics: getComics});
         });
      }
  }
});

router.post("/index/:id/delete",  function(req, res) {
    Comic.findOneAndRemove({_id:req.params.id}, function(err, comics){
      res.redirect("/");
    });
});

module.exports = router;
