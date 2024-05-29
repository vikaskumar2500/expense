const forgotPassword = async (event) => {
  event.preventDefault();
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    return (window.location.href = "../signin/signin.html");
  }
  const button = document.getElementById("submit");

  try {
    const formData = new FormData(event.target);
    const email = formData.get("email");

    button.textContent = "Sending...";
    const res = await axios.post(
      "http://13.235.103.61:3000/password/forgot-password",
      {
        email,
        otp,
      }
    );
    if (res.status !== 200)
      throw new Error("Failed to send OTP on your email address!");

    formData.delete("email");
    alert(
      "OTP and reset link sent!, Please check your email to reset the password."
    );
    window.location.href = "../signin/signin.html";
  } catch (e) {
    const error = document.getElementById("error");
    error.innerText = e.message;
  } finally {
    button.textContent = "Send";
  }
};
