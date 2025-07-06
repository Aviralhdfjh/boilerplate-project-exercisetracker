// Test script to verify the exercise tracker functionality
const express = require('express')
const app = express()
const cors = require('cors')

// Simple test without MongoDB
console.log('Testing Express setup...')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// In-memory storage for testing
let users = []
let exercises = []

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Test endpoints
app.post('/api/users', (req, res) => {
  const { username } = req.body
  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }

  const user = { username, _id: generateId() }
  users.push(user)
  res.json({ username: user.username, _id: user._id })
})

app.get('/api/users', (req, res) => {
  res.json(users.map(user => ({ username: user.username, _id: user._id })))
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' })
  }

  const user = users.find(u => u._id === _id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const exerciseDate = date ? new Date(date) : new Date()
  const exercise = {
    _id: generateId(),
    userId: _id,
    description,
    duration: parseInt(duration),
    date: exerciseDate
  }

  exercises.push(exercise)

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query

  const user = users.find(u => u._id === _id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  let userExercises = exercises.filter(ex => ex.userId === _id)
  
  if (from) {
    const fromDate = new Date(from)
    userExercises = userExercises.filter(ex => ex.date >= fromDate)
  }
  
  if (to) {
    const toDate = new Date(to)
    userExercises = userExercises.filter(ex => ex.date <= toDate)
  }
  
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit))
  }

  const log = userExercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }))

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log
  })
})

const port = 3000
app.listen(port, () => {
  console.log(`Exercise tracker test server running on port ${port}`)
  console.log('Test the API by visiting:')
  console.log(`- POST http://localhost:${port}/api/users`)
  console.log(`- GET http://localhost:${port}/api/users`)
  console.log(`- POST http://localhost:${port}/api/users/:_id/exercises`)
  console.log(`- GET http://localhost:${port}/api/users/:_id/logs`)
})
