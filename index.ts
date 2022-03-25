import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path'

import { AdminRoute, VendorRoute } from './routes';
import { MONGO_URI } from './config';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/images', express.static(path.join(__dirname, './images')));


app.use('/admin', AdminRoute);
app.use('/vendor', VendorRoute);

mongoose.connect(MONGO_URI)
.then( result => console.log('DB connected'))
.catch(err => console.log(err));


app.listen(8000, () => {
  console.clear()
    console.log('App is listening for the port 8000');
})
