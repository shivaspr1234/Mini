require("dotenv").config();
const express = require('express');
const UserRouter = require('./routers/UserRouter');
const AlumniRouter = require('./routers/AlumniRouter');
const ConnectionRouter = require("./routers/ConnectionRouter");
const MessageRouter = require("./routers/MessageRouter");
const EventRouter = require("./routers/EventRouter");
const JobRouter = require("./routers/JobRouter");
const MentorshipRouter = require("./routers/MentorshipRouter");
const cors = require('cors');

require('./connection');
const app = express();

const port = 5000;

// middleware
app.use(cors({

     origin:['http://localhost:3000']   // for adding backend toothe frontend
}));

app.use(express.json());
app.use('/user', UserRouter);
app.use('/alumni', AlumniRouter);
app.use("/connection", ConnectionRouter);
app.use("/message", MessageRouter);
app.use("/event", EventRouter);
app.use("/job", JobRouter);
app.use("/api/mentorship", MentorshipRouter);
// endpoint or route
app.get('/', (req, res) => {
     res.send('response from express');

});

app.get('/add', (req, res) => {
     res.send('response from add');
});
// getall
// update
// delete

app.listen(port, () => {
     console.log('server started');

});