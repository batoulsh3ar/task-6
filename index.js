const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const getData = () => {
  const data = fs.readFileSync("data.json");
  return JSON.parse(data);
};

const saveData = (data) => {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
};

// read
app.get("/posts", (req, res) => {
  const data = getData();
  res.json(data.posts);
});

// create
app.post("/posts", (req, res) => {
  const data = getData();
  const newPost = {
    id: data.lastId + 1,
    title: req.body.title,
    description: req.body.description,
    author: req.body.author,
    date: new Date().toISOString(),
  };

  data.posts.push(newPost);
  data.lastId += 1;
  saveData(data);

  res.status(201).json(newPost);
});

// update
app.put("/posts/:id", (req, res) => {
  const data = getData();
  const postId = parseInt(req.params.id);
  const postIndex = data.posts.findIndex((post) => post.id === postId);

  if (postIndex !== -1) {
    data.posts[postIndex] = { ...data.posts[postIndex], ...req.body };
    saveData(data);
    res.json(data.posts[postIndex]);
  } else {
    res.send({ message: "Post not found" });
  }
});

// delete
app.delete("/posts/:id", (req, res) => {
  const data = getData();
  const postId = parseInt(req.params.id);
  const updatedPosts = data.posts.filter((post) => post.id !== postId);

  if (updatedPosts.length !== data.posts.length) {
    data.posts = updatedPosts;
    saveData(data);
    res.json({ message: "Post deleted" });
  } else {
    res.send({ message: "Post not found" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
