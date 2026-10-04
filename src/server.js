//url=> http://localhost:5000
import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import appRoutes from './routes/appRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'
import bookRoutes from './routes/bookRoutes.js'

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Serves the HTML file from the /public directory
// Tells express to serve all files from the public folder as static assets / file. Any requests for the css files will be resolved to the public directory.
app.use(express.static(path.join(__dirname, '../public')))

// Serving up the HTML file from the /public directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use('/auth', authRoutes)
app.use('/app', authMiddleware, appRoutes)
app.use('/books', authMiddleware, bookRoutes)

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('Server is active on ' + PORT)
    })
}
export default app
