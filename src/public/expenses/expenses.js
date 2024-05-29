let limit = 10;
let offset = 0;
let count = 0;

addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    window.location.href = "../signin/signin.html";
    return; 
  }

  let isPremium = false;
  let s3Data = [];
  try {
    const isPremiumRes = await axios(
      "http://13.235.103.61:3000/expenses/is-premium",
      { headers: { Authorization: token } }
    );
    console.log("premium", isPremiumRes.data);
    isPremium = isPremiumRes.data === true ? true : false;
  } catch (e) {
    console.log(e.message);
  }

  try {
    const s3Res = await axios("http://13.235.103.61:3000/expenses/s3", {
      headers: { Authorization: token },
    });
    s3Data = s3Res.data;
  } catch (e) {
    console.log(e.message);
  }

  try {
    await getExpenses(1);

    const getPremiumButton = document.getElementById("rzp-button1");
    const premium = document.getElementById("premium");
    const downloadExpense = document.getElementById("downloadexpense");
    const downloadedFilesContainer = document.getElementById(
      "downloaded-files-container"
    );
    if (isPremium) {
      getPremiumButton.classList.add("hidden");
      premium.classList.remove("hidden");
      downloadExpense.classList.remove("hidden");
      downloadedFilesContainer.classList.remove("hidden");
    }

    // downloaded files
    const ol = document.getElementById("downloaded-files");

    for (let i = 0; i < s3Data.length; i++) {
      const li = document.createElement("li");
      li.style =
        "display:flex; align-items: center; border:1px solid whitesmoke; border-radius:8px; width:90%;";
      li.innerHTML = `
        <div style="display:flex; align-items:start; width:100%; justify-content: space-between; padding:10px; gap:5px;">
          <span style="font-weight:300; font-size:18px">File${i + 1}</span>
          <span style="font-size:18px; font-weight:500;">${s3Data[i].date
            ?.split("_")
            ?.join(" ")}</span>
          <a download href=${
            s3Data[i].url
          } style="cursor:pointer" type='button'>Download Expenses</a>
        </div>
	    `;

      ol.appendChild(li);
    }
  } catch (e) {
    console.log("error", e.message);
    alert(e.message);
  }
});

const getExpenses = async (page) => {
  const token = localStorage.getItem("jwt_token");
  const limit = +localStorage.getItem("limit") || 10;
  if (!token) {
    window.location.href = "../signin/signin.html";
    return;
  }
  try {
    const expenseRes = await axios(
      `http://13.235.103.61:3000/expenses?limit=${limit}&page=${page}`,
      {
        headers: { Authorization: token },
      }
    );

    await getExpenseList(expenseRes.data.expenses);
    await showPagination(expenseRes.data.pagination);
  } catch (e) {
    console.log("e.message", e.message);
  }
};

const getExpenseList = async (expenses) => {
  const expenseList = document.getElementById("expense-list-container");

  const ul = document.createElement("ul");

  ul.style =
    "display:flex; flex-direction:column; align-items:start; gap:5px; height:20rem;overflow-y: scroll; width:100%; margin:20px";

  if (expenses.length === 0) {
    ul.innerHTML = `
        <span id="not-found" style="max-width:40rem">Expenses not found!</span>
      `;
    return;
  }

  for (let i = 0; i < expenses.length; i++) {
    const li = addLiItem(expenses[i]);
    ul.appendChild(li);
  }
  expenseList.replaceChildren(ul);
};

const pagination = document.getElementById("pagination");

const showPagination = async ({ next, prev, hasNext, hasPrev, last, curr }) => {
  pagination.innerHTML = ``;
  if (hasPrev) {
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = `<span>${prev}</span>`;
    prevBtn.addEventListener("click", async () => await getExpenses(prev));
    pagination.appendChild(prevBtn);
  }
  const currBtn = document.createElement("button");
  currBtn.style =
    "border:2px solid black; padding:5px; padding-inline:8px; border-radius:5px";
  currBtn.innerHTML = `<span style="font-weight:600;border:2px">${curr} <span>`;
  currBtn.addEventListener("click", () => getExpenses(curr));
  pagination.appendChild(currBtn);

  if (hasNext && hasNext < last) {
    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = `<span>${next}</span>`;
    nextBtn.addEventListener("click", () => getExpenses(next));
    pagination.appendChild(nextBtn);
  }
};

const dynamicPagination = async (e) => {
  e.preventDefault();
  localStorage.setItem("limit", e.target.value);
  await getExpenses(1);
};

async function addExpense(e) {
  e.preventDefault();
  const amount = e.target.amount.value;
  const description = e.target.description.value;
  const category = e.target.category.value;
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    alert("Something went wrong, Please login again!");
    window.location.href = "../signin/signin.js";
    return;
  }
  try {
    const res = await axios.post(
      "http://13.235.103.61:3000/expenses/add-expense",
      {
        amount,
        description,
        category,
        token,
      }
    );
    if (res.status !== 200) throw new Error(res.data.message);

    const notFound = document.getElementById("not-found");
    if (notFound) {
      notFound.classList.add("hidden");
    }
    const list = document.getElementById(`ul${count}`);

    const li = addLiItem({ category, description, amount });
    list.appendChild(li);

    e.target.amount.value = "";
    e.target.description.value = "";
    e.target.category.value = "";
  } catch (error) {
    console.error(error.message);
  }
}

const addLiItem = ({ id, category, description, amount }) => {
  const li = document.createElement("li");
  li.id = `expense${id}`;
  li.style =
    "display:flex; align-items: center; border:1px solid whitesmoke; border-radius:8px; max-width:40rem; padding:0px 20px 0px 20px";
  li.innerHTML = `
		<div style="display:flex; align-items:start; width:100%; justify-content: space-between; padding:10px; gap:5px;">
			<span style="font-size:18px; font-weight:500;">${amount} - ${category} - ${description}</span>
      <button id='delete' value=${id} onclick="deleteExpenses(event)" style="cursor:pointer" type='button'>Delete Expense</button>
		</div>
	`;
  return li;
};

document.getElementById("rzp-button1").onclick = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("jwt_token");
    const res = await axios.post("http://13.235.103.61:3000/expenses/orders", {
      amount: 2500,
      currency: "INR",
      token,
    });

    const data = res.data;

    var options = {
      key: data.keyId,
      name: "Expense Tracker",
      description: "Get Premium for better use!",
      order_id: data.orderId,
      handler: async (response) => {
        try {
          await axios.post(
            "http://13.235.103.61:3000/expenses/payment-captured",
            {
              orderId: data.orderId,
              paymentId: response.razorpay_payment_id,
              token: token,
            }
          );
          alert("You are now a premium user!");
        } catch (e) {
          console.log("successful error?", e.message);
        }
      },
    };
    var rzp = new Razorpay(options);
    rzp.open();

    rzp.on("payment.failed", async () => {
      try {
        await axios.post("http://13.235.103.61:3000/expenses/payment-failed", {
          orderId: data.orderId,
          token: token,
        });
      } catch (e) {
        console.log(e.message);
      }
    });
  } catch (e) {
    console.log(e);
  }
};

const showLeaderboard = async () => {
  try {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      window.location.href = "../signin/signin.html";
      return;
    }

    const res = await axios(
      "http://13.235.103.61:3000/premium/show-leaderboard",
      {
        headers: { Authorization: token },
      }
    );

    const data = res.data;

    const leaderboard = document.getElementById("show-leaderboard");
    if (data.length === 0) {
      leaderboard.innerHTML = `<span> No expenses added yet! </span>`;
      return;
    }

    const h1 = document.createElement("h1");
    h1.textContent = "Leaderboard";
    const ul = document.createElement("ul");
    const hasChild = leaderboard.hasChildNodes();
    if (hasChild) {
      leaderboard.removeChild(leaderboard.firstChild);
      leaderboard.removeChild(leaderboard.lastChild);
    }

    ul.style = `height:20rem; overflow-y:scroll`;
    for (let i = 0; i < data.length; i++) {
      const li = document.createElement("li");
      li.style = "display:flex; align-items:start; padding:10px";
      li.innerHTML = `
        <span style="font-size:18px; font-weight:500">Name: ${data[i].name} - Total expenses: ${data[i].total_expenses}</span>
      `;
      ul.appendChild(li);
    }
    if (!hasChild) {
      leaderboard.appendChild(h1);
      leaderboard.appendChild(ul);
    }
  } catch (e) {
    console.log(e);
  }
};

const deleteExpenses = async (event) => {
  event.preventDefault();
  const id = event.target.value;
  const token = localStorage.getItem("jwt_token");
  try {
    const res = await axios.post(
      `http://13.235.103.61:3000/expenses/delete/${id}`,
      { token }
    );
    if (res.status !== 200) throw new Error("Something went wrong");
    const expense = document.getElementById(`expense${id}`);
    expense.remove();
  } catch (e) {
    console.log(e);
  }
};

const download = async () => {
  const token = localStorage.getItem("jwt_token");
  try {
    const res = await axios.get("http://13.235.103.61:3000/expenses/download", {
      headers: { Authorization: token },
    });
    if (res.status !== 200)
      throw new Error("Something went wrong, try again later!");
    const link = document.createElement("a");
    link.href = res.data.url;
    link.setAttribute("download", "expenses-data.csv");
    document.body.appendChild(link);
    link.click();
  } catch (e) {
    console.log(e.message);
  }
};
