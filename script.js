// CLIENT SIDE LOGIC

// get stored data
let storedToken = localStorage.getItem("jwtToken");
let storedUsername = localStorage.getItem("username");

// set the username in the HTML
const usernameElement = document.querySelector(".username");
usernameElement.textContent = storedUsername;

// Load page and event listeners
document.addEventListener("DOMContentLoaded", () => {
  // url from the browser
  const baseUrl = window.location.origin;
  fetchPosts(baseUrl);

  // allowing admin privleges
  if (storedToken) {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole == "admin") {
      showAdminFeatures();
    }
  }

  // creating new post
  const form = document.querySelector("#new-post-form");
  if (form) {
    form.addEventListener("submit", (event) => createPost(event, baseUrl));
  }

  // login
  const loginForm = document.querySelector("#login-form");
  loginForm.addEventListener("submit", (event) => loginUser(event, baseUrl));

  // register
  const registerForm = document.querySelector("#register-form");
  registerForm.addEventListener("submit", (event) =>
    registerUser(event, baseUrl)
  );
});
//

// post detail
const postDetailContainer = document.querySelector("#post-details-container");

/** an event listener that executes when the window finishes loading (window.addEventListener("load", ...)). It extracts query parameters from the URL using URLSearchParams, specifically the parameter named "post". If the "post" parameter exists in the URL, it stores its value in the postId variable. If postId has a value (i.e., if it exists), the showPostDetail function is called, likely to display details related to that specific post.  */
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("post");
  if (postId) {
    showPostDetail(postId);
  }
});

/*
This code fetches post data from the server using a GET request and dynamically generates HTML representations for each post. It then updates the web page by replacing the content of a specific HTML element (postList) with these post structures. The generated HTML mimics the appearance of posts and includes details like titles and authors. The code also handles the visibility of certain buttons based on the user's role. 
*/
async function fetchPosts(baseUrl) {
  // when we use fetch method , its sends a GET request to server.
  /** basically whats happening here is we are requesting server for posts via fetch and on server we have route handler for posts, it send back all the posts  */
  const res = await fetch(`${baseUrl}/posts`);
  const data = await res.json();
  const postList = document.querySelector("#posts-list");

  const isAdmin = localStorage.getItem("userRole") === "admin";

  if (postList) {
    /*
      This code dynamically creates and displays post structures on the web page based on data received from the server. */
    postList.innerHTML = data
      .map((post, index) => {
        const deleteButtonStyle = isAdmin ? "" : "display:none";
        const updateButtonStyle = isAdmin ? "" : "display:none";
        return `
            <div id="${post._id}" class="post">
                <img src="${post.imageUrl}" alt="blog-img" id="detail-post-img">
                <div class="post-title">
                    ${
                      index === 0
                        ? `<h1><a href="/posts/${post._id}">${post.title}</a></h1>`
                        : `<h3><a href="/posts/${post._id}">${post.title}</a></h3>`
                    }
                </div>
                ${
                  index === 0
                    ? `<span>
                        <p>${post.author}</p>
                        <p>${post.timestamp}</p>
                    </span>`
                    : ""
                }
                <div id="admin-buttons">
                    <button class="btn" style="${deleteButtonStyle}" onclick="deletePost('${
          post._id
        }', '${baseUrl}')">Delete</button>
                    <button class="btn" style="${updateButtonStyle}" onclick="showUpdateForm('${
          post._id
        }', '${post.title}', '${post.content}')">Update</button>
                </div>
                ${index === 0 ? `<hr>` : ""}
                ${index === 0 ? "<h2>All Articles</h2>" : ""}
            </div>
        `;
      })
      .join("");
  }
}
/************************************************************************************** */

// create post
async function createPost(event, baseUrl) {
  event.preventDefault();

  // variables for html elements(for posts)
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const imageUrlInput = document.getElementById("image-url");

  // Get the values from the input fields
  const title = titleInput.value;
  const content = contentInput.value;
  const imageUrl = imageUrlInput.value;

  // enusre that they are not empty
  if (!title || !content || !imageUrl) {
    alert("Please fill in all fields .");
    return;
  }

  const newPost = {
    title,
    content,
    imageUrl,
    author: storedUsername,
    timestamp: new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  /**
   * Defined the headers for the HTTP request with the necessary information, such as the content type and authorization token, and then created a request configuration object (requestOptions) that specifies the details of the request, including the HTTP method (POST), headers, and the JSON data to be sent in the request body. This allows you to send a POST request to the server with the required data and headers for processing.
   */

  const headers = new Headers({
    "Content-type": `application/json`,
    Authorization: `Bearer ${storedToken}`,
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(newPost),
  };

  //
  try {
    const response = await fetch(`${baseUrl}/posts`, requestOptions);
    if (!response.ok) {
      const storedRole = localStorage.getItem("userRole");
      console.log(`Error creating the post: HTTP Status ${response.status}`);
    } else {
      // clear the input data
      titleInput.value = "";
      contentInput.value = "";
      imageUrlInput.value = "";
      alert("Create post successful!");
    }
  } catch (Error) {
    console.error("An error occured during the fetch:", Error);
    alert("Create Post Failed");
  }
  fetchPosts(baseUrl);
}
/************************************************************************************** */

//delete post

/*This function takes two arguments: url and postId and sends a DELETE request to the URL with the postId included. It also includes an authorization header with the storedToken, which is a JWT. Inside a try-catch block, it handles the response and displays a success or failure message accordingly.*/
async function deletePost(postId, baseUrl) {
  const deleteUrl = `${baseUrl}/posts/${postId}`;
  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    });
    if (response.ok) {
      alert("Post delete successful");
    } else {
      alert("Post delete failed");
    }
  } catch (Error) {
    console.error("Error in deleting Post:", Error);
    alert("Post delete failed");
  }
}
/************************************************************************************** */

// show update form option
/*
This function is responsible for creating the user interface (UI) elements where users can enter new data for updating a post. It doesn't handle the actual update of the data in the database but rather prepares the form and sets up an event listener for submission. The actual update functionality is implemented in the updatePost function, which is called when the form is submitted.
 */
function showUpdateForm(postId, title, content) {
  const updateForm = `
   <form id="update-form">
        <input type="text" id="update-title" value="${title}" />
        <textarea id="update-content">${content}</textarea>
        <button type="submit">Update post</button>
    </form>
  `;

  const postElement = document.getElementById(postId);
  postElement.innerHTML += updateForm;

  const form = document.getElementById("update-form");
  form.addEventListener("submit", (event) => updatePost(event, postId));
}
/************************************************************************************** */

// actual updatePost method
async function updatePost(event, postId) {
  event.preventDefault();
  const title = document.getElementById("update-title").value;
  const content = document.getElementById("update-content").value;
  const baseUrl = window.location.origin;

  // ensure that inputs are not empty
  if (!title || !content) {
    alert("Please fill in all fields 2.");
    return;
  }

  const updatedPost = {
    title,
    content,
  };
  try {
    const response = await fetch(`${baseUrl}/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify(updatedPost),
    });

    if (response.ok) {
      alert("Update post successful!");
      fetchPosts(baseUrl);
    } else {
      alert("Update post failed.");
    }
  } catch (error) {
    console.error("An error occured during the fetch", error);
    alert("Update post failed.");
  }
}
/************************************************************************************** */

// /////////////////////////////////////////////////////////////////////////////////////////////////////
// Register user
async function registerUser(event, baseUrl) {
  event.preventDefault();
  const usernameInput = document.getElementById("register-username");
  const passwordInput = document.getElementById("register-password");
  const roleInput = document.getElementById("register-role");

  const username = usernameInput.value;
  const password = passwordInput.value;
  const role = roleInput.value;

  // ensure that inputs are not empty
  if (!username || !password || !role) {
    alert("Please fill in all fields 3.");
    return;
  }

  const newUser = {
    username,
    password,
    role,
  };

  const res = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });

  const data = await res.json();

  if (data.success) {
    alert("Registered successful!");
    // Clear input fields
    usernameInput.value = "";
    passwordInput.value = "";
    roleInput.value = "";
  } else {
    alert("Registration failed.");
  }
}
/************************************************************************************** */

// Loging user
async function loginUser(event, baseUrl) {
  event.preventDefault();
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const username = usernameInput.value;
  const password = passwordInput.value;

  if (!username || !password) {
    alert("Please fill in all fields 4.");
    return;
  }

  const user = {
    username,
    password,
  };
  const res = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem("jwtToken", data.token);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("username", username);

    // Close the hamburge menu if open
    linksContainer.classList.toggle("active");
    hamburger.classList.toggle("active");

    // Clear input fields
    usernameInput.value = "";
    passwordInput.value = "";

    location.reload();

    if (data.role === "admin") {
      showAdminFeatures();
    }
  } else {
    alert("Login failed.");
  }
}
/************************************************************************************** */

// Admin features
function showAdminFeatures() {
  const newPostDiv = document.getElementById("new-post-div");
  if (newPostDiv) {
    newPostDiv.style.display = "flex";
  }

  const allBtns = document.querySelectorAll(".btn");
  allBtns.forEach((btn) => {
    if (btn) {
      btn.style.display = "block";
    }
  });
}

/************************************************************************************** */
// Logout
document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = window.location.origin;
  const registerDiv = document.getElementById("register-div");
  const loginDiv = document.getElementById("login-div");
  const logoutDiv = document.getElementById("logout-div");
  const logoutButton = document.getElementById("logout-button");

  if (storedToken) {
    registerDiv.style.display = "none";
    loginDiv.style.display = "none";
    logoutDiv.style.display = "flex";
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      location.reload();
    });
  } else {
    registerDiv.style.display = "flex";
    loginDiv.style.display = "flex";
    logoutDiv.style.display = "none";
  }
});
