import express from 'express';
import user_routers from './routers/user_controller.js';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import exp from 'constants';

const port = 4000;

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));

app.use('/users', user_routers);

export default app;
