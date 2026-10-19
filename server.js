import app from "./src/app.js";
import { connect_db } from "./src/config/db.js";

const port = 3006;
try {
    connect_db();
    app.listen(port, () => {
        console.log(`server is running on ${port}`);
    });
} catch (error) {
    console.log(error.message);
}
