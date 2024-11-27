const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors'); 
const app = express();
const db = require('./db.config');
const port = 3000;

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended:   
 true }));

// Enable CORS for all routes
app.use(cors());

// Define API endpoint to handle recipe submissions
app.post('/add-recipe', upload.array('rmedia[]'), (req, res) => {
    console.log('Received POST request at /add-recipe');

    const { recipename, ingredients, steps, recipeowner, recipecategory } = req.body;
    const imagePaths = req.files.map(file => file.path);

    // Split the recipe owner's full name (adjust as needed)
    const [firstName, lastName] = recipeowner.split(' ');

    const sql = "INSERT INTO recipes (name, image, ingredients, steps, first_name, last_name, category) VALUES (?, ?, ?, ?, ?, ?, ?)"; // Changed 'procedure' to 'recipe_procedure'
    const values = [recipename, imagePaths.join(','), ingredients, steps, firstName, lastName, recipecategory];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error adding recipe:', err);
            res.status(500).send('Error adding recipe');
            return;
        }
        console.log('Recipe added successfully!');
        res.send('Recipe added successfully!');
    });
});

app.get('/get-recipes', (req, res) => {
    const sql = "SELECT id, name, image FROM recipes"; 

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            res.status(500).send('Error fetching recipes');
            return;
        }
        res.json(results); // Send the fetched recipes as JSON
    });
});

app.get('/get-recipe/:id', (req, res) => {
    const recipeId = req.params.id;
    const sql = "SELECT * FROM recipes WHERE id = ?";

    db.query(sql, [recipeId], (err, result) => {
        if (err) {
            console.error('Error fetching recipe:', err);
            res.status(500).send('Error fetching recipe');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Recipe not found');
        } else {
            res.json(result[0]); // Send the fetched recipe as JSON
        }
    });
});

app.put('/update-recipe/:id', upload.single('updatedImage'), (req, res) => {
    const recipeId = req.params.id;
    const { updatedName, updatedIngredients, updatedSteps, updatedCategory } = req.body;
    let updatedImage = null;
    if (req.file) {
        updatedImage = req.file.path;
    }

    let sql = "UPDATE recipes SET name = ?, ingredients = ?, steps = ?, category = ?";
    const values = [updatedName, updatedIngredients, updatedSteps, updatedCategory];

    if (updatedImage) {
        sql += ", image = ?";
        values.push(updatedImage);
    }

    sql += " WHERE id = ?";
    values.push(recipeId);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating recipe:', err);
            res.status(500).send('Error updating recipe');
            return;
        }
        console.log('Recipe updated successfully!');
        res.send('Recipe updated successfully!');
    });
});


app.delete('/delete-recipe/:id', (req, res) => {
    const recipeId = req.params.id;
    const sql = "DELETE FROM recipes WHERE id = ?";

    db.query(sql, [recipeId], (err, result) => {
        if (err) {
            console.error('Error deleting recipe:', err);
            res.status(500).send('Error deleting recipe');
            return;
        }
        console.log('Recipe deleted successfully!');
        res.send('Recipe deleted successfully!');
    });
});

app.use(express.static(__dirname));

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

