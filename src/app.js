import express from 'express';

import user_routers from './routers/user_controller.js';
import customer_routers from './routers/customer_controller.js';
import purchase_routers from './routers/purchase_controller.js';
import rewards_routers from './routers/rewards_controller.js';
//import report_routers from './routers/report_controller.js';  

import cookieParser from 'cookie-parser';
import logger from 'morgan';
import exp from 'constants';
import cors from 'cors'

const port = 4000;

var app = express();

const corsOptions = {
    origin: 'http://localhost:3000', // Your React app's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies, authorization headers, etc)
    optionsSuccessStatus: 200
  };

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));

app.use('/users', user_routers);
app.use('/customers', customer_routers);
app.use('/purchases', purchase_routers);
app.use('/rewards', rewards_routers);

// app.use('/reports', report_routers);



export default app;
