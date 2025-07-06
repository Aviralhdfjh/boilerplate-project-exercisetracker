const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

// In-memory storage as fallback
let users = []
let exercises = []
let useInMemory = false

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exercise-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB')
}).catch(err => {
  console.error('MongoDB connection error:', err.message)
  console.log('Falling back to in-memory storage (data will not persist)')
  useInMemory = true
})

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
})

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)

// Helper functions for in-memory storage
function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body
    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    if (useInMemory) {
      const user = { username, _id: generateId() }
      users.push(user)
      res.json({ username: user.username, _id: user._id })
    } else {
      const user = new User({ username })
      const savedUser = await user.save()
      res.json({ username: savedUser.username, _id: savedUser._id })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    if (useInMemory) {
      res.json(users.map(user => ({ username: user.username, _id: user._id })))
    } else {
      const users = await User.find({}, 'username _id')
      res.json(users)
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add exercise to user
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params
    const { description, duration, date } = req.body

    if (!description || !duration) {
      return res.status(400).json({ error: 'Description and duration are required' })
    }

    if (useInMemory) {
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
    } else {
      const user = await User.findById(_id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const exerciseDate = date ? new Date(date) : new Date()
      
      const exercise = new Exercise({
        userId: _id,
        description,
        duration: parseInt(duration),
        date: exerciseDate
      })

      const savedExercise = await exercise.save()

      res.json({
        username: user.username,
        description: savedExercise.description,
        duration: savedExercise.duration,
        date: savedExercise.date.toDateString(),
        _id: user._id
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params
    const { from, to, limit } = req.query

    if (useInMemory) {
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
    } else {
      const user = await User.findById(_id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      let filter = { userId: _id }
      
      if (from || to) {
        filter.date = {}
        if (from) filter.date.$gte = new Date(from)
        if (to) filter.date.$lte = new Date(to)
      }

      let query = Exercise.find(filter).select('description duration date -_id')
      
      if (limit) {
        query = query.limit(parseInt(limit))
      }

      const exercises = await query.exec()
      
      const log = exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }))

      res.json({
        username: user.username,
        count: exercises.length,
        _id: user._id,
        log
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
