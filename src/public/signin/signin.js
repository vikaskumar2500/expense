async function signin(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const res = await axios.post("http://13.235.103.61:3000/user/signin", {
      email,
      password,
    });

    if (res.status !== 200) throw new Error(res.message);
    const authToken = res.data.token;
    localStorage.setItem("jwt_token", authToken);

    e.target.email.value = "";
    e.target.password.value = "";
    window.location.href = "../expenses/expenses.html";
  } catch (e) {
    console.log("frontend index", e);
    const error = document.getElementById("error");
    error.innerText = e.message;
  }
}

let toggle = false;
const toggleButton = (e, refElementId) => {
  const refElement = document.getElementById(refElementId);
  toggle = !toggle;

  refElement.setAttribute("type", toggle ? "text" : "password");
  e.target.textContent = toggle ? "hide" : "view";
};
