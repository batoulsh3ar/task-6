const fs = require("fs");
const express = require("express");
const app = express();

app.use(express.json());

const dataFilePath = "data.json";

function readDataFromFile(callback) {
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return callback({ lastId: 0, posts: [] });
    }
    callback(JSON.parse(data));
  });
}

function writeDataToFile(data, callback) {
  fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8", (err) => {
    callback(err);
  });
}

app.get("/users", (req, res) => {
  readDataFromFile((data) => {
    res.send({ data: data.posts });
  });
});

// creat
app.post("/users", (req, res) => {
  readDataFromFile((data) => {
    const { title, description, author } = req.body;

    if (!title || !description || !author) {
      return res.send({
        message: "Title, description, and author fields are required.",
      });
    }

    const newId = data.lastId + 1;

    const newPost = {
      id: newId,
      title,
      description,
      author,
      date: new Date().toISOString(),
    };

    // insert
    data.posts.push(newPost);
    data.lastId = newId;

    writeDataToFile(data, (err) => {
      if (err) {
        return res.send({ message: "Error saving data." });
      }
      res.send({ message: "Post created successfully.", post: newPost });
    });
  });
});

// update
app.put("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  readDataFromFile((data) => {
    const index = data.posts.findIndex((post) => post.id === id);

    if (index === -1) {
      return res.send({ message: "This post does not exist." });
    }

    const { title, description, author } = req.body;

    if (!title && !description && !author) {
      return res.send({
        message:
          "At least one field (title, description, or author) is required for update.",
      });
    }

    if (title) data.posts[index].title = title;
    if (description) data.posts[index].description = description;
    if (author) data.posts[index].author = author;

    writeDataToFile(data, (err) => {
      if (err) {
        return res.send({ message: "Error saving data." });
      }
      res.send({
        message: "Post updated successfully.",
        post: data.posts[index],
      });
    });
  });
});

// delete
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  readDataFromFile((data) => {
    const index = data.posts.findIndex((post) => post.id === id);

    if (index === -1) {
      return res.send({ message: "This post does not exist." });
    }

    const updatedPosts = data.posts.filter((post) => post.id !== id);

    data.posts = updatedPosts; // تحديث قائمة المنشورات

    writeDataToFile(data, (err) => {
      if (err) {
        return res.send({ message: "Error deleting data." });
      }
      res.send({ message: "Post deleted successfully." });
    });
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
