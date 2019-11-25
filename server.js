const express = require('express')
const fs = require('fs')
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser')
const formidable = require('formidable')

var multer = require('multer')
//to save files we use will multer 
// here is configuration that checks which kind of files we want to save 
// for example jpg or png
var upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/jpg|jpeg|png|gif/)) {
            cb(new Error('The File Type is not supported'), false)
            return
        }
        cb(null, true);
    }
})
// to connectio with database
// mongoose.connect("mongodb://127.0.0.1:27017/local", { useNewUrlParser: true })
mongoose.connect("mongodb+srv://cyb:cyb@image-uploads-ip8qh.mongodb.net/test?retryWrites=true&w=majority", { useUnifiedTopology: true })
// here data is parsed with body parser module
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// here is database table  schema
const Image = new mongoose.Schema({
    // to save images in database
    // we will use buffer datatype 
    img: {
        data: Buffer,
        contentType: String
    }
})
const Img = mongoose.model('Image', Image);
// here api to save images
app.post('/upload', upload.single('upload'), (req, res) => {
    var saveImg = new Img();
    //in readFileSync we are providing file path and this function convert data into binary
    saveImg.img.data = fs.readFileSync(req.file.path)
    saveImg.img.contentType = req.file.mimetype;
    saveImg.save((err, data) => {

        if (err) {
            res.send(err)
        }
        else {
            res.send(data)
        }
    })


})
//here api to show all images
app.get('/all-images', (req, res) => {
    Img.find({}, (err, record) => {
        res.send(record)
    })
})
//here api to delete on image 
app.post('/delete', (req, res) => {
    Img.deleteOne({ _id: req.body.id }, (err, result) => {
        if (err) {
            res.send(err)
        }
        else {
            Img.find({}, (err, record) => {
                if (err) {
                    res.send(err)
                }
                else {
                    res.send(record)
                }
            })
        }
    })
})

app.use(express.static("public"))

app.listen(8080, () => {
    console.log("Server is running on 8080");
})