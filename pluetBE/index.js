
const http = require('http')
const express = require('express')
const morgan = require('morgan')
const { token } = require('morgan')
const cors = require('cors')


const mongoose = require('mongoose')

const url =
  `mongodb+srv://akutervonen:${password}@cluster0.u46f7d1.mongodb.net/personsApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)







let persons = [
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 9948
      },
      {
        "name": "d",
        "number": "5",
        "id": 5
      },
      {
        "name": "spankers!",
        "number": "6",
        "id": 6
      }
]

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(function (tokens, req, res) {
  ret = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms --- '
  ].join(' ')
  if(tokens.method(req,res).toLowerCase() === 'post'){
    return(ret.concat(JSON.stringify(req.body)))
  }
  return (ret)
  }))
app.get('/api/persons' , (req,res) => {

  Person.find({}).then(persons => {
    res.json(persons)
    mongoose.connection.close()
  })
})

app.get('/api/info',   (req,res) => {
    const kontsa = `<p> Phonebook has ${persons.length} people</p> <p>${new Date()}</p>`
    res.send(kontsa)
})

app.get('/api/persons/:id' , (req,res) => {
    i = Number(req.params.id)
    pers = persons.find(p => p.id === i)
    console.log("pers")
    if(pers){
        res.json(pers)
    }else{
        res.status(404).end()
    }
})

app.delete('/api/persons/:id' , (req,res) =>{
    id = Number(req.params.id)
    persons = persons.filter(per => per.id !== id)

    res.status(204).end()
})



app.post('/api/persons' , (req,res) => {
  const bod = req.body
  const id = Math.floor(Math.random()*1000000)
  if(!bod.name){
    return(res.status(400).json({'error':"nimi puuttuu"}))
  }else if(!bod.number){
      return(res.status(400).json({'error':"number puuttuu"}))
  }else if(persons.find(pers => pers.name === bod.name)){
      return(res.status(400).json({'error':"nimi löytyy jo!"}))
  }
  pers = {
    name:bod.name,
    number:bod.number,
    id:id
  }
  persons = persons.concat(pers)
  res.json(pers)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})