import express from 'express';
import { AdminRoute, VendorRoute } from './routes';

const app = express();

app.use('/admin', AdminRoute);
app.use('/vendor', VendorRoute);

app.listen(8000, () => {
  console.clear()
    console.log('App is listening for the port 8000');
})
