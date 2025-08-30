require('dotenv').config()
import {app} from './app.js'
import connectDB from './db/database.js'   



connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000 , () => {
        console.log(`App listening on port  : ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log(`mongodb connnection fail ${error}`)
})
 






