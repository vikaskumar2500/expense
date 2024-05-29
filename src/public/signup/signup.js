const signup = async (event) => {
  event.preventDefault();
  const name = event.target.name.value;
  const email = event.target.email.value;
  const password = event.target.password.value;
  console.log("name", name, email, password);

  try {
    const res = await axios.post("http://13.235.103.61:3000/user/signup", {
      name,
      email,
      password,
    });
    const body = res.data;
    if (res.status !== 200) throw new Error(body.message);
    event.target.name.value = "";
    event.target.email.value = "";
    event.target.password.value = "";
    window.location.href = "../signin/signin.html";
  } catch (e) {
    const error = document.getElementById("error");
    error.innerText = e.message;
  }
};
