const resetPassword = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.target);

    const otp = formData.get("otp");
    const newPassword = formData.get("newPassword");

    const token = localStorage.getItem("jwt_token");
    await axios.post(
      "http://localhost:3000/password/reset-password",
      { otp, newPassword },
      {
        headers: { Authorization: token },
      }
    );
    alert("Successfully updated your password!✅");
  } catch (e) {
    console.log(e);
    alert(e.message);
  }
};
